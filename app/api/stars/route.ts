import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // IDs dos usuários especiais com bypass de estrelas infinitas (do .env)
    const SPECIAL_USER_IDS = [
      process.env.NEXT_PUBLIC_WATSON_USER_ID,
      process.env.NEXT_PUBLIC_MATHEUS_USER_ID
    ].filter(Boolean)

    // Verificar se o usuário tem bypass de estrelas infinitas
    const hasInfiniteStars = SPECIAL_USER_IDS.includes(user.id)

    if (hasInfiniteStars) {
      // Para usuários especiais, retornar estrelas infinitas
      const resetDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
      return NextResponse.json({
        available: 999, // Estrelas infinitas
        used: 0,
        resetDate: resetDate.toISOString()
      })
    }

    // Para usuários normais, calcular estrelas normalmente
    const currentDate = new Date()
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    const { data: stars, error } = await supabase
      .from('user_stars')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString())

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar estrelas' }, { status: 500 })
    }

    const used = stars?.length || 0
    const available = 3 - used
    const resetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)

    return NextResponse.json({
      available,
      used,
      resetDate: resetDate.toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { recipientId, reason, message } = await request.json()

    if (!recipientId || !reason || !message) {
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 })
    }

    // Impedir que o usuário dê estrela para si mesmo
    if (recipientId === user.id) {
      return NextResponse.json({ error: 'Você não pode dar estrela para si mesmo' }, { status: 400 })
    }

    // Verificar se o recipient existe
    const { data: recipient, error: recipientError } = await supabase
      .from('employees')
      .select('id')
      .eq('id', recipientId)
      .single()

    if (recipientError || !recipient) {
      return NextResponse.json({ error: 'Destinatário não encontrado' }, { status: 400 })
    }

    // IDs dos usuários especiais com bypass de estrelas infinitas (do .env)
    const SPECIAL_USER_IDS = [
      process.env.NEXT_PUBLIC_WATSON_USER_ID,
      process.env.NEXT_PUBLIC_MATHEUS_USER_ID
    ].filter(Boolean)

    // Verificar se o usuário tem bypass de estrelas infinitas
    const hasInfiniteStars = SPECIAL_USER_IDS.includes(user.id)

    // Verificar se o usuário ainda tem estrelas disponíveis (apenas para usuários normais)
    if (!hasInfiniteStars) {
      const currentDate = new Date()
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const { data: existingStars, error: starsError } = await supabase
        .from('user_stars')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString())

      if (starsError) {
        return NextResponse.json({ error: 'Erro ao verificar estrelas' }, { status: 500 })
      }

      if (existingStars && existingStars.length >= 3) {
        return NextResponse.json({ error: 'Você já usou todas as suas estrelas este mês' }, { status: 400 })
      }
    }

    // Criar a estrela
    const { data: star, error: createError } = await supabase
      .from('user_stars')
      .insert({
        user_id: user.id,
        recipient_id: recipientId,
        reason,
        message,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any)
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar estrela:', createError)
      return NextResponse.json({ 
        error: 'Erro ao criar estrela', 
        details: createError.message 
      }, { status: 500 })
    }

    // Calcular estrelas restantes
    let remaining = 0
    if (hasInfiniteStars) {
      remaining = 999 // Estrelas infinitas para usuários especiais
    } else {
      const currentDate = new Date()
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const { data: updatedStars } = await supabase
        .from('user_stars')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString())

      remaining = 3 - (updatedStars?.length || 0)
    }

    return NextResponse.json({ 
      success: true, 
      star,
      remaining
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
