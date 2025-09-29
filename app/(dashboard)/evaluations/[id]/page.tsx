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
  comments: string | null
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
            id, status, overall_score, comments, submitted_at, created_at,
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
          comments: evalRow.comments,
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
          console.error('Erro ao carregar competências:', skillsError)
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
      {/* Header */}
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
        <Link href={`/evaluations/${header.id}/edit`}>
          <button className="text-white px-4 py-2 rounded-xl font-roboto font-medium transition-all duration-200 hover:opacity-90 flex items-center gap-2" style={{ backgroundColor: '#1B263B' }}>
            <Edit className="h-4 w-4" /> Editar
          </button>
        </Link>
      </div>

      {/* Info cards */}
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

      {/* Lista de competências */}
      <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 overflow-hidden">
        <div className="p-6 border-b border-platinum-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-oxford-blue-500" />
            <span className="text-sm font-medium text-rich-black-900">Competências Avaliadas</span>
          </div>
        </div>
        <div className="divide-y divide-platinum-200">
          {items.length === 0 && (
            <div className="p-6 text-sm text-oxford-blue-600">Nenhuma competência registrada.</div>
          )}
          {items.map((row) => {
            const Icon = categoryIcon[row.skill_category]
            return (
              <div key={row.id} className="p-6 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-platinum-100">
                    <Icon className="h-4 w-4 text-oxford-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-rich-black-900">{row.skill_name}</p>
                    {row.comments && (
                      <p className="text-xs text-oxford-blue-600 mt-1">{row.comments}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-oxford-blue-500">Pontuação</p>
                  <p className="text-lg font-semibold text-rich-black-900">{row.score ?? '—'}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


