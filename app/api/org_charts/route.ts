import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

type OrgPayload = {
  tree: any
  assignments: Record<string, any>
}

export async function GET() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: userError,
    } = await (supabase as any).auth.getUser()
    if (userError || !user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { data, error } = await (supabase as unknown as import('@supabase/supabase-js').SupabaseClient<Database>)
      .from('org_charts')
      .select('data')
      .eq('id', user.id)
      .single<{ data: OrgPayload | null }>()

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })

    return NextResponse.json({ data: data?.data || null })
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Erro inesperado' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as OrgPayload
    const supabase = await createServerClient()
    const {
      data: { user },
      error: userError,
    } = await (supabase as any).auth.getUser()
    if (userError || !user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const payload = { id: user.id, data: body, updated_at: new Date().toISOString() }
    const { error } = await (supabase as unknown as import('@supabase/supabase-js').SupabaseClient<Database>)
      .from('org_charts')
      .upsert(payload as any, { onConflict: 'id' } as any)

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Erro inesperado' }, { status: 500 })
  }
}


