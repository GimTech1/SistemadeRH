import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')

    if (!documentId) {
      return NextResponse.json({ error: 'ID do documento é obrigatório' }, { status: 400 })
    }

    // Buscar o documento
    const { data: document, error: fetchError } = await (supabase as any)
      .from('delivery_documents')
      .select('id, file_path, delivery_id, filename')
      .eq('id', documentId)
      .single()

    if (fetchError || !document) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })
    }

    // Verificar se o usuário tem acesso à entrega
    const { data: delivery, error: deliveryError } = await (supabase as any)
      .from('deliveries')
      .select('id, created_by')
      .eq('id', document.delivery_id)
      .single()

    if (deliveryError || !delivery) {
      return NextResponse.json({ error: 'Entrega não encontrada' }, { status: 404 })
    }

    // Verificar permissão (criador da entrega ou admin)
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin' || profile?.role === 'administrador'
    const isCreator = delivery.created_by === user.id

    if (!isAdmin && !isCreator) {
      return NextResponse.json({ error: 'Sem permissão para acessar este documento' }, { status: 403 })
    }

    // Gerar URL assinada para download
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from('delivery-documents')
      .createSignedUrl(document.file_path, 3600) // URL válida por 1 hora

    if (urlError) {
      console.error('Erro ao gerar URL assinada:', urlError)
      return NextResponse.json({ error: 'Erro ao gerar URL de download' }, { status: 500 })
    }

    return NextResponse.json({ 
      downloadUrl: signedUrl.signedUrl,
      filename: document.filename 
    })

  } catch (error) {
    console.error('Erro na API de download:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
