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
      phone?: string | null
      emergency_contact?: string | null
      emergency_phone?: string | null
      address?: string | null
      neighborhood?: string | null
      city?: string | null
      state?: string | null
      zip_code?: string | null
      employee_code?: string
      admission_date?: string
      contract_type?: string
      work_schedule?: string
      salary?: number
      education_level?: string | null
      course_name?: string | null
      institution_name?: string | null
      graduation_year?: string | null
      bank_name?: string | null
      bank_agency?: string | null
      bank_account?: string | null
      account_type?: string | null
      pix_key?: string | null
      vale_refeicao?: number | null
      vale_transporte?: number | null
      plano_saude?: boolean | null
      plano_dental?: boolean | null
      dependent_name_1?: string | null
      dependent_relationship_1?: string | null
      dependent_birth_date_1?: string | null
      dependent_name_2?: string | null
      dependent_relationship_2?: string | null
      dependent_birth_date_2?: string | null
      dependent_name_3?: string | null
      dependent_relationship_3?: string | null
      dependent_birth_date_3?: string | null
      avatar_url?: string | null
      rg_photo?: string | null
      cpf_photo?: string | null
      ctps_photo?: string | null
      diploma_photo?: string | null
      notes?: string
    }

    const { name } = body

    const supabase = await createServerClient()
    const baseUpdate: Record<string, any> = {
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
      phone: body.phone ?? null,
      emergency_contact: body.emergency_contact ?? null,
      emergency_phone: body.emergency_phone ?? null,
      address: body.address ?? null,
      neighborhood: body.neighborhood ?? null,
      city: body.city ?? null,
      state: body.state ?? null,
      zip_code: body.zip_code ?? null,
      employee_code: body.employee_code || null,
      admission_date: body.admission_date || null,
      contract_type: body.contract_type || null,
      work_schedule: body.work_schedule || null,
      salary: body.salary ?? null,
      education_level: body.education_level ?? null,
      course_name: body.course_name ?? null,
      institution_name: body.institution_name ?? null,
      graduation_year: body.graduation_year ?? null,
      bank_name: body.bank_name ?? null,
      bank_agency: body.bank_agency ?? null,
      bank_account: body.bank_account ?? null,
      account_type: body.account_type ?? null,
      pix_key: body.pix_key ?? null,
      vale_refeicao: body.vale_refeicao ?? null,
      vale_transporte: body.vale_transporte ?? null,
      plano_saude: body.plano_saude ?? null,
      plano_dental: body.plano_dental ?? null,
      dependent_name_1: body.dependent_name_1 ?? null,
      dependent_relationship_1: body.dependent_relationship_1 ?? null,
      dependent_birth_date_1: body.dependent_birth_date_1 ?? null,
      dependent_name_2: body.dependent_name_2 ?? null,
      dependent_relationship_2: body.dependent_relationship_2 ?? null,
      dependent_birth_date_2: body.dependent_birth_date_2 ?? null,
      dependent_name_3: body.dependent_name_3 ?? null,
      dependent_relationship_3: body.dependent_relationship_3 ?? null,
      dependent_birth_date_3: body.dependent_birth_date_3 ?? null,
      notes: body.notes || null,
      updated_at: new Date().toISOString(),
    }

    if (typeof body.avatar_url !== 'undefined') baseUpdate.avatar_url = body.avatar_url
    if (typeof body.rg_photo !== 'undefined') baseUpdate.rg_photo = body.rg_photo
    if (typeof body.cpf_photo !== 'undefined') baseUpdate.cpf_photo = body.cpf_photo
    if (typeof body.ctps_photo !== 'undefined') baseUpdate.ctps_photo = body.ctps_photo
    if (typeof body.diploma_photo !== 'undefined') baseUpdate.diploma_photo = body.diploma_photo

    const { data, error } = await (supabase as unknown as import('@supabase/supabase-js').SupabaseClient<any>)
      .from('employees')
      .update(baseUpdate as any)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ employee: data }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createServerClient()
    const { data, error } = await (supabase as unknown as import('@supabase/supabase-js').SupabaseClient<any>)
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }

    return NextResponse.json({ employee: data }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createServerClient()
    const { data: employee, error: fetchError } = await supabase
      .from('employees')
      .select('id, full_name')
      .eq('id', id)
      .single()

    if (fetchError || !employee) {
      return NextResponse.json(
        { error: 'Colaborador não encontrado' },
        { status: 404 }
      )
    }

    const { error: deleteError } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Erro ao excluir colaborador' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Colaborador excluído com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
