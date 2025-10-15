import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    const typed = supabase as any
    const { data: profile, error: profileErr } = await typed
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileErr || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Apenas administradores podem convidar usuários' }, { status: 403 })
    }

    const body = await request.json()
    const { email, redirectTo } = body as { email?: string; redirectTo?: string }

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Service role não configurada' }, { status: 500 })
    }

    const admin = createAdminClient(url, serviceKey)

    const redirectUrl = redirectTo || 'https://rh.investmoneysa.com.br/register'
    const { data, error } = await (admin as any).auth.admin.inviteUserByEmail(email, {
      redirectTo: redirectUrl,
    })

    if (error) {
      return NextResponse.json({ error: `Erro ao enviar convite: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ invitation: data }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


