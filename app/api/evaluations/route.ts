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
  knowledge_score?: number | null
  skill_score?: number | null
  attitude_score?: number | null
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('evaluations')
      .select(
        `
        id, status, overall_score, comments, submitted_at, created_at,
        knowledge_score, skill_score, attitude_score,
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
      knowledge_score: row.knowledge_score,
      skill_score: row.skill_score,
      attitude_score: row.attitude_score,
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
      skills = [],
      submitted = false,
      knowledge_score: knowledgeScoreFromClient,
      skill_score: skillScoreFromClient,
      attitude_score: attitudeScoreFromClient,
    } = body

    if (!employee_id || !cycle_id || !evaluator_id) {
      return NextResponse.json({ message: 'cycle_id, employee_id e evaluator_id são obrigatórios.' }, { status: 400 })
    }

    const supabase = await createClient()

    const submitted_at = submitted ? new Date().toISOString() : null
    let computedOverall: number | null = null
    let computedKnowledge: number | null = null
    let computedSkill: number | null = null
    let computedAttitude: number | null = null
    if (Array.isArray(skills) && skills.length > 0) {
      const toNum = (n: any) => (typeof n === 'number' ? n : null)
      const knowledge: number[] = []
      const skill: number[] = []
      const attitude: number[] = []
      const all: number[] = []

      for (const s of skills) {
        const score = toNum((s as any).score)
        if (score === null) continue
        all.push(score)
        const cat = (s as any).category as 'conhecimento'|'habilidade'|'atitude'|undefined
        if (cat === 'conhecimento') knowledge.push(score)
        else if (cat === 'habilidade') skill.push(score)
        else if (cat === 'atitude') attitude.push(score)
      }

      const avg = (arr: number[]) => arr.length > 0 ? parseFloat((arr.reduce((a,b)=>a+b,0) / arr.length).toFixed(1)) : null
      computedOverall = avg(all)
      computedKnowledge = avg(knowledge)
      computedSkill = avg(skill)
      computedAttitude = avg(attitude)
    }

    const evaluationData: EvaluationInsert = {
      cycle_id,
      employee_id,
      evaluator_id,
      status,
      comments,
      strengths,
      improvements,
      goals,
      overall_score: computedOverall ?? (typeof overall_score === 'number' ? overall_score : null),
      knowledge_score: typeof knowledgeScoreFromClient === 'number' ? knowledgeScoreFromClient : computedKnowledge ?? null,
      skill_score: typeof skillScoreFromClient === 'number' ? skillScoreFromClient : computedSkill ?? null,
      attitude_score: typeof attitudeScoreFromClient === 'number' ? attitudeScoreFromClient : computedAttitude ?? null,
      submitted_at,
    }

    const { data: created, error: insertError } = await supabase
      .from('evaluations')
      .insert([evaluationData] as any)
      .select('id')
      .single() as { data: { id: string } | null, error: any }

    if (insertError || !created) {
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
        return NextResponse.json({ message: 'Avaliação criada, mas falhou ao salvar competências', error: skillsError.message }, { status: 207 })
      }
    }

    return NextResponse.json({ id: created.id }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ message: 'Falha inesperada', error: e?.message }, { status: 500 })
  }
}


