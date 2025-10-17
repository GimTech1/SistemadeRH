import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Tentar usar o service role key para bypass completo das políticas RLS
    // Isso requer configuração adicional no Supabase
    const { data: allStars, error } = await supabase
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

    if (error) {
      console.error('Erro ao buscar estrelas:', error)
      return NextResponse.json({ 
        error: 'Erro ao buscar estrelas',
        details: error.message,
        code: error.code
      }, { status: 500 })
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
