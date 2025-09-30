'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SkillItem {
  id: string
  name: string
  category: 'conhecimento' | 'habilidade' | 'atitude'
}

interface EvaluationSkillEditRow {
  id?: string
  skill_id: string
  score: number | null
  comments: string | null
}

interface EvaluationWithRelations {
  id: string
  employee: {
    full_name: string
  } | null
  cycle: {
    name: string
  } | null
}

export default function EditEvaluationPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('Editar Avaliação')
  const [rows, setRows] = useState<EvaluationSkillEditRow[]>([])
  const [skills, setSkills] = useState<SkillItem[]>([])
  const [strengths, setStrengths] = useState('')
  const [improvements, setImprovements] = useState('')
  const [goals, setGoals] = useState('')
  const [grouped, setGrouped] = useState<Record<'conhecimento'|'habilidade'|'atitude', EvaluationSkillEditRow[]>>({
    conhecimento: [],
    habilidade: [],
    atitude: [],
  })

  useEffect(() => {
    const load = async () => {
      if (!params?.id) return
      setLoading(true)
      try {
        const { data: evalRow, error } = await supabase
          .from('evaluations')
          .select(`id, employee:employee_id ( full_name ), cycle:cycle_id ( name )`)
          .eq('id', params.id)
          .single() as { data: EvaluationWithRelations | null, error: any }

        if (error || !evalRow) {
          router.push('/evaluations')
          return
        }

        setTitle(`Editar Avaliação • ${evalRow.employee?.full_name ?? '—'} • ${evalRow.cycle?.name ?? '—'}`)

        const { data: meta } = await supabase
          .from('evaluations')
          .select('strengths, improvements, goals')
          .eq('id', params.id)
          .single()

        setStrengths((meta as any)?.strengths ?? '')
        setImprovements((meta as any)?.improvements ?? '')
        setGoals((meta as any)?.goals ?? '')

        const { data: allSkills } = await supabase
          .from('skills')
          .select('id, name, category')

        const allSkillsArr = (allSkills || []) as SkillItem[]
        setSkills(allSkillsArr)

        const { data: evalSkills, error: evalSkillsError } = await supabase
          .from('evaluation_skills')
          .select('id, evaluation_id, skill_id, score, comments')
          .eq('evaluation_id', params.id)

        if (evalSkillsError) {
        }

        const mapped = (evalSkills || []).map((r: any) => ({
          id: r.id,
          skill_id: r.skill_id,
          score: r.score,
          comments: r.comments,
        }))
        setRows(mapped)
        const nextGrouped = { conhecimento: [] as EvaluationSkillEditRow[], habilidade: [] as EvaluationSkillEditRow[], atitude: [] as EvaluationSkillEditRow[] }
        for (const row of mapped) {
          const info = allSkillsArr.find((s) => s.id === row.skill_id)
          const cat = (info?.category ?? 'conhecimento') as 'conhecimento'|'habilidade'|'atitude'
          nextGrouped[cat].push(row)
        }
        setGrouped(nextGrouped)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [params?.id, supabase, router])

  const handleChange = (idx: number, patch: Partial<EvaluationSkillEditRow>) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, ...patch } : r))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates = rows.map(r => ({ id: r.id, score: r.score, comments: r.comments }))
      const toUpdate = updates.filter(u => u.id)
      if (toUpdate.length > 0) {
        const { error } = await (supabase as any)
          .from('evaluation_skills')
          .upsert(toUpdate, { onConflict: 'id' })
        if (error) throw error
      }

      
      const numericScores = rows
        .map(r => (typeof r.score === 'number' ? r.score : null))
        .filter((n): n is number => typeof n === 'number')
      const overall = numericScores.length > 0
        ? parseFloat((numericScores.reduce((a,b)=>a+b,0) / numericScores.length).toFixed(1))
        : null

      const withCat = rows.map(r => {
        const info = skills.find(s => s.id === r.skill_id)
        return { score: r.score, category: info?.category }
      })
      const avg = (arr: (number|null|undefined)[]) => {
        const nums = arr.filter((n): n is number => typeof n === 'number')
        return nums.length ? parseFloat((nums.reduce((a,b)=>a+b,0) / nums.length).toFixed(1)) : null
      }
      const kAvg = avg(withCat.filter(x => x.category === 'conhecimento').map(x => x.score ?? null))
      const sAvg = avg(withCat.filter(x => x.category === 'habilidade').map(x => x.score ?? null))
      const aAvg = avg(withCat.filter(x => x.category === 'atitude').map(x => x.score ?? null))

      
      const { error: evalError } = await (supabase as any)
        .from('evaluations')
        .update({
          strengths: strengths.trim() || null,
          improvements: improvements.trim() || null,
          goals: goals.trim() || null,
          overall_score: overall,
          knowledge_score: kAvg,
          skill_score: sAvg,
          attitude_score: aAvg,
        })
        .eq('id', params.id)
      if (evalError) throw evalError
      toast.success('Avaliação atualizada com sucesso!')
      router.push(`/evaluations/${params.id}`)
    } catch (e: any) {
      toast.error('Erro ao salvar avaliação')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-oxford-blue-600">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Carregando avaliação...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/evaluations/${params.id}`}>
          <button className="p-2 hover:bg-platinum-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-oxford-blue-600" />
          </button>
        </Link>
        <h1 className="text-xl font-roboto font-medium text-rich-black-900">{title}</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-white px-4 py-2 rounded-xl font-roboto font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
          style={{ backgroundColor: '#1B263B' }}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {(['conhecimento','habilidade','atitude'] as const).map(cat => (
        <div key={cat} className="bg-white rounded-2xl shadow-sm border border-platinum-200 overflow-hidden">
          <div className="p-6 border-b border-platinum-200">
            <h2 className="text-lg font-roboto font-medium text-rich-black-900 capitalize">{cat}</h2>
            <p className="text-sm text-oxford-blue-600">Atualize as pontuações e observações</p>
          </div>
          <div className="divide-y divide-platinum-200">
            {grouped[cat].length === 0 ? (
              <div className="p-6 text-sm text-oxford-blue-600">Nenhuma competência registrada.</div>
            ) : (
              grouped[cat].map((row) => {
                const idx = rows.findIndex(r => r.id === row.id)
                const skillInfo = skills.find(s => s.id === row.skill_id)
                return (
                  <div key={row.id ?? `${cat}-${idx}`} className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-roboto font-medium text-rich-black-900">{skillInfo?.name ?? 'Competência'}</p>
                        <p className="text-xs text-oxford-blue-500">{skillInfo?.category ?? ''}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={row.score ?? 0}
                          onChange={(e) => handleChange(idx, { score: Math.max(0, Math.min(10, Number(e.target.value))) })}
                          className="w-20 px-3 py-2 bg-white border border-platinum-300 rounded-lg text-right"
                        />
                      </div>
                    </div>
                    <div>
                      <textarea
                        value={row.comments ?? ''}
                        onChange={(e) => handleChange(idx, { comments: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-sm"
                        placeholder="Observações..."
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      ))}

      
      <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 overflow-hidden">
        <div className="p-6 border-b border-platinum-200">
          <h2 className="text-lg font-roboto font-medium text-rich-black-900">Análises e Metas</h2>
          <p className="text-sm text-oxford-blue-600">Atualize as seções de texto</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">Forças</label>
            <textarea
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-sm"
              placeholder="Pontos fortes..."
            />
          </div>
          <div>
            <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">Melhorias</label>
            <textarea
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-sm"
              placeholder="Pontos de melhoria..."
            />
          </div>
          <div>
            <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">Metas</label>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-sm"
              placeholder="Metas propostas..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}


