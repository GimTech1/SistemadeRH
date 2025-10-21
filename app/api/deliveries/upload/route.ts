import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const deliveryId = formData.get('delivery_id') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json({ error: 'Arquivo é obrigatório' }, { status: 400 })
    }

    if (!deliveryId) {
      return NextResponse.json({ error: 'ID da entrega é obrigatório' }, { status: 400 })
    }

    // Validar se a entrega existe
    const { data: delivery, error: deliveryError } = await (supabase as any)
      .from('deliveries')
      .select('id, title')
      .eq('id', deliveryId)
      .single()

    if (deliveryError || !delivery) {
      return NextResponse.json({ error: 'Entrega não encontrada' }, { status: 404 })
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de arquivo não permitido. Use PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, GIF ou WEBP.' 
      }, { status: 400 })
    }

    // Validar tamanho do arquivo (50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Arquivo muito grande. Tamanho máximo: 50MB' 
      }, { status: 400 })
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const fileName = `delivery-${deliveryId}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `deliveries/${deliveryId}/${fileName}`

    // Upload do arquivo para o Supabase Storage
    console.log('Tentando fazer upload para:', filePath)
    const { error: uploadError } = await supabase.storage
      .from('delivery-documents')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Erro no upload:', uploadError)
      return NextResponse.json({ 
        error: `Erro ao fazer upload do arquivo: ${uploadError.message}` 
      }, { status: 500 })
    }
    
    console.log('Upload realizado com sucesso para:', filePath)

    // Obter URL pública do arquivo
    const { data: { publicUrl } } = supabase.storage
      .from('delivery-documents')
      .getPublicUrl(filePath)

    console.log('URL pública gerada:', publicUrl)

    // Salvar metadados no banco de dados
    const documentData: any = {
      delivery_id: deliveryId,
      filename: file.name,
      file_path: filePath,
      file_url: publicUrl,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: user.id
    }

    // Adicionar description apenas se a coluna existir
    if (description) {
      documentData.description = description
    }

    const { data: document, error: dbError } = await (supabase as any)
      .from('delivery_documents')
      .insert(documentData)
      .select()
      .single()

    if (dbError) {
      console.error('Erro ao salvar no banco:', dbError)
      return NextResponse.json({ error: 'Erro ao salvar documento' }, { status: 500 })
    }

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error('Erro na API de upload:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { documentId } = await request.json()

    if (!documentId) {
      return NextResponse.json({ error: 'ID do documento é obrigatório' }, { status: 400 })
    }

    // Buscar o documento
    const { data: document, error: fetchError } = await (supabase as any)
      .from('delivery_documents')
      .select('id, file_path, delivery_id')
      .eq('id', documentId)
      .single()

    if (fetchError || !document) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })
    }

    // Verificar se o usuário tem permissão para deletar (pode ser o criador da entrega ou admin)
    const { data: delivery, error: deliveryError } = await (supabase as any)
      .from('deliveries')
      .select('created_by')
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
      return NextResponse.json({ error: 'Sem permissão para deletar este documento' }, { status: 403 })
    }

    // Deletar arquivo do storage
    const { error: storageError } = await supabase.storage
      .from('delivery-documents')
      .remove([document.file_path])

    if (storageError) {
      console.error('Erro ao deletar do storage:', storageError)
    }

    // Deletar registro do banco
    const { error: dbError } = await (supabase as any)
      .from('delivery_documents')
      .delete()
      .eq('id', documentId)

    if (dbError) {
      console.error('Erro ao deletar do banco:', dbError)
      return NextResponse.json({ error: 'Erro ao deletar documento' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Documento deletado com sucesso' }, { status: 200 })
  } catch (error) {
    console.error('Erro na API de delete:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
