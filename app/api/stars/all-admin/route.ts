import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Usar service role key para bypass completo das políticas RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Esta chave bypass todas as políticas RLS
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    console.log('🔍 Buscando todas as estrelas com service role...')
    
    // Buscar todas as estrelas sem restrições
    const { data: allStars, error } = await supabaseAdmin
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
      console.error('❌ Erro ao buscar estrelas com service role:', error)
      return NextResponse.json({ 
        error: 'Erro ao buscar estrelas',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    console.log(`✅ Encontradas ${allStars?.length || 0} estrelas com service role`)
    console.log('📊 Dados das estrelas:', allStars)

    return NextResponse.json({ 
      stars: allStars || [],
      total: allStars?.length || 0
    })
  } catch (error) {
    console.error('Erro na API admin de todas as estrelas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
