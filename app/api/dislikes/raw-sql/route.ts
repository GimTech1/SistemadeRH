import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar todas as dislikes sem restrições
    const { data: allDislikes, error } = await supabase
      .from('user_dislikes')
      .select(`
        id,
        reason,
        message,
        created_at,
        user_id,
        recipient_id
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar dislikes com service role:', error)
      return NextResponse.json({
        error: 'Erro ao buscar dislikes',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    return NextResponse.json({
      dislikes: allDislikes || [],
      total: allDislikes?.length || 0
    })
  } catch (error) {
    console.error('Erro ao buscar dislikes:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
