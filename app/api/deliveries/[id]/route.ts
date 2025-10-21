import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    
    // Buscar entrega específica no banco de dados
    const { data: delivery, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        delivery_documents(id, filename, file_path, file_size, mime_type, uploaded_at),
        delivery_updates(id, description, author, update_date, created_at),
        delivery_tags(id, tag_name, color),
        delivery_trainings(id, provided, training_date, notes, delivery_trained_people(id, person_name, person_email, department, position))
      `)
      .eq('id', id)
      .single() as any

    if (error || !delivery) {
      return NextResponse.json(
        { error: 'Entrega não encontrada' },
        { status: 404 }
      )
    }

    // Transformar dados para o formato esperado pelo frontend
    const formattedDelivery = {
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
      documentation: delivery.delivery_documents?.map((doc: any) => ({
        id: doc.id,
        filename: doc.filename,
        file_url: doc.file_url,
        file_size: doc.file_size,
        mime_type: doc.mime_type,
        description: doc.description
      })) || [],
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
    }

    return NextResponse.json({ delivery: formattedDelivery })

  } catch (error) {
    console.error('Erro ao buscar entrega:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    
    // Verificar se a entrega existe
    const { data: existingDelivery, error: fetchError } = await supabase
      .from('deliveries')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existingDelivery) {
      return NextResponse.json(
        { error: 'Entrega não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar entrega principal
    const { data: updatedDelivery, error: updateError } = await (supabase as any)
      .from('deliveries')
      .update({
        title: body.title,
        description: body.description,
        delivery_date: body.deliveryDate,
        status: body.status,
        responsible: body.responsible,
        project_type: body.projectType,
        client: body.client,
        budget: body.budget,
        priority: body.priority,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar entrega:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar entrega' },
        { status: 500 }
      )
    }

    // Atualizar documentos (remover existentes e adicionar novos)
    if (body.documentation !== undefined) {
      await supabase
        .from('delivery_documents')
        .delete()
        .eq('delivery_id', id)

      if (body.documentation.length > 0) {
        const documents = body.documentation.map((filename: string) => ({
          delivery_id: id,
          filename,
          uploaded_by: user.id
        }))

        await supabase
          .from('delivery_documents')
          .insert(documents)
      }
    }

    // Atualizar treinamento
    if (body.training !== undefined) {
      await supabase
        .from('delivery_trainings')
        .delete()
        .eq('delivery_id', id)

      if (body.training.provided) {
        const { data: training, error: trainingError } = await (supabase as any)
          .from('delivery_trainings')
          .insert({
            delivery_id: id,
            provided: body.training.provided,
            training_date: body.training.trainingDate,
            notes: body.training.notes
          })
          .select()
          .single()

        if (!trainingError && body.training.trainedPeople && body.training.trainedPeople.length > 0) {
          const trainedPeople = body.training.trainedPeople.map((personName: string) => ({
            training_id: training.id,
            person_name: personName
          }))

          await supabase
            .from('delivery_trained_people')
            .insert(trainedPeople)
        }
      }
    }

    // Atualizar atualizações
    if (body.updates !== undefined) {
      await supabase
        .from('delivery_updates')
        .delete()
        .eq('delivery_id', id)

      if (body.updates.length > 0) {
        const updates = body.updates.map((update: any) => ({
          delivery_id: id,
          description: update.description,
          author: update.author,
          update_date: update.date,
          author_id: user.id
        }))

        await supabase
          .from('delivery_updates')
          .insert(updates)
      }
    }

    // Atualizar tags
    if (body.tags !== undefined) {
      await supabase
        .from('delivery_tags')
        .delete()
        .eq('delivery_id', id)

      if (body.tags.length > 0) {
        const tags = body.tags.map((tagName: string) => ({
          delivery_id: id,
          tag_name: tagName
        }))

        await supabase
          .from('delivery_tags')
          .insert(tags)
      }
    }

    return NextResponse.json({
      delivery: {
        id: updatedDelivery.id,
        title: updatedDelivery.title,
        description: updatedDelivery.description,
        deliveryDate: updatedDelivery.delivery_date,
        status: updatedDelivery.status,
        responsible: updatedDelivery.responsible,
        projectType: updatedDelivery.project_type,
        client: updatedDelivery.client,
        budget: updatedDelivery.budget,
        priority: updatedDelivery.priority,
        updatedAt: updatedDelivery.updated_at,
        documentation: body.documentation || [],
        training: body.training || { provided: false, trainedPeople: [] },
        updates: body.updates || [],
        tags: body.tags || []
      },
      message: 'Entrega atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar entrega:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    
    // Verificar se a entrega existe
    const { data: existingDelivery, error: fetchError } = await supabase
      .from('deliveries')
      .select('id, title')
      .eq('id', id)
      .single() as any

    if (fetchError || !existingDelivery) {
      return NextResponse.json(
        { error: 'Entrega não encontrada' },
        { status: 404 }
      )
    }

    // Deletar entrega (cascade delete irá remover registros relacionados)
    const { error: deleteError } = await supabase
      .from('deliveries')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Erro ao deletar entrega:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao deletar entrega' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Entrega removida com sucesso',
      delivery: {
        id: existingDelivery.id,
        title: existingDelivery.title
      }
    })

  } catch (error) {
    console.error('Erro ao remover entrega:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
