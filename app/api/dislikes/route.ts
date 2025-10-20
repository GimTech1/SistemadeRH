import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar dislikes do usuário para o mês atual
    const currentDate = new Date()
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    const { data: existingDislikes, error } = await supabase
      .from('user_dislikes')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString())

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar dislikes' }, { status: 500 })
    }

    const used = existingDislikes?.length || 0
    const available = Math.max(0, 3 - used)
    const resetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)

    return NextResponse.json({
      available,
      used,
      resetDate: resetDate.toISOString()
    })
  } catch (error) {
    console.error('Erro ao buscar dislikes:', error)
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

    // Impedir que o usuário dê dislike para si mesmo
    if (recipientId === user.id) {
      return NextResponse.json({ error: 'Você não pode dar dislike para si mesmo' }, { status: 400 })
    }

    // Verificar se o usuário ainda tem dislikes disponíveis este mês
    const currentDate = new Date()
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    const { data: existingDislikes, error: checkError } = await supabase
      .from('user_dislikes')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString())

    if (checkError) {
      return NextResponse.json({ error: 'Erro ao verificar dislikes existentes' }, { status: 500 })
    }

    if (existingDislikes && existingDislikes.length >= 3) {
      return NextResponse.json({ error: 'Você já usou todos os seus dislikes este mês' }, { status: 400 })
    }

    // Criar o dislike
    const { data: dislike, error: createError } = await supabase
      .from('user_dislikes')
      .insert({
        user_id: user.id,
        recipient_id: recipientId,
        reason,
        message
      } as any)
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar dislike:', createError)
      return NextResponse.json({
        error: 'Erro ao criar dislike',
        details: createError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      dislike,
      remaining: 3 - ((existingDislikes?.length || 0) + 1)
    })
  } catch (error) {
    console.error('Erro ao criar dislike:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
