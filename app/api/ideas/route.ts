import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Listar ideias mais recentes primeiro
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar ideias' }, { status: 500 })
    }

    // Buscar nomes dos autores para ideias não anônimas
    const authorIds = Array.from(new Set((data || [])
      .filter((row) => !row.is_anonymous && row.created_by)
      .map((row) => row.created_by))) as string[]

    let authorsMap = new Map<string, string | null>()
    if (authorIds.length > 0) {
      const { data: authors } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', authorIds)
      for (const a of authors || []) {
        authorsMap.set(a.id as unknown as string, (a as any).full_name || null)
      }
    }

    // Se a ideia é anônima, não retornar o created_by
    const sanitized = (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      is_anonymous: row.is_anonymous,
      created_at: row.created_at,
      updated_at: row.updated_at,
      created_by: row.is_anonymous ? null : row.created_by,
      author_name: row.is_anonymous ? null : (row.created_by ? authorsMap.get(row.created_by) || null : null),
      is_owner: user?.id ? row.created_by === user.id : false,
    }))

    return NextResponse.json({ ideas: sanitized }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, is_anonymous } = body as {
      title: string
      description?: string
      is_anonymous?: boolean
    }

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const insertPayload = {
      title: String(title).trim(),
      description: description?.trim() || null,
      is_anonymous: Boolean(is_anonymous),
      created_by: user.id,
      created_at: now,
      updated_at: now,
    }

    const { data: created, error: insertError } = await (supabase as any)
      .from('ideas')
      .insert(insertPayload)
      .select('*')
      .single()

    if (insertError || !created) {
      return NextResponse.json({ error: 'Erro ao criar ideia' }, { status: 500 })
    }

    return NextResponse.json({
      idea: {
        id: created.id,
        title: created.title,
        description: created.description,
        is_anonymous: created.is_anonymous,
        created_at: created.created_at,
        updated_at: created.updated_at,
        created_by: created.is_anonymous ? null : created.created_by,
      }
    }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


