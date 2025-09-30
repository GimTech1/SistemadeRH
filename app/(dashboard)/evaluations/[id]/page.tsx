'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Calendar,
  ClipboardCheck,
  Star,
  Brain,
  Zap,
  Heart,
  Loader2,
  Edit,
} from 'lucide-react'

interface EvaluationDetails {
  id: string
  status: 'draft' | 'in_progress' | 'completed' | 'reviewed'
  overall_score: number | null
  knowledge_score?: number | null
  skill_score?: number | null
  attitude_score?: number | null
  comments: string | null
  strengths: string | null
  improvements: string | null
  goals: string | null
  submitted_at: string | null
  created_at: string
  employee_name: string
  evaluator_name: string
  cycle_name: string
}

interface EvaluationSkillRow {
  id: string
  score: number | null
  comments: string | null
  skill_name: string
  skill_category: 'conhecimento' | 'habilidade' | 'atitude'
}

interface EvaluationWithRelations {
  id: string
  status: 'draft' | 'in_progress' | 'completed' | 'reviewed'
  overall_score: number | null
  comments: string | null
  submitted_at: string | null
  created_at: string
  employee: {
    full_name: string
  } | null
  evaluator: {
    full_name: string
  } | null
  cycle: {
    name: string
  } | null
}

export default function ViewEvaluationPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [header, setHeader] = useState<EvaluationDetails | null>(null)
  const [items, setItems] = useState<EvaluationSkillRow[]>([])
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      if (!params?.id) return
      setLoading(true)
      try {
        const { data: evalRow, error: evalError } = await supabase
          .from('evaluations')
          .select(`
            id, status, overall_score, knowledge_score, skill_score, attitude_score, comments, strengths, improvements, goals, submitted_at, created_at,
            employee:employee_id ( full_name ),
            evaluator:evaluator_id ( full_name ),
            cycle:cycle_id ( name )
          `)
          .eq('id', params.id)
          .single() as { data: EvaluationWithRelations | null, error: any }

        if (evalError || !evalRow) {
          router.push('/evaluations')
          return
        }

        setHeader({
          id: evalRow.id,
          status: evalRow.status,
          overall_score: evalRow.overall_score,
          knowledge_score: (evalRow as any).knowledge_score ?? null,
          skill_score: (evalRow as any).skill_score ?? null,
          attitude_score: (evalRow as any).attitude_score ?? null,
          comments: evalRow.comments,
          strengths: (evalRow as any).strengths ?? null,
          improvements: (evalRow as any).improvements ?? null,
          goals: (evalRow as any).goals ?? null,
          submitted_at: evalRow.submitted_at,
          created_at: evalRow.created_at,
          employee_name: evalRow.employee?.full_name ?? '—',
          evaluator_name: evalRow.evaluator?.full_name ?? '—',
          cycle_name: evalRow.cycle?.name ?? '—',
        })

        const { data: skillRows, error: skillsError } = await supabase
          .from('evaluation_skills')
          .select('id, score, comments, skill:skill_id ( name, category )')
          .eq('evaluation_id', params.id)

        if (skillsError) {
        }

        const mapped: EvaluationSkillRow[] = (skillRows || []).map((r: any) => ({
          id: r.id,
          score: r.score,
          comments: r.comments,
          skill_name: r.skill?.name ?? '—',
          skill_category: r.skill?.category ?? 'conhecimento',
        }))
        setItems(mapped)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [params?.id, supabase, router])

  const categoryIcon = useMemo(() => ({
    conhecimento: Brain,
    habilidade: Zap,
    atitude: Heart,
  }), [])

  const groupedByCategory = useMemo(() => {
    const groups: Record<'conhecimento'|'habilidade'|'atitude', EvaluationSkillRow[]> = {
      conhecimento: [],
      habilidade: [],
      atitude: [],
    }
    for (const it of items) {
      groups[it.skill_category]?.push(it)
    }
    return groups
  }, [items])

  const categoryAverage = (rows: EvaluationSkillRow[], cat: 'conhecimento'|'habilidade'|'atitude') => {
    if (header) {
      if (cat === 'conhecimento' && typeof header.knowledge_score === 'number') return header.knowledge_score.toFixed(1)
      if (cat === 'habilidade' && typeof header.skill_score === 'number') return header.skill_score.toFixed(1)
      if (cat === 'atitude' && typeof header.attitude_score === 'number') return header.attitude_score.toFixed(1)
    }
    const scores = rows.map(r => r.score ?? 0)
    if (scores.length === 0) return '0.0'
    const avg = scores.reduce((a,b)=>a+b,0) / scores.length
    return avg.toFixed(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-oxford-blue-600">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Carregando avaliação...
      </div>
    )
  }

  if (!header) {
    return (
      <div className="p-6">
        <Link href="/evaluations">
          <button className="p-2 hover:bg-platinum-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-oxford-blue-600" />
          </button>
        </Link>
        <div className="mt-6 text-oxford-blue-600">Avaliação não encontrada.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/evaluations">
            <button className="p-2 hover:bg-platinum-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-oxford-blue-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-roboto font-medium text-rich-black-900">Avaliação</h1>
            <p className="text-sm text-oxford-blue-600">{header.employee_name} • {header.cycle_name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-oxford-blue-500" />
            <div>
              <p className="text-xs text-oxford-blue-500">Colaborador</p>
              <p className="text-sm font-medium text-rich-black-900">{header.employee_name}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-5 w-5 text-oxford-blue-500" />
            <div>
              <p className="text-xs text-oxford-blue-500">Status</p>
              <p className="text-sm font-medium text-rich-black-900">{header.status}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-xs text-oxford-blue-500">Nota Geral</p>
              <p className="text-sm font-medium text-rich-black-900">{header.overall_score ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
          <h3 className="text-sm font-roboto font-medium text-rich-black-900 mb-2">Forças</h3>
          <p className="text-sm text-oxford-blue-700 whitespace-pre-line">{header.strengths ?? '—'}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
          <h3 className="text-sm font-roboto font-medium text-rich-black-900 mb-2">Melhorias</h3>
          <p className="text-sm text-oxford-blue-700 whitespace-pre-line">{header.improvements ?? '—'}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
          <h3 className="text-sm font-roboto font-medium text-rich-black-900 mb-2">Metas</h3>
          <p className="text-sm text-oxford-blue-700 whitespace-pre-line">{header.goals ?? '—'}</p>
        </div>
      </div>

      {(['conhecimento','habilidade','atitude'] as const).map(cat => {
        const Icon = categoryIcon[cat]
        const rows = groupedByCategory[cat]
        return (
          <div key={cat} className="bg-white rounded-2xl shadow-sm border border-platinum-200 overflow-hidden">
            <div className="p-6 border-b border-platinum-200 bg-gradient-to-r from-platinum-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-platinum-100"><Icon className="h-5 w-5 text-oxford-blue-600"/></div>
                  <div>
                    <h3 className="text-lg font-roboto font-medium text-rich-black-900 capitalize">{cat}</h3>
                    <p className="text-xs text-oxford-blue-600">Avalie cada competência de 0 a 10</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-oxford-blue-500">Média da Categoria</p>
                  <p className="text-xl font-roboto font-semibold text-rich-black-900">{categoryAverage(rows, cat)}</p>
                </div>
              </div>
            </div>
            {rows.length === 0 ? (
              <div className="p-6 text-sm text-oxford-blue-600">Nenhuma competência registrada.</div>
            ) : (
              <div className="divide-y divide-platinum-200">
                {rows.map((row) => (
                  <div key={row.id} className="p-6 flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-medium text-rich-black-900">{row.skill_name}</p>
                      {row.comments && (
                        <p className="text-xs text-oxford-blue-600 mt-1 whitespace-pre-line">{row.comments}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-oxford-blue-500">Pontuação</p>
                      <p className="text-2xl font-semibold text-rich-black-900">{row.score ?? '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}


