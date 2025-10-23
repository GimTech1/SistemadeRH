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

    // Usar função RPC para bypass das políticas RLS
    const { data: allDislikes, error } = await supabase
      .rpc('get_all_dislikes_raw')

    if (error) {
      console.error('Erro na função RPC:', error)
      
      // Fallback: tentar query normal
      const { data: fallbackDislikes, error: fallbackError } = await supabase
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

      if (fallbackError) {
        console.error('Erro no fallback:', fallbackError)
        return NextResponse.json({
          error: 'Erro ao buscar dislikes',
          details: fallbackError.message,
          code: fallbackError.code,
          hint: fallbackError.hint
        }, { status: 500 })
      }

      return NextResponse.json({
        dislikes: fallbackDislikes || [],
        total: fallbackDislikes?.length || 0
      })
    }

    return NextResponse.json({
      dislikes: (allDislikes as any[]) || [],
      total: (allDislikes as any[])?.length || 0
    })
  } catch (error) {
    console.error('Erro ao buscar dislikes:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
