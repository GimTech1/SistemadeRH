import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar estrelas do usuário para o mês atual
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
    const supabase = createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { recipientId, reason, message } = await request.json()

    if (!recipientId || !reason || !message) {
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 })
    }

    // Verificar se o usuário ainda tem estrelas disponíveis
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

    // Criar a estrela
    const { data: star, error: createError } = await supabase
      .from('user_stars')
      .insert({
        user_id: user.id,
        recipient_id: recipientId,
        reason,
        message,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json({ error: 'Erro ao criar estrela' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      star,
      remaining: 2 - (existingStars?.length || 0)
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
