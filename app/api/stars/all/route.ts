import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Usar RPC (Remote Procedure Call) para bypass das políticas RLS
    const { data: allStars, error } = await supabase.rpc('get_all_stars')

    if (error) {
      console.error('Erro ao buscar todas as estrelas via RPC:', error)
      
      // Fallback: tentar query direta com bypass de RLS
      const { data: fallbackStars, error: fallbackError } = await supabase
        .from('user_stars')
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
        return NextResponse.json({ error: 'Erro ao buscar estrelas' }, { status: 500 })
      }

      return NextResponse.json({ 
        stars: fallbackStars || [],
        total: fallbackStars?.length || 0
      })
    }

    return NextResponse.json({ 
      stars: allStars || [],
      total: allStars?.length || 0
    })
  } catch (error) {
    console.error('Erro na API de todas as estrelas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
