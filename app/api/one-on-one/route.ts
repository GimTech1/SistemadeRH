import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { Database } from '@/lib/supabase/database.types'

const createOneOnOneSchema = z.object({
  manager_id: z.string().uuid(),
  employee_id: z.string().uuid(),
  meeting_date: z.string().datetime(),
  participants: z.array(z.string()),
  description: z.string().optional(),
  agreements: z.string().optional(),
  expected_date: z.string().datetime().optional(),
})

const updateOneOnOneSchema = z.object({
  meeting_date: z.string().datetime().optional(),
  participants: z.array(z.string()).optional(),
  description: z.string().optional(),
  agreements: z.string().optional(),
  expected_date: z.string().datetime().optional(),
  manager_approved: z.boolean().optional(),
  employee_approved: z.boolean().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employee_id = searchParams.get('employee_id')
    const manager_id = searchParams.get('manager_id')
    const status = searchParams.get('status')

    let query = (supabase as any)
      .from('one_on_one_meetings')
      .select(`
        *,
        manager:profiles!one_on_one_meetings_manager_id_fkey(full_name, position),
        employee:profiles!one_on_one_meetings_employee_id_fkey(full_name, position)
      `)
      .order('meeting_date', { ascending: false })

    // Filtros baseados no papel do usuário e departamento
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, id, department_id')
      .eq('id', user.id)
      .single()

    if (profile && (profile as any).role) {
      if ((profile as any).role === 'employee') {
        // Funcionários só veem suas próprias reuniões
        query = query.eq('employee_id', user.id)
      } else if ((profile as any).role === 'gerente') {
        // Gerentes veem reuniões onde são manager ou employee, mas apenas do seu departamento
        if ((profile as any).department_id) {
          // Buscar funcionários do mesmo departamento
          const { data: departmentEmployees } = await supabase
            .from('profiles')
            .select('id')
            .eq('department_id', (profile as any).department_id)
          
          if (departmentEmployees && departmentEmployees.length > 0) {
            const employeeIds = departmentEmployees.map((emp: any) => emp.id)
            query = query.or(`manager_id.eq.${user.id},employee_id.in.(${employeeIds.join(',')})`)
          } else {
            query = query.eq('manager_id', user.id)
          }
        } else {
          query = query.or(`manager_id.eq.${user.id},employee_id.eq.${user.id}`)
        }
      }
    }
    // Admins veem todas as reuniões

    if (employee_id) {
      query = query.eq('employee_id', employee_id)
    }

    if (manager_id) {
      query = query.eq('manager_id', manager_id)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar reuniões' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createOneOnOneSchema.parse(body)

    // Verificar se o usuário tem permissão para criar reuniões
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, department_id')
      .eq('id', user.id)
      .single()

    if (!profile || !(profile as any).role || ((profile as any).role !== 'admin' && (profile as any).role !== 'gerente')) {
      return NextResponse.json({ error: 'Sem permissão para criar reuniões' }, { status: 403 })
    }

    // Se for gerente, verificar se está criando reunião com pessoas do seu departamento
    if ((profile as any).role === 'gerente' && (profile as any).department_id) {
      // Verificar se o manager e employee são do mesmo departamento
      const { data: managerProfile } = await supabase
        .from('profiles')
        .select('department_id')
        .eq('id', validatedData.manager_id)
        .single()

      const { data: employeeProfile } = await supabase
        .from('profiles')
        .select('department_id')
        .eq('id', validatedData.employee_id)
        .single()

      if (!managerProfile || !employeeProfile || 
          (managerProfile as any).department_id !== (profile as any).department_id ||
          (employeeProfile as any).department_id !== (profile as any).department_id) {
        return NextResponse.json({ error: 'Você só pode criar reuniões com pessoas do seu departamento' }, { status: 403 })
      }
    }

    // Verificar se o manager_id é válido (deve ser admin ou gerente)
    const { data: managerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', validatedData.manager_id)
      .single()

    if (!managerProfile || !(managerProfile as any).role || ((managerProfile as any).role !== 'admin' && (managerProfile as any).role !== 'gerente')) {
      return NextResponse.json({ error: 'Manager deve ser admin ou gerente' }, { status: 400 })
    }

    const insertData = {
      manager_id: validatedData.manager_id,
      employee_id: validatedData.employee_id,
      meeting_date: validatedData.meeting_date,
      participants: validatedData.participants,
      description: validatedData.description || null,
      agreements: validatedData.agreements || null,
      expected_date: validatedData.expected_date || null,
      manager_approved: false,
      employee_approved: false,
      status: 'scheduled' as const,
    }

    const { data, error } = await (supabase as any)
      .from('one_on_one_meetings')
      .insert(insertData)
      .select(`
        *,
        manager:profiles!one_on_one_meetings_manager_id_fkey(full_name, position),
        employee:profiles!one_on_one_meetings_employee_id_fkey(full_name, position)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Erro ao criar reunião' }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Dados inválidos', 
        details: error.issues,
        message: 'Verifique os campos obrigatórios e formatos'
      }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
