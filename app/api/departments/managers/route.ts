import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('department_id')

    if (!departmentId) {
      return NextResponse.json({ error: 'ID do departamento é obrigatório' }, { status: 400 })
    }

    // Buscar gestores do departamento
    const { data: managers, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, position')
      .eq('department_id', departmentId)
      .in('role', ['admin', 'gerente'])
      .eq('is_active', true)
      .order('full_name')

    if (error) {
      console.error('Erro ao buscar gestores:', error)
      return NextResponse.json({ error: 'Erro ao buscar gestores' }, { status: 500 })
    }

    return NextResponse.json({ managers })
  } catch (error) {
    console.error('Erro na API de gestores:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
