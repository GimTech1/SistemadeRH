import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Bypass de revelação de autores (IDs em env, separados por vírgula)
    const bypassIds = (process.env.NEXT_PUBLIC_IDEA_BYPASS_IDS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const hasBypass = !!(user?.id && bypassIds.includes(user.id))

    // Listar ideias mais recentes primeiro
    type IdeaRow = Database['public']['Tables']['ideas']['Row']
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false }) as unknown as { data: IdeaRow[] | null, error: any }

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar ideias' }, { status: 500 })
    }

    // Buscar nomes dos autores para ideias não anônimas
    const authorIds = Array.from(new Set(((data || []) as IdeaRow[])
      .filter((row) => !row.is_anonymous && row.created_by)
      .map((row) => row.created_by))) as string[]

    let authorsMap = new Map<string, string | null>()
    if (authorIds.length > 0) {
      const { data: authors } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', authorIds) as unknown as { data: { id: string; full_name: string | null }[] | null }
      for (const a of (authors || [])) {
        authorsMap.set(a.id, a.full_name || null)
      }
    }

    // Buscar nomes dos departamentos
    const departmentIds = Array.from(new Set(((data || []) as IdeaRow[])
      .filter((row) => row.department_id)
      .map((row) => row.department_id))) as string[]

    let departmentsMap = new Map<string, string | null>()
    if (departmentIds.length > 0) {
      const { data: departments } = await supabase
        .from('departments')
        .select('id, name')
        .in('id', departmentIds) as unknown as { data: { id: string; name: string }[] | null }
      for (const d of (departments || [])) {
        departmentsMap.set(d.id, d.name)
      }
    }

    // Se a ideia é anônima, não retornar o created_by, a menos que tenha bypass
    const sanitized = ((data || []) as IdeaRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      is_anonymous: row.is_anonymous,
      department_id: row.department_id,
      department_name: row.department_id ? departmentsMap.get(row.department_id) || null : null,
      created_at: row.created_at,
      updated_at: row.updated_at,
      created_by: row.is_anonymous && !hasBypass ? null : row.created_by,
      author_name: (!row.is_anonymous || hasBypass)
        ? (row.created_by ? authorsMap.get(row.created_by) || null : null)
        : null,
      is_owner: user?.id ? row.created_by === user.id : false,
    }))

    return NextResponse.json({ ideas: sanitized, canReveal: hasBypass }, { status: 200 })
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
    const { title, description, is_anonymous, department_id } = body as {
      title: string
      description?: string
      is_anonymous?: boolean
      department_id: string
    }

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }

    if (!department_id || !department_id.trim()) {
      return NextResponse.json({ error: 'Setor é obrigatório' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const insertPayload = {
      title: String(title).trim(),
      description: description?.trim() || null,
      is_anonymous: Boolean(is_anonymous),
      department_id: String(department_id).trim(),
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


