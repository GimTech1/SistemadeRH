import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface EvaluationInsert {
  cycle_id: string
  employee_id: string
  evaluator_id: string
  status: string
  comments: string | null
  strengths: string | null
  improvements: string | null
  goals: string | null
  overall_score: number | null
  submitted_at: string | null
}

// GET /api/evaluations -> lista avaliações com joins básicos
export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('evaluations')
      .select(
        `
        id, status, overall_score, comments, submitted_at, created_at,
        employee:employee_id ( id, full_name ),
        evaluator:evaluator_id ( id, full_name ),
        cycle:cycle_id ( id, name )
      `
      )
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ message: 'Erro ao buscar avaliações', error: error.message }, { status: 500 })
    }

    const mapped = (data || []).map((row: any) => ({
      id: row.id,
      status: row.status,
      overall_score: row.overall_score,
      created_at: row.created_at,
      submitted_at: row.submitted_at,
      employee_name: row.employee?.full_name ?? '—',
      evaluator_name: row.evaluator?.full_name ?? '—',
      cycle_name: row.cycle?.name ?? '—',
    }))

    return NextResponse.json({ evaluations: mapped })
  } catch (e: any) {
    return NextResponse.json({ message: 'Falha inesperada', error: e?.message }, { status: 500 })
  }
}

// POST /api/evaluations -> cria avaliação e itens de competências (evaluation_skills)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      cycle_id,
      employee_id,
      evaluator_id,
      status = 'draft',
      comments = null,
      strengths = null,
      improvements = null,
      goals = null,
      overall_score = null,
      skills = [], // [{ skill_id, score, comments }]
      submitted = false,
    } = body

    if (!employee_id || !cycle_id || !evaluator_id) {
      return NextResponse.json({ message: 'cycle_id, employee_id e evaluator_id são obrigatórios.' }, { status: 400 })
    }

    const supabase = await createClient()

    const submitted_at = submitted ? new Date().toISOString() : null

    const evaluationData: EvaluationInsert = {
      cycle_id,
      employee_id,
      evaluator_id,
      status,
      comments,
      strengths,
      improvements,
      goals,
      overall_score,
      submitted_at,
    }

    const { data: created, error: insertError } = await supabase
      .from('evaluations')
      .insert([evaluationData] as any)
      .select('id')
      .single() as { data: { id: string } | null, error: any }

    if (insertError || !created) {
      console.error('POST /api/evaluations insert error:', insertError)
      const status = insertError?.message?.toLowerCase().includes('permission denied') ? 403 : 500
      return NextResponse.json({ message: 'Erro ao criar avaliação', error: insertError?.message }, { status })
    }

    if (Array.isArray(skills) && skills.length > 0) {
      const rows = skills.map((s: any) => ({
        evaluation_id: created.id,
        skill_id: s.skill_id,
        score: typeof s.score === 'number' ? s.score : null,
        comments: s.comments ?? null,
      }))

      const { error: skillsError } = await supabase.from('evaluation_skills').insert(rows as any)
      if (skillsError) {
        console.error('POST /api/evaluations skills insert error:', skillsError)
        return NextResponse.json({ message: 'Avaliação criada, mas falhou ao salvar competências', error: skillsError.message }, { status: 207 })
      }
    }

    return NextResponse.json({ id: created.id }, { status: 201 })
  } catch (e: any) {
    console.error('POST /api/evaluations unexpected error:', e)
    return NextResponse.json({ message: 'Falha inesperada', error: e?.message }, { status: 500 })
  }
}


