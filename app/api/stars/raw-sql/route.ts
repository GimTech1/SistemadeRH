import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    console.log('🔍 Executando query SQL direta...')
    
    // Usar query SQL direta para bypass das políticas RLS
    const { data: allStars, error } = await supabase
      .rpc('get_all_stars_raw')

    if (error) {
      console.error('❌ Erro na query SQL direta:', error)
      
      // Fallback: tentar query normal com mais debug
      console.log('🔄 Tentando query normal como fallback...')
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
        console.error('❌ Erro no fallback:', fallbackError)
        return NextResponse.json({ 
          error: 'Erro ao buscar estrelas',
          details: fallbackError.message,
          code: fallbackError.code,
          hint: fallbackError.hint
        }, { status: 500 })
      }

      console.log(`✅ Fallback: Encontradas ${fallbackStars?.length || 0} estrelas`)
      return NextResponse.json({ 
        stars: fallbackStars || [],
        total: fallbackStars?.length || 0
      })
    }

    console.log(`✅ Query SQL direta: Encontradas ${allStars?.length || 0} estrelas`)
    console.log('📊 Dados das estrelas:', allStars)

    return NextResponse.json({ 
      stars: allStars || [],
      total: allStars?.length || 0
    })
  } catch (error) {
    console.error('Erro na API SQL direta:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
