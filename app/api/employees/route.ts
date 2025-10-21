import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

export async function GET() {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: employees, error } = await (supabase as any)
      .from('employees')
      .select('id, full_name, position, department, is_active')
      .eq('is_active', true)
      .order('full_name', { ascending: true })

    if (error) {
      console.error('Erro ao buscar funcionários:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar funcionários' },
        { status: 500 }
      )
    }

    return NextResponse.json({ employees: employees || [] })
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      name: string
      email?: string
      position?: string
      department?: string
      is_active?: boolean
      cpf?: string
      rg?: string
      birth_date?: string
      gender?: string
      marital_status?: string
      nationality?: string
      contacts?: any
      address?: any
      employee_code?: string
      admission_date?: string
      contract_type?: string
      work_schedule?: string
      salary?: number
      documents?: any
      benefits?: any
      dependents?: any
      education?: any
      bank?: any
      notes?: string
    }
    const { name, email, position } = body
    if (!name) {
      return NextResponse.json({ message: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { data, error } = await (supabase as unknown as import('@supabase/supabase-js').SupabaseClient<Database>)
      .from('employees')
      .insert({
        full_name: name,
        email: email || null,
        position: position || null,
        department: body.department || null,
        is_active: typeof body.is_active === 'boolean' ? body.is_active : true,
        cpf: body.cpf || null,
        rg: body.rg || null,
        birth_date: body.birth_date || null,
        gender: body.gender || null,
        marital_status: body.marital_status || null,
        nationality: body.nationality || null,
        contacts: body.contacts || null,
        address: body.address || null,
        employee_code: body.employee_code || null,
        admission_date: body.admission_date || null,
        contract_type: body.contract_type || null,
        work_schedule: body.work_schedule || null,
        salary: body.salary || null,
        documents: body.documents || null,
        benefits: body.benefits || null,
        dependents: body.dependents || null,
        education: body.education || null,
        bank: body.bank || null,
        notes: body.notes || null,
      } as any)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return NextResponse.json({ employee: data })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Erro inesperado' }, { status: 500 })
  }
}


