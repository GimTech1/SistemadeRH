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

    // Buscar entregas do banco de dados
    const { data: deliveries, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        delivery_documents(id, filename, file_path, file_size, mime_type, uploaded_at),
        delivery_updates(id, description, author, update_date, created_at),
        delivery_tags(id, tag_name, color),
        delivery_trainings(id, provided, training_date, notes, delivery_trained_people(id, person_name, person_email, department, position))
      `)
      .order('created_at', { ascending: false }) as any

    if (error) {
      console.error('Erro ao buscar entregas:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar entregas' },
        { status: 500 }
      )
    }

    console.log('Entregas encontradas no banco:', deliveries?.length || 0)
    
    // Transformar dados para o formato esperado pelo frontend
    const formattedDeliveries = deliveries?.map((delivery: any) => ({
      id: delivery.id,
      title: delivery.title,
      description: delivery.description,
      deliveryDate: delivery.delivery_date,
      status: delivery.status,
      responsible: delivery.responsible,
      projectType: delivery.project_type,
      client: delivery.client,
      budget: delivery.budget,
      priority: delivery.priority,
      createdAt: delivery.created_at,
      updatedAt: delivery.updated_at,
      documentation: delivery.delivery_documents?.map((doc: any) => doc.filename) || [],
      training: {
        provided: delivery.delivery_trainings?.[0]?.provided || false,
        trainingDate: delivery.delivery_trainings?.[0]?.training_date,
        trainedPeople: delivery.delivery_trainings?.[0]?.delivery_trained_people?.map((person: any) => person.person_name) || []
      },
      updates: delivery.delivery_updates?.map((update: any) => ({
        date: update.update_date,
        description: update.description,
        author: update.author
      })) || [],
      tags: delivery.delivery_tags?.map((tag: any) => tag.tag_name) || []
    })) || []

    return NextResponse.json({
      deliveries: formattedDeliveries,
      total: formattedDeliveries.length
    })

  } catch (error) {
    console.error('Erro ao buscar entregas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
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

    const body = await request.json()
    
    // Opcional: Verificar duplicatas (descomente se quiser ativar)
    /*
    const { data: existingDelivery } = await (supabase as any)
      .from('deliveries')
      .select('id, title, delivery_date, responsible')
      .eq('title', body.title)
      .eq('delivery_date', body.deliveryDate)
      .eq('responsible', body.responsible)
      .single()

    if (existingDelivery) {
      return NextResponse.json(
        { error: `Já existe uma entrega com este título, data e responsável. Entrega existente: ${existingDelivery.title} em ${existingDelivery.delivery_date}` },
        { status: 409 }
      )
    }
    */
    
    // Validação básica dos dados
    const requiredFields = ['title', 'description', 'deliveryDate', 'responsible', 'projectType']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Campo obrigatório: ${field}` },
          { status: 400 }
        )
      }
    }

    // Criar entrega principal
    const { data: delivery, error: deliveryError } = await (supabase as any)
      .from('deliveries')
      .insert({
        title: body.title,
        description: body.description,
        delivery_date: body.deliveryDate,
        status: body.status || 'pending',
        responsible: body.responsible,
        project_type: body.projectType,
        client: body.client,
        budget: body.budget,
        priority: body.priority || 'medium',
        created_by: user.id
      })
      .select()
      .single()

    if (deliveryError) {
      console.error('Erro ao criar entrega:', deliveryError)
      return NextResponse.json(
        { error: 'Erro ao criar entrega' },
        { status: 500 }
      )
    }

    // Criar documentos se existirem
    if (body.documentation && body.documentation.length > 0) {
      const documents = body.documentation.map((filename: string) => ({
        delivery_id: delivery.id,
        filename,
        uploaded_by: user.id
      }))

      const { error: docError } = await supabase
        .from('delivery_documents')
        .insert(documents)
      
      if (docError) {
        console.error('Erro ao criar documentos:', docError)
      }
    }

    // Criar treinamento se existir
    if (body.training && body.training.provided) {
      const { data: training, error: trainingError } = await (supabase as any)
        .from('delivery_trainings')
        .insert({
          delivery_id: delivery.id,
          provided: body.training.provided,
          training_date: body.training.trainingDate,
          notes: body.training.notes
        })
        .select()
        .single()

      if (trainingError) {
        console.error('Erro ao criar treinamento:', trainingError)
      }

      if (!trainingError && body.training.trainedPeople && body.training.trainedPeople.length > 0) {
        const trainedPeople = body.training.trainedPeople.map((personName: string) => ({
          training_id: training.id,
          person_name: personName
        }))

        const { error: peopleError } = await supabase
          .from('delivery_trained_people')
          .insert(trainedPeople)
        
        if (peopleError) {
          console.error('Erro ao criar pessoas treinadas:', peopleError)
        }
      }
    }

    // Criar atualizações se existirem
    if (body.updates && body.updates.length > 0) {
      const updates = body.updates.map((update: any) => ({
        delivery_id: delivery.id,
        description: update.description,
        author: update.author,
        update_date: update.date,
        author_id: user.id
      }))

      await supabase
        .from('delivery_updates')
        .insert(updates)
    }

    // Criar tags se existirem
    if (body.tags && body.tags.length > 0) {
      const tags = body.tags.map((tagName: string) => ({
        delivery_id: delivery.id,
        tag_name: tagName
      }))

      const { error: tagsError } = await supabase
        .from('delivery_tags')
        .insert(tags)
      
      if (tagsError) {
        console.error('Erro ao criar tags:', tagsError)
      }
    }

    return NextResponse.json({
      delivery: {
        id: delivery.id,
        title: delivery.title,
        description: delivery.description,
        deliveryDate: delivery.delivery_date,
        status: delivery.status,
        responsible: delivery.responsible,
        projectType: delivery.project_type,
        client: delivery.client,
        budget: delivery.budget,
        priority: delivery.priority,
        createdAt: delivery.created_at,
        documentation: body.documentation || [],
        training: body.training || { provided: false, trainedPeople: [] },
        updates: body.updates || [],
        tags: body.tags || []
      },
      message: 'Entrega criada com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar entrega:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
