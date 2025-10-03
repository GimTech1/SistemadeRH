import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário é José ou Bianda
    const joseId = 'b8f68ba9-891c-4ca1-b765-43fee671928f'
    const biandaId = '2005804d-9527-4300-aaf5-720d36e080a5'
    
    if (user.id !== joseId && user.id !== biandaId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar notas fiscais destinadas ao usuário com informações do remetente
    const { data: invoices, error } = await supabase
      .from('invoice_files')
      .select(`
        *,
        sender:profiles!employee_id(full_name, position)
      `)
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar notas fiscais recebidas:', error)
      return NextResponse.json({ error: 'Erro ao buscar notas fiscais' }, { status: 500 })
    }

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('Erro na API de notas fiscais recebidas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
