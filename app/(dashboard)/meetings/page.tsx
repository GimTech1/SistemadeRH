'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Clock, CalendarDays, RefreshCw, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'

type Department = {
  id: string
  name: string
  description: string | null
}

type MeetingRow = {
  id: string
  department_id: string
  date: string
  scheduled_time: string | null
  done: boolean
  done_at: string | null
  no_meeting?: boolean
  notes?: string | null
  quality?: number | null
  metrics?: Record<string, number> | null
}

export default function MeetingsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const getLocalISODate = () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const [date, setDate] = useState<string>(() => getLocalISODate())
  const [meetingsByDept, setMeetingsByDept] = useState<Record<string, MeetingRow | undefined>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [auditOpenFor, setAuditOpenFor] = useState<string | null>(null)
  const [auditNotes, setAuditNotes] = useState<string>('')
  const [auditQuality, setAuditQuality] = useState<number>(3)
  const [auditMetrics, setAuditMetrics] = useState<Record<string, number>>({
    pontualidade: 3,
    duracao: 3,
    participacao: 3,
    objetivos: 3,
    decisoes: 3,
    followups: 3,
    satisfacao: 3,
  })
  const allowedUserIds = useMemo(() => [
    'd4f6ea0c-0ddc-41a4-a6d4-163fea1916c3',
    'c8ee5614-8730-477e-ba59-db4cd8b83ce8',
    '02088194-3439-411d-bdfb-05a255d8be24',
    '8370f649-8379-4f7b-b618-63bf4511b901',
  ], [])

  const total = departments.length
  const doneCount = useMemo(() => departments.reduce((acc, d) => acc + (meetingsByDept[d.id]?.done ? 1 : 0), 0), [departments, meetingsByDept])

  const formatDate = (iso: string) => {
    if (!iso) return ''
    const [y, m, d] = iso.split('-')
    if (!y || !m || !d) return iso
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`
  }

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !allowedUserIds.includes(user.id)) {
          toast.error('Você não tem acesso a esta página')
          router.push('/dashboard')
          return
        }
      } catch (e) {
        router.push('/dashboard')
      }
    }
    checkAccess()
  }, [router, supabase, allowedUserIds])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [deptRes, meetingsRes] = await Promise.all([
          fetch('/api/departments'),
          fetch(`/api/department_meetings?date=${date}`)
        ])

        const deptJson = await deptRes.json()
        if (!deptRes.ok) throw new Error(deptJson.error || 'Erro ao carregar departamentos')

        const meetingsJson = await meetingsRes.json()
        if (!meetingsRes.ok) throw new Error(meetingsJson.error || 'Erro ao carregar reuniões')

        setDepartments(deptJson.departments)
        const map: Record<string, MeetingRow> = {}
        ;(meetingsJson.meetings as MeetingRow[]).forEach((m) => { map[m.department_id] = m })
        setMeetingsByDept(map)
      } catch (e: any) {
        toast.error(e?.message || 'Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [date])

  const toggleDone = async (departmentId: string) => {
    try {
      setSavingId(departmentId)
      const current = meetingsByDept[departmentId]
      const nextDone = !current?.done
      const hasTime = Boolean(current?.scheduled_time && String(current?.scheduled_time).trim())
      if (!hasTime && nextDone) {
        toast.error('Defina um horário antes de confirmar a reunião')
        return
      }
      const res = await fetch('/api/department_meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department_id: departmentId, date, done: nextDone, no_meeting: false, scheduled_time: current?.scheduled_time ?? null })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao salvar')
      setMeetingsByDept(prev => ({ ...prev, [departmentId]: json.meeting as MeetingRow }))
      toast.success(nextDone ? 'Reunião marcada como realizada' : 'Confirmação removida')
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao salvar')
    } finally {
      setSavingId(null)
    }
  }

  const setTime = async (departmentId: string, time: string) => {
    try {
      setSavingId(departmentId)
      const current = meetingsByDept[departmentId]
      const res = await fetch('/api/department_meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department_id: departmentId, date, done: current?.done ?? false, no_meeting: current?.no_meeting ?? false, scheduled_time: time || null, notes: current?.notes ?? null, quality: current?.quality ?? null, metrics: current?.metrics ?? null })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao salvar horário')
      setMeetingsByDept(prev => ({ ...prev, [departmentId]: json.meeting as MeetingRow }))
      toast.success('Horário salvo')
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao salvar horário')
    } finally {
      setSavingId(null)
    }
  }

  const toggleNoMeeting = async (departmentId: string) => {
    try {
      setSavingId(departmentId)
      const current = meetingsByDept[departmentId]
      const nextNoMeeting = !current?.no_meeting
      const res = await fetch('/api/department_meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department_id: departmentId, date, done: false, no_meeting: nextNoMeeting, scheduled_time: current?.scheduled_time ?? null, notes: current?.notes ?? null, quality: current?.quality ?? null, metrics: current?.metrics ?? null })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao salvar')
      setMeetingsByDept(prev => ({ ...prev, [departmentId]: json.meeting as MeetingRow }))
      toast.success(nextNoMeeting ? 'Marcado como sem reunião no dia' : 'Marca de sem reunião removida')
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao salvar')
    } finally {
      setSavingId(null)
    }
  }

  const openAudit = (departmentId: string) => {
    const current = meetingsByDept[departmentId]
    setAuditOpenFor(departmentId)
    setAuditNotes(current?.notes || '')
    setAuditQuality(current?.quality ?? 3)
    setAuditMetrics({
      pontualidade: current?.metrics?.pontualidade ?? 3,
      duracao: current?.metrics?.duracao ?? 3,
      participacao: current?.metrics?.participacao ?? 3,
      objetivos: current?.metrics?.objetivos ?? 3,
      decisoes: current?.metrics?.decisoes ?? 3,
      followups: current?.metrics?.followups ?? 3,
      satisfacao: current?.metrics?.satisfacao ?? 3,
    })
  }

  const saveAudit = async () => {
    if (!auditOpenFor) return
    try {
      setSavingId(auditOpenFor)
      const current = meetingsByDept[auditOpenFor]
      const res = await fetch('/api/department_meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department_id: auditOpenFor,
          date,
          done: current?.done ?? false,
          no_meeting: current?.no_meeting ?? false,
          scheduled_time: current?.scheduled_time ?? null,
          notes: auditNotes || null,
          quality: auditQuality ?? null,
          metrics: auditMetrics,
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao salvar auditoria')
      setMeetingsByDept(prev => ({ ...prev, [auditOpenFor]: json.meeting as MeetingRow }))
      toast.success('Auditoria salva')
      setAuditOpenFor(null)
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao salvar auditoria')
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-oxford-blue-600 font-roboto font-light">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-roboto font-medium text-rich-black-900 tracking-wide">Marque diariamente se a reunião ocorreu no horário previsto</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-platinum-200 rounded-xl px-3 py-2">
            <CalendarDays className="w-4 h-4 text-oxford-blue-500" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent outline-none text-rich-black-900 text-sm"
            />
          </div>
          <button
            onClick={() => setDate(getLocalISODate())}
            className="px-4 py-2 rounded-xl bg-yinmn-blue-600 text-white text-sm hover:bg-yinmn-blue-700 transition-all"
          >
            Hoje
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const row = meetingsByDept[dept.id]
          const isDone = !!row?.done
          const isNoMeeting = !!row?.no_meeting
          const timeValue = row?.scheduled_time ?? ''
          const isSaving = savingId === dept.id
          return (
            <div key={dept.id} className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-roboto font-medium text-rich-black-900">{dept.name}</h3>
                  <p className="text-sm font-roboto font-light text-oxford-blue-600">{dept.description}</p>
                </div>
                <Link href={`/departments/${dept.id}`} className="text-oxford-blue-500 text-sm hover:underline">Detalhes</Link>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-oxford-blue-500" />
                  <input
                    type="time"
                    value={timeValue}
                    onChange={(e) => setTime(dept.id, e.target.value)}
                    className="border border-platinum-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <button
                  disabled={isSaving || isNoMeeting || !timeValue}
                  onClick={() => toggleDone(dept.id)}
                  title={!timeValue ? 'Defina um horário para habilitar' : undefined}
                  className={`px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isDone ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-yinmn-blue-600 text-white hover:bg-yinmn-blue-700'}`}
                >
                  {isDone ? 'Reunião confirmada' : 'Confirmar reunião'}
                </button>
                <button
                  disabled={isSaving}
                  onClick={() => toggleNoMeeting(dept.id)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all ${isNoMeeting ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-platinum-100 text-oxford-blue-700 hover:bg-platinum-200'}`}
                >
                  {isNoMeeting ? 'Sem reunião (ativado)' : 'Não houve reunião'}
                </button>
                {isDone && !isNoMeeting && (
                  <button
                    disabled={isSaving}
                    onClick={() => openAudit(dept.id)}
                    className="px-4 py-2 rounded-xl text-sm transition-all bg-platinum-100 text-oxford-blue-700 hover:bg-platinum-200"
                  >
                    Avaliar reunião
                  </button>
                )}
              </div>

              {isDone && (
                <div className="flex items-center gap-2 text-emerald-700 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Reunião confirmada para {formatDate(date)}{timeValue ? ` às ${timeValue}` : ''}</span>
                </div>
              )}
              {!isDone && isNoMeeting && (
                <div className="flex items-center gap-2 text-amber-700 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Não houve reunião em {formatDate(date)}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Dialog.Root open={!!auditOpenFor} onOpenChange={(o) => !o && setAuditOpenFor(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none"
          >
            <div className="w-[min(100vw-2rem,36rem)] bg-white rounded-2xl shadow-2xl border border-platinum-200 overflow-hidden">
              <div className="p-6 border-b border-platinum-200 bg-white">
                <Dialog.Title className="text-lg font-roboto font-semibold text-rich-black-900">Avaliação da Reunião</Dialog.Title>
                <Dialog.Description className="text-sm font-roboto font-light text-oxford-blue-600 mt-1">
                  Atribua notas de 1 a 5 para cada métrica e adicione observações
                </Dialog.Description>
              </div>
              <div className="p-6 space-y-4">
                {Object.entries(auditMetrics).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-4">
                    <label className="text-sm font-roboto font-medium text-rich-black-900 capitalize">{key}</label>
                    <div className="relative">
                      <select
                        value={value}
                        onChange={(e) => setAuditMetrics(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                        className="px-3 py-2 pr-8 bg-white border border-platinum-300 rounded-xl text-rich-black-900 text-sm appearance-none"
                        style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', backgroundImage: 'none' }}
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-oxford-blue-400" />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">Observações</label>
                  <textarea
                    rows={4}
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-xl text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent font-roboto resize-none"
                    placeholder="Pontualidade, duração, participação, objetivos, decisões, follow-ups, satisfação..."
                  />
                </div>
              </div>
              <div className="p-6 border-t border-platinum-200 bg-platinum-50 flex items-center justify-end gap-3">
                <button onClick={() => setAuditOpenFor(null)} className="px-6 py-3 text-oxford-blue-600 hover:text-oxford-blue-700 font-roboto font-medium transition-all duration-200">Cancelar</button>
                <button onClick={saveAudit} className="px-6 py-3 bg-yinmn-blue-600 hover:bg-yinmn-blue-700 text-white rounded-xl font-roboto font-medium transition-all duration-200">Salvar Avaliação</button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-roboto font-medium text-oxford-blue-600">Resumo do dia</p>
          <div className="text-sm font-roboto"><span className="font-semibold">{doneCount}</span> de <span className="font-semibold">{total}</span> departamentos com reunião realizada</div>
        </div>
        <div className="mt-3 w-full h-2 bg-platinum-200 rounded-full">
          <div className="h-2 bg-gradient-to-r from-yinmn-blue-500 to-yinmn-blue-600 rounded-full" style={{ width: `${total ? Math.round((doneCount/total)*100) : 0}%` }} />
        </div>
      </div>
    </div>
  )
}


