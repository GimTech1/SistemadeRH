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

    // Buscar dislikes recebidos pelo usuário
    const { data: dislikes, error } = await supabase
      .from('user_dislikes')
      .select(`
        id,
        reason,
        message,
        created_at,
        user_id,
        recipient_id
      `)
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar dislikes recebidos' }, { status: 500 })
    }

    return NextResponse.json({ dislikes })
  } catch (error) {
    console.error('Erro ao buscar dislikes recebidos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
