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
      // campos normalizados vindos do frontend
      phone?: string | null
      emergency_contact?: string | null
      address?: string | null
      city?: string | null
      state?: string | null
      zip_code?: string | null
      employee_code?: string
      admission_date?: string
      contract_type?: string
      work_schedule?: string
      salary?: number
      // educação
      education_level?: string | null
      course_name?: string | null
      institution_name?: string | null
      graduation_year?: string | null
      // bancário
      bank_name?: string | null
      bank_agency?: string | null
      bank_account?: string | null
      account_type?: string | null
      // benefícios
      vale_refeicao?: number | null
      vale_transporte?: number | null
      plano_saude?: boolean | null
      plano_dental?: boolean | null
      // uploads
      avatar_url?: string | null
      rg_photo?: string | null
      cpf_photo?: string | null
      ctps_photo?: string | null
      diploma_photo?: string | null
      notes?: string
    }

    const { name } = body

    const supabase = await createServerClient()
    // Monta update dinamicamente para não sobrescrever uploads com null
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
      // Contatos e Endereço
      phone: body.phone ?? null,
      emergency_contact: body.emergency_contact ?? null,
      address: body.address ?? null,
      city: body.city ?? null,
      state: body.state ?? null,
      zip_code: body.zip_code ?? null,
      employee_code: body.employee_code || null,
      admission_date: body.admission_date || null,
      contract_type: body.contract_type || null,
      work_schedule: body.work_schedule || null,
      salary: body.salary ?? null,
      // Educação
      education_level: body.education_level ?? null,
      course_name: body.course_name ?? null,
      institution_name: body.institution_name ?? null,
      graduation_year: body.graduation_year ?? null,
      // Bancário
      bank_name: body.bank_name ?? null,
      bank_agency: body.bank_agency ?? null,
      bank_account: body.bank_account ?? null,
      account_type: body.account_type ?? null,
      // Benefícios
      vale_refeicao: body.vale_refeicao ?? null,
      vale_transporte: body.vale_transporte ?? null,
      plano_saude: body.plano_saude ?? null,
      plano_dental: body.plano_dental ?? null,
      // Outros
      notes: body.notes || null,
      updated_at: new Date().toISOString(),
    }

    // Campos de upload: só aplica se vierem definidos
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
      console.error('Error updating employee:', error)
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ employee: data }, { status: 200 })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
