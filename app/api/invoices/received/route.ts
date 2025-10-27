import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.log('❌ Erro de autenticação:', authError)
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    console.log('👤 Usuário autenticado:', user.id)

    // Verificar se o usuário está autorizado a acessar recebidas
    const joseId = 'b8f68ba9-891c-4ca1-b765-43fee671928f'
    const biancaId = '0d0bf6c3-bda8-47a2-864b-425575d13194'
    const newAllowedId = '02088194-3439-411d-bdfb-05a255d8be24'
    const allowedIds = [joseId, biancaId, newAllowedId]
    
    console.log('🔐 IDs autorizados:', allowedIds)
    console.log('✅ Usuário autorizado?', allowedIds.includes(user.id))
    
    if (!allowedIds.includes(user.id)) {
      console.log('❌ Acesso negado para usuário:', user.id)
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar notas fiscais: se for o novo ID, retorna todas as recebidas; senão, apenas as destinadas ao usuário
    const baseQuery = supabase
      .from('invoice_files')
      .select(`
        *,
        sender:profiles!employee_id(full_name, position)
      `)
      .order('created_at', { ascending: false })

    console.log('🔍 Executando consulta para usuário:', user.id)
    console.log('🎯 É o novo ID autorizado?', user.id === newAllowedId)

    const { data: invoices, error } = user.id === newAllowedId
      ? await baseQuery
      : await baseQuery.eq('recipient_id', user.id)

    console.log('📊 Resultado da consulta:')
    console.log('- Erro:', error)
    console.log('- Quantidade de notas encontradas:', invoices?.length || 0)
    console.log('- Dados:', invoices)

    if (error) {
      console.error('❌ Erro ao buscar notas fiscais recebidas:', error)
      return NextResponse.json({ error: 'Erro ao buscar notas fiscais' }, { status: 500 })
    }

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('❌ Erro na API de notas fiscais recebidas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
