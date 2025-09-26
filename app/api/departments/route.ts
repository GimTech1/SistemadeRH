import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

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
