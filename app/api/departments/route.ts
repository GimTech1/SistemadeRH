import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

export async function GET() {
  try {
    const supabase = await createServerClient()
    
    const { data: departments, error } = await supabase
      .from('departments')
      .select('id, name, description')
      .order('name', { ascending: true })

    if (error) {
      console.error('Erro ao buscar departamentos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar departamentos' },
        { status: 500 }
      )
    }

    return NextResponse.json({ departments }, { status: 200 })
  } catch (error) {
    console.error('Erro no endpoint GET departments:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    // Forçar type para evitar problemas de tipagem
    const typedSupabase = supabase as any
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, manager_id, parent_department_id } = body

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nome do departamento é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o usuário tem permissão (admin ou manager)
    let { data: profile, error: profileError } = await typedSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Se o perfil não existe, criar um automaticamente
    if (profileError && profileError.code === 'PGRST116') {
      console.log('Perfil não encontrado, criando automaticamente...')
      
      const { data: newProfile, error: createError } = await typedSupabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || 'Usuário',
          role: 'employee', // Default role
          position: user.user_metadata?.position || null
        })
        .select('role')
        .single()

      if (createError) {
        console.error('Erro ao criar perfil:', createError)
        return NextResponse.json(
          { error: 'Erro ao criar perfil do usuário' },
          { status: 500 }
        )
      }

      profile = newProfile
    } else if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Erro ao verificar perfil do usuário' },
        { status: 500 }
      )
    }

    if (!profile || !['admin', 'gerente'].includes(profile.role)) {
      return NextResponse.json(
        { 
          error: 'Apenas administradores e gerentes podem criar departamentos. Seu perfil atual é: ' + (profile?.role || 'não encontrado'),
          userRole: profile?.role || null
        },
        { status: 403 }
      )
    }

    const { data: department, error } = await typedSupabase
      .from('departments')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        manager_id: manager_id || null,
        parent_department_id: parent_department_id || null
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar departamento:', error)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Já existe um departamento com este nome' },
          { status: 409 }
        )
      }
      if (error.code === '42501') {
        return NextResponse.json(
          { error: 'Permissão negada. Verifique se você tem permissão para criar departamentos' },
          { status: 403 }
        )
      }
      return NextResponse.json(
        { error: `Erro ao criar departamento: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ department }, { status: 201 })
  } catch (error) {
    console.error('Erro no endpoint POST departments:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}