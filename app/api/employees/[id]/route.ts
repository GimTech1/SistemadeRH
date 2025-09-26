import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json() as {
      name?: string
      email?: string
      position?: string
      department?: string
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

    const { name } = body

    const supabase = await createServerClient()
    const { data, error } = await (supabase as unknown as import('@supabase/supabase-js').SupabaseClient<any>)
      .from('employees')
      .update({
        ...(name ? { full_name: name } : {}),
        email: body.email || null,
        position: body.position || null,
        department: body.department || null,
        cpf: body.cpf || null,
        rg: body.rg || null,
        birth_date: body.birth_date || null,
        gender: body.gender || null,
        marital_status: body.marital_status || null,
        nationality: body.nationality || null,
        // deixe nulos apenas para colunas que existem. Removendo objetos JSON antigos:
        // contatos/endereço normalizados já chegam como colunas específicas via frontend
        employee_code: body.employee_code || null,
        admission_date: body.admission_date || null,
        contract_type: body.contract_type || null,
        work_schedule: body.work_schedule || null,
        salary: body.salary || null,
        // campos normalizados já tratados no frontend; evitar sobrescrever com null objetos antigos
        notes: body.notes || null,
      } as any)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating employee:', error)
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ employee: data }, { status: 200 })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
