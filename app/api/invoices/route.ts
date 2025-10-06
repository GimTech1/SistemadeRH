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

    // Buscar notas fiscais: todas se usuário for autorizado especial; caso contrário, apenas as do próprio usuário
    const specialViewerId = '02088194-3439-411d-bdfb-05a255d8be24'
    const baseQuery = supabase
      .from('invoice_files')
      .select(`
        *,
        recipient:profiles!recipient_id(full_name)
      `)
      .order('created_at', { ascending: false })

    const { data: invoices, error } = user.id === specialViewerId
      ? await baseQuery
      : await baseQuery.eq('employee_id', user.id)

    if (error) {
      console.error('Erro ao buscar notas fiscais:', error)
      return NextResponse.json({ error: 'Erro ao buscar notas fiscais' }, { status: 500 })
    }

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('Erro na API de notas fiscais:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const description = formData.get('description') as string
    const recipient_id = formData.get('recipient_id') as string

    if (!file) {
      return NextResponse.json({ error: 'Arquivo é obrigatório' }, { status: 400 })
    }

    if (!recipient_id) {
      return NextResponse.json({ error: 'Destinatário é obrigatório' }, { status: 400 })
    }

    // Validar se o destinatário existe na tabela profiles
    const { data: recipientProfile, error: recipientError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', recipient_id)
      .single()

    if (recipientError || !recipientProfile) {
      return NextResponse.json({ error: 'Destinatário inválido. Usuário não encontrado.' }, { status: 400 })
    }

    // Validar tipo de arquivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de arquivo não permitido. Use PDF, JPG ou PNG.' 
      }, { status: 400 })
    }

    // Validar tamanho do arquivo (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Arquivo muito grande. Tamanho máximo: 10MB' 
      }, { status: 400 })
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `invoices/${fileName}`

    // Upload do arquivo para o Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('invoice-files')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Erro no upload:', uploadError)
      return NextResponse.json({ error: 'Erro ao fazer upload do arquivo' }, { status: 500 })
    }

    // Obter URL pública do arquivo
    const { data: { publicUrl } } = supabase.storage
      .from('invoice-files')
      .getPublicUrl(filePath)

    // Salvar metadados no banco de dados
    const { data: invoice, error: dbError } = await (supabase as any)
      .from('invoice_files')
      .insert({
        employee_id: user.id,
        recipient_id: recipient_id,
        file_name: file.name,
        file_path: filePath,
        file_url: publicUrl,
        file_size: file.size,
        file_type: file.type,
        description: description || null,
        status: 'pending'
      })
      .select(`
        *,
        recipient:profiles!recipient_id(full_name)
      `)
      .single()

    if (dbError) {
      console.error('Erro ao salvar no banco:', dbError)
      return NextResponse.json({ error: 'Erro ao salvar arquivo' }, { status: 500 })
    }

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error) {
    console.error('Erro na API de upload:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
