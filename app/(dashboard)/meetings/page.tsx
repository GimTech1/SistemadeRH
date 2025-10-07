'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Clock, CalendarDays, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  const allowedUserIds = useMemo(() => [
    'd4f6ea0c-0ddc-41a4-a6d4-163fea1916c3',
    'c8ee5614-8730-477e-ba59-db4cd8b83ce8',
    '02088194-3439-411d-bdfb-05a255d8be24',
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
        body: JSON.stringify({ department_id: departmentId, date, done: current?.done ?? false, no_meeting: current?.no_meeting ?? false, scheduled_time: time || null })
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
        body: JSON.stringify({ department_id: departmentId, date, done: false, no_meeting: nextNoMeeting, scheduled_time: current?.scheduled_time ?? null })
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
                  disabled={isSaving || isNoMeeting}
                  onClick={() => toggleDone(dept.id)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all ${isDone ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-yinmn-blue-600 text-white hover:bg-yinmn-blue-700'}`}
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


