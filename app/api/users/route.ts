import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

type Role = Database['public']['Tables']['profiles']['Row']['role']

export async function GET() {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    const typedSupabase = supabase as any
    const { data: requesterProfile, error: requesterError } = await typedSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (requesterError || !requesterProfile || requesterProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Apenas administradores podem listar usuários' }, { status: 403 })
    }

    let { data: users, error } = await typedSupabase
      .from('profiles')
      .select('id, email, full_name, role, position, department_id, is_active, created_at')
      .order('full_name', { ascending: true })

    if (error && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const admin: any = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const res = await admin
        .from('profiles')
        .select('id, email, full_name, role, position, department_id, is_active, created_at')
        .order('full_name', { ascending: true })
      users = res.data as any
      error = res.error as any
    }

    if (error) {
      return NextResponse.json({ error: `Erro ao buscar usuários: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    const typedSupabase = supabase as any
    const { data: requesterProfile, error: requesterError } = await typedSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (requesterError || !requesterProfile || requesterProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Apenas administradores podem alterar papéis' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, role } = body as { userId?: string; role?: Role }

    if (!userId || !role) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
    }

    if (!['admin', 'gerente', 'employee'].includes(role)) {
      return NextResponse.json({ error: 'Role inválida' }, { status: 400 })
    }

    let { data: updated, error } = await typedSupabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select('id, email, full_name, role')
      .maybeSingle()

    if ((error || !updated) && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const admin: any = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const res = await admin
        .from('profiles')
        .update({ role } as any)
        .eq('id', userId)
        .select('id, email, full_name, role')
        .maybeSingle()
      updated = res.data as any
      error = res.error as any
    }

    if (error) {
      return NextResponse.json({ error: `Erro ao atualizar role: ${error.message}` }, { status: 500 })
    }

    if (!updated) {
      return NextResponse.json({ error: 'Nenhuma linha atualizada. Verifique RLS ou o ID informado.' }, { status: 409 })
    }

    return NextResponse.json({ user: updated }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, email, fullName, position, departmentId } = body as {
      userId?: string
      email?: string
      fullName?: string
      position?: string
      departmentId?: string
    }

    if (!userId || !email || !fullName) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes' }, { status: 400 })
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Service role não configurada' }, { status: 500 })
    }

    const admin: any = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await admin
      .from('profiles')
      .upsert({
        id: userId,
        email,
        full_name: fullName,
        position: position ?? null,
        role: 'employee',
        department_id: departmentId ?? null,
      }, { onConflict: 'id' } as any)
      .select('id, department_id')
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: `Erro ao salvar perfil: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ profile: data }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


