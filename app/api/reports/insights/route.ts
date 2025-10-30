import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'OPENAI_API_KEY ausente' }, { status: 500 })

    const body = await request.json().catch(() => ({}))
    const { period = 'month', departmentId, overviewSample } = body || {}

    const system = `Você é um analista sênior de RH e performance. Gere insights curtos, práticos e acionáveis.
    Regras:
    - Linguagem: Português do Brasil, tom profissional e claro.
    - Foque em tendências, outliers e recomendações objetivas.
    - Se dados estiverem vazios/incompletos, explique o impacto brevemente.
    - FORMATO DE SAÍDA: retorne APENAS JSON válido (sem comentários), no formato:
      {
        "insights": [{ "title": string, "detail": string }],
        "recommendations": [string],
        "risk": string
      }`

    const userContent = {
      period,
      departmentId: departmentId || 'all',
      data: overviewSample || {},
    }

    const messages = [
      { role: 'system', content: system },
      { role: 'user', content: `Analise o JSON a seguir e gere a saída EXATAMENTE no formato especificado (apenas JSON válido).
        Preferir 3 a 6 "insights" (cada um com title e detail curtos), 2 a 4 "recommendations" e um "risk".
        INPUT_JSON:
        ${JSON.stringify(userContent)}
      ` }
    ]

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.2,
        max_tokens: 600
      })
    })

    if (!resp.ok) {
      const err = await resp.text()
      return NextResponse.json({ error: 'Falha ao gerar insights', details: err }, { status: 500 })
    }

    const data = await resp.json()
    const content = data?.choices?.[0]?.message?.content || ''
    let structured: any = null
    try {
      structured = JSON.parse(content)
    } catch {}

    if (!structured || typeof structured !== 'object') {
      return NextResponse.json({
        insights: {
          insights: [],
          recommendations: [],
          risk: ''
        },
        raw: content || 'Sem conteúdo.'
      })
    }

    return NextResponse.json({ insights: structured })
  } catch (error) {
    console.error('Erro em /api/reports/insights:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}


