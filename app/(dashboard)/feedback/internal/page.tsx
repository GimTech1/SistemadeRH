'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import {
  Users,
  Star,
  Send,
  Search,
  Filter,
  MessageSquare,
  Award,
  TrendingUp,
  User,
  ChevronRight,
  Brain,
  Zap,
  Heart,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Plus,
  Eye,
  Edit,
  Grid3X3,
  List,
  Download,
  X,
  Gift,
  Sparkles,
  ThumbsUp,
  Target,
  Smile,
  AlertTriangle,
  Frown,
  ThumbsDown,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Colleague {
  id: string
  name: string
  position: string
  department: string
  avatar: string
  starsReceived: number
  dislikesReceived: number
  recentStars: Array<{
    id: string
    reason: string
    message: string
    from: string
    date: string
  }>
  recentDislikes: Array<{
    id: string
    reason: string
    message: string
    from: string
    date: string
  }>
  // Arrays completos (não enriquecidos) para modal
  allStars: any[]
  allDislikes: any[]
}

interface SupabaseColleague {
  id: string
  full_name: string | null
  position: string | null
  department: string | null
  stars_received: Array<{ count: number }> | null
  recent_stars: Array<{
    id: string
    reason: string
    message: string
    sender: { full_name: string } | null
    created_at: string
  }> | null
}

export default function InternalFeedbackPage() {
  const [colleagues, setColleagues] = useState<Colleague[]>([])
  const [selectedColleague, setSelectedColleague] = useState<Colleague | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [sortBy, setSortBy] = useState('stars')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [userStars, setUserStars] = useState({
    available: 3,
    used: 0,
    resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
  })

  // IDs dos usuários especiais com bypass de estrelas infinitas (do .env)
  const SPECIAL_USER_IDS = [
    process.env.NEXT_PUBLIC_WATSON_USER_ID,
    process.env.NEXT_PUBLIC_MATHEUS_USER_ID,
    process.env.NEXT_PUBLIC_ANA_USER_ID,
    process.env.NEXT_PUBLIC_BRUNO_RODRIGUES_USER_ID,
    process.env.NEXT_PUBLIC_SANDOVAL_USER_ID
  ].filter(Boolean) // Remove valores undefined/null

  // Função para verificar se o usuário atual tem bypass de estrelas infinitas
  const hasInfiniteStars = (userId: string | null) => {
    return userId ? SPECIAL_USER_IDS.includes(userId) : false
  }
  const [userDislikes, setUserDislikes] = useState({
    available: 3,
    used: 0,
    resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
  })
  const [starForm, setStarForm] = useState({
    reason: '',
    message: ''
  })
  const [dislikeForm, setDislikeForm] = useState({
    reason: '',
    message: ''
  })
  const [showStarModal, setShowStarModal] = useState(false)
  const [showDislikeModal, setShowDislikeModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'give' | 'received'>('give')
  const [receivedStars, setReceivedStars] = useState<any[]>([])
  const [receivedDislikes, setReceivedDislikes] = useState<any[]>([])
  const supabase = createClient()

  // Modal para ver todos os feedbacks recebidos
  const [showAllFeedbackModal, setShowAllFeedbackModal] = useState(false)
  const [modalColleague, setModalColleague] = useState<Colleague | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalStars, setModalStars] = useState<any[]>([])
  const [modalDislikes, setModalDislikes] = useState<any[]>([])

  const openAllFeedbackModal = async (colleague: Colleague) => {
    try {
      setModalLoading(true)
      setShowAllFeedbackModal(true)
      setModalColleague(colleague)

      // Enriquecer todas as estrelas com nome do remetente
      const enrichedStars = await Promise.all((colleague.allStars || []).map(async (star: any) => {
        try {
          const { data: senderData } = await supabase
            .from('employees')
            .select('full_name')
            .eq('id', star.user_id)
            .single()
          return {
            id: star.id,
            reason: star.reason,
            message: star.message,
            from: (senderData as any)?.full_name || 'Usuário',
            date: star.created_at
          }
        } catch {
          return {
            id: star.id,
            reason: star.reason,
            message: star.message,
            from: 'Usuário',
            date: star.created_at
          }
        }
      }))

      // Enriquecer todos os dislikes com nome do remetente
      const enrichedDislikes = await Promise.all((colleague.allDislikes || []).map(async (dislike: any) => {
        try {
          const { data: senderData } = await supabase
            .from('employees')
            .select('full_name')
            .eq('id', dislike.user_id)
            .single()
          return {
            id: dislike.id,
            reason: dislike.reason,
            message: dislike.message,
            from: (senderData as any)?.full_name || 'Usuário',
            date: dislike.created_at
          }
        } catch {
          return {
            id: dislike.id,
            reason: dislike.reason,
            message: dislike.message,
            from: 'Usuário',
            date: dislike.created_at
          }
        }
      }))

      // Ordenar por data desc
      enrichedStars.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      enrichedDislikes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setModalStars(enrichedStars)
      setModalDislikes(enrichedDislikes)
    } finally {
      setModalLoading(false)
    }
  }

  useEffect(() => {
    loadCurrentUser()
    loadColleagues()
    loadUserStars()
    loadUserDislikes()
    loadReceivedStars()
    loadReceivedDislikes()
  }, [])

  const loadCurrentUser = async () => {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (!error && data?.user) {
        setCurrentUserId(data.user.id)
      }
    } catch (err) {
      console.error('Erro ao obter usuário atual:', err)
    }
  }

  const loadUserStars = async () => {
    try {
      // Se o usuário atual tem bypass de estrelas infinitas, definir estrelas infinitas
      if (hasInfiniteStars(currentUserId)) {
        setUserStars({
          available: 999, // Estrelas infinitas
          used: 0,
          resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        })
        return
      }

      const response = await fetch('/api/stars')
      const data = await response.json()
      
      if (response.ok) {
        setUserStars({
          available: data.available,
          used: data.used,
          resetDate: new Date(data.resetDate)
        })
      }
    } catch (error) {
      console.error('Erro ao carregar estrelas do usuário:', error)
    }
  }

  const loadUserDislikes = async () => {
    try {
      const response = await fetch('/api/dislikes')
      const data = await response.json()
      
      if (response.ok) {
        setUserDislikes({
          available: data.available,
          used: data.used,
          resetDate: new Date(data.resetDate)
        })
      }
    } catch (error) {
      console.error('Erro ao carregar dislikes do usuário:', error)
    }
  }

  const loadReceivedStars = async () => {
    try {
      const response = await fetch('/api/stars/received')
      const data = await response.json()
      
      if (response.ok) {
        // Enriquecer cada estrela com o nome do remetente a partir de employees
        const enriched = await Promise.all((data.stars || []).map(async (star: any) => {
          try {
            const { data: senderData } = await supabase
              .from('employees')
              .select('full_name')
              .eq('id', star.user_id)
              .single()
            return { ...star, sender: { full_name: (senderData as any)?.full_name || 'Usuário' } }
          } catch {
            return { ...star, sender: { full_name: 'Usuário' } }
          }
        }))
        setReceivedStars(enriched)
      }
    } catch (error) {
      console.error('Erro ao carregar estrelas recebidas:', error)
    }
  }

  const loadReceivedDislikes = async () => {
    try {
      const response = await fetch('/api/dislikes/received')
      const data = await response.json()
      
      if (response.ok) {
        // Enriquecer cada dislike com o nome do remetente a partir de employees
        const enriched = await Promise.all((data.dislikes || []).map(async (dislike: any) => {
          try {
            const { data: senderData } = await supabase
              .from('employees')
              .select('full_name')
              .eq('id', dislike.user_id)
              .single()
            return { ...dislike, sender: { full_name: (senderData as any)?.full_name || 'Usuário' } }
          } catch {
            return { ...dislike, sender: { full_name: 'Usuário' } }
          }
        }))
        setReceivedDislikes(enriched)
      }
    } catch (error) {
      console.error('Erro ao carregar dislikes recebidos:', error)
    }
  }

  const loadColleagues = async () => {
    try {
      setLoading(true)
      
      // Buscar colegas da tabela employees
      const { data: colleaguesData, error: colleaguesError } = await supabase
        .from('employees')
        .select(`
          id,
          full_name,
          position,
          department
        `)
        .order('full_name', { ascending: true })


      if (colleaguesError) {
        console.error('Erro ao carregar colegas:', colleaguesError)
        return
      }

      // Buscar departamentos para mapear IDs para nomes
      const { data: departmentsData } = await supabase
        .from('departments')
        .select('id, name')

      const departmentsMap = new Map()
      departmentsData?.forEach((dept: any) => {
        departmentsMap.set(dept.id, dept.name)
      })

      // Buscar TODAS as estrelas do sistema via API SQL direta (bypass RLS)
      const response = await fetch('/api/stars/raw-sql')
      const { stars: allStarsData, total, error: apiError } = await response.json()

      if (apiError || !response.ok) {
        console.error('Erro ao buscar estrelas:', apiError)
      }

      // Buscar TODOS os dislikes do sistema via API SQL direta (bypass RLS)
      const dislikesResponse = await fetch('/api/dislikes/raw-sql')
      const { dislikes: allDislikesData, total: dislikesTotal, error: dislikesApiError } = await dislikesResponse.json()

      if (dislikesApiError || !dislikesResponse.ok) {
        console.error('Erro ao buscar dislikes:', dislikesApiError)
      }

      // Agrupar estrelas por usuário
      const starsByUser = new Map<string, any[]>()
      if (allStarsData) {
        for (const star of allStarsData as any[]) {
          if (!starsByUser.has(star.recipient_id)) {
            starsByUser.set(star.recipient_id, [])
          }
          starsByUser.get(star.recipient_id)!.push(star)
        }
      }

      // Agrupar dislikes por usuário
      const dislikesByUser = new Map<string, any[]>()
      if (allDislikesData) {
        for (const dislike of allDislikesData as any[]) {
          if (!dislikesByUser.has(dislike.recipient_id)) {
            dislikesByUser.set(dislike.recipient_id, [])
          }
          dislikesByUser.get(dislike.recipient_id)!.push(dislike)
        }
        
        // Ordenar dislikes por data decrescente para cada usuário
        for (const [userId, dislikes] of dislikesByUser.entries()) {
          dislikes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        }
      }

      // Buscar estrelas e dislikes para cada colega
      const colleaguesWithFeedback = await Promise.all((colleaguesData || []).map(async (colleague: any) => {
        // Obter estrelas recebidas por este colega
        const userStars = starsByUser.get(colleague.id) || []
        const totalStars = userStars.length

        // Obter dislikes recebidos por este colega
        const userDislikes = dislikesByUser.get(colleague.id) || []
        const totalDislikes = userDislikes.length
        

        // Pegar as 3 estrelas mais recentes
        const recentStars = userStars.slice(0, 3)

        // Pegar os 3 dislikes mais recentes (já ordenados por data decrescente)
        const recentDislikes = userDislikes.slice(0, 3)
        

        // Buscar nomes dos remetentes das estrelas recentes
        const starsWithSenders = await Promise.all(recentStars.map(async (star: any) => {
          const { data: senderData, error: senderError } = await supabase
            .from('employees')
            .select('full_name')
            .eq('id', star.user_id)
            .single()
          
          if (senderError) {
            console.error(`Erro ao buscar remetente ${star.user_id}:`, senderError)
          }
          
          return {
            id: star.id,
            reason: star.reason,
            message: star.message,
            from: (senderData as any)?.full_name || 'Usuário',
            date: star.created_at
          }
        }))

        // Buscar nomes dos remetentes dos dislikes recentes
        const dislikesWithSenders = await Promise.all(recentDislikes.map(async (dislike: any) => {
          const { data: senderData, error: senderError } = await supabase
            .from('employees')
            .select('full_name')
            .eq('id', dislike.user_id)
            .single()
          
          if (senderError) {
            console.error(`Erro ao buscar remetente ${dislike.user_id}:`, senderError)
          }
          
          return {
            id: dislike.id,
            reason: dislike.reason,
            message: dislike.message,
            from: (senderData as any)?.full_name || 'Usuário',
            date: dislike.created_at
          }
        }))

        return {
          id: colleague.id,
          name: colleague.full_name || 'Usuário',
          position: colleague.position || 'Sem cargo',
          department: departmentsMap.get(colleague.department) || colleague.department || 'Sem departamento',
          avatar: colleague.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U',
          starsReceived: totalStars,
          dislikesReceived: totalDislikes,
          recentStars: starsWithSenders,
          recentDislikes: dislikesWithSenders,
          allStars: userStars,
          allDislikes: userDislikes
        }
      }))

      const formattedColleagues: Colleague[] = colleaguesWithFeedback

      setColleagues(formattedColleagues)
    } catch (error) {
      console.error('Erro ao carregar colegas:', error)
    } finally {
      setLoading(false)
    }
  }


  const handleGiveStar = (colleague: Colleague) => {
    // Verificar se o usuário tem bypass de estrelas infinitas
    if (!hasInfiniteStars(currentUserId) && userStars.available <= 0) {
      toast.error('Você não tem estrelas disponíveis este mês')
      return
    }
    if (currentUserId && colleague.id === currentUserId) {
      toast.error('Você não pode dar estrela para si mesmo')
      return
    }
    setSelectedColleague(colleague)
    setShowStarModal(true)
  }

  const handleGiveDislike = (colleague: Colleague) => {
    if (userDislikes.available <= 0) {
      toast.error('Você não tem dislikes disponíveis este mês')
      return
    }
    if (currentUserId && colleague.id === currentUserId) {
      toast.error('Você não pode dar dislike para si mesmo')
      return
    }
    setSelectedColleague(colleague)
    setShowDislikeModal(true)
  }

  const handleSubmitStar = async () => {
    if (!selectedColleague) return

    if (!starForm.reason.trim()) {
      toast.error('Por favor, selecione um motivo')
      return
    }

    if (!starForm.message.trim()) {
      toast.error('Por favor, escreva uma mensagem de agradecimento')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/stars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: selectedColleague.id,
          reason: starForm.reason,
          message: starForm.message
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar estrela')
      }

      toast.success(`Estrela enviada para ${selectedColleague.name}!`)
      
      // Reset form
      setSelectedColleague(null)
      setShowStarModal(false)
      setStarForm({
        reason: '',
        message: ''
      })
      
      // Recarregar dados do servidor para garantir consistência
      // Para usuários especiais, não recarregar estrelas pois elas são infinitas
      if (!hasInfiniteStars(currentUserId)) {
        loadUserStars()
      }
      loadColleagues()
    } catch (error) {
      console.error('Erro ao enviar estrela:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar estrela')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitDislike = async () => {
    if (!selectedColleague) return

    if (!dislikeForm.reason.trim()) {
      toast.error('Por favor, selecione um motivo')
      return
    }

    if (!dislikeForm.message.trim()) {
      toast.error('Por favor, escreva uma mensagem de feedback')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/dislikes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: selectedColleague.id,
          reason: dislikeForm.reason,
          message: dislikeForm.message
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar dislike')
      }

      toast.success(`Dislike enviado para ${selectedColleague.name}!`)
      
      // Reset form
      setSelectedColleague(null)
      setShowDislikeModal(false)
      setDislikeForm({
        reason: '',
        message: ''
      })
      
      // Recarregar dados do servidor para garantir consistência
      loadUserDislikes()
      loadColleagues()
    } catch (error) {
      console.error('Erro ao enviar dislike:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar dislike')
    } finally {
      setLoading(false)
    }
  }

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case '1': return Heart
      case '2': return Users
      case '3': return Brain
      case '4': return Zap
      case '5': return Award
      case '6': return Sparkles
      case '7': return ThumbsUp
      case '8': return MessageSquare
      default: return Star
    }
  }

  const getReasonText = (reason: string) => {
    switch (reason) {
      case '1': return 'Ajudou com um problema'
      case '2': return 'Excelente colaboração'
      case '3': return 'Fez mentoria/ensino'
      case '4': return 'Demonstrou proatividade'
      case '5': return 'Liderança exemplar'
      case '6': return 'Trouxe inovação'
      case '7': return 'Apoio em momento difícil'
      case '8': return 'Outro motivo'
      default: return reason
    }
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case '1': return 'text-red-500 bg-red-50'
      case '2': return 'text-blue-500 bg-blue-50'
      case '3': return 'text-purple-500 bg-purple-50'
      case '4': return 'text-green-500 bg-green-50'
      case '5': return 'text-yellow-500 bg-yellow-50'
      case '6': return 'text-pink-500 bg-pink-50'
      case '7': return 'text-orange-500 bg-orange-50'
      case '8': return 'text-gray-500 bg-gray-50'
      default: return 'text-gray-500 bg-gray-50'
    }
  }

  const getDislikeReasonIcon = (reason: string) => {
    switch (reason) {
      case '1': return AlertTriangle
      case '2': return Frown
      case '3': return ThumbsDown
      case '4': return XCircle
      case '5': return Users
      case '6': return Brain
      case '7': return Zap
      default: return AlertTriangle
    }
  }

  const getDislikeReasonText = (reason: string) => {
    switch (reason) {
      case '1': return 'Comportamento inadequado'
      case '2': return 'Falta de colaboração'
      case '3': return 'Atitude negativa'
      case '4': return 'Não cumpriu prazos'
      case '5': return 'Falta de comunicação'
      case '6': return 'Resistência a mudanças'
      case '7': return 'Outro motivo'
      default: return reason
    }
  }

  const getDislikeReasonColor = (reason: string) => {
    switch (reason) {
      case '1': return 'text-red-600 bg-red-100'
      case '2': return 'text-orange-600 bg-orange-100'
      case '3': return 'text-yellow-600 bg-yellow-100'
      case '4': return 'text-red-700 bg-red-100'
      case '5': return 'text-purple-600 bg-purple-100'
      case '6': return 'text-indigo-600 bg-indigo-100'
      case '7': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const filteredColleagues = colleagues
    .filter(colleague => {
      const matchesSearch = colleague.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           colleague.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           colleague.department.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDepartment = selectedDepartment === 'all' || colleague.department === selectedDepartment
      return matchesSearch && matchesDepartment
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'stars') return b.starsReceived - a.starsReceived
      if (sortBy === 'department') return a.department.localeCompare(b.department)
      return 0
    })

  const departments = ['all', ...new Set(colleagues.map(c => c.department))]

  const stats = {
    totalColleagues: colleagues.length,
    totalStars: colleagues.reduce((acc, c) => acc + c.starsReceived, 0),
    averageStars: colleagues.reduce((acc, c) => acc + c.starsReceived, 0) / colleagues.length || 0,
    topPerformer: (() => {
      if (colleagues.length === 0) return undefined
      
      // Ordenar por estrelas recebidas (decrescente)
      const sorted = [...colleagues].sort((a, b) => b.starsReceived - a.starsReceived)
      const top = sorted[0]
      
      // Se não há estrelas, não mostrar ninguém
      if (!top || top.starsReceived === 0) return undefined
      
      // Verificar se há empate com o segundo colocado
      const second = sorted[1]
      if (second && second.starsReceived === top.starsReceived) {
        return undefined // Há empate, não mostrar ninguém
      }
      
      return top
    })(),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-oxford-blue-600 font-roboto font-light">Carregando colegas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-roboto font-bold text-rich-black-900 tracking-wide">Reconheça e agradeça seus colegas com estrelas</h1>
        </div>
      </div>

      {/* Sistema de Estrelas e Deslike */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estrelas */}
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-[#E0E1DD]">
                <Star className="h-6 w-6 text-[#778DA9]" />
              </div>
              <div>
                <h2 className="text-xl font-roboto font-medium text-rich-black-900">Suas Estrelas do Mês</h2>
                <p className="text-sm font-roboto font-light text-oxford-blue-600">Use suas 3 estrelas para agradecer colegas</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-roboto font-semibold text-rich-black-900">
                {hasInfiniteStars(currentUserId) ? '∞' : `${userStars.available}/3`}
              </div>
              <div className="text-sm font-roboto font-light text-oxford-blue-400">
                {hasInfiniteStars(currentUserId) ? 'estrelas infinitas' : 'disponíveis'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {hasInfiniteStars(currentUserId) ? (
                // Para usuários especiais, mostrar 3 estrelas sempre preenchidas
                [...Array(3)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-8 w-8 text-yellow-500 fill-yellow-500"
                  />
                ))
              ) : (
                // Para usuários normais, mostrar estrelas baseadas na disponibilidade
                [...Array(3)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-8 w-8 ${
                      i < userStars.available
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-platinum-300'
                    }`}
                  />
                ))
              )}
            </div>
            <div className="text-xs font-roboto font-light text-oxford-blue-500">
              {hasInfiniteStars(currentUserId) ? 'Estrelas infinitas' : `Reset em ${userStars.resetDate.toLocaleDateString('pt-BR')}`}
            </div>
          </div>
        </div>

        {/* Dislikes */}
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-[#E0E1DD]">
                <ThumbsDown className="h-6 w-6 text-[#778DA9]" />
              </div>
              <div>
                <h2 className="text-xl font-roboto font-medium text-rich-black-900">Seus Dislikes do Mês</h2>
                <p className="text-sm font-roboto font-light text-oxford-blue-600">Use seus 3 dislikes para dar feedback negativo</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-roboto font-semibold text-rich-black-900">
                {userDislikes.available}/3
              </div>
              <div className="text-sm font-roboto font-light text-oxford-blue-400">disponíveis</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <ThumbsDown
                  key={i}
                  className={`h-8 w-8 ${
                    i < userDislikes.available
                      ? 'text-[#778DA9]'
                      : 'text-platinum-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs font-roboto font-light text-oxford-blue-500">
              Reset em {userDislikes.resetDate.toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Total de Estrelas</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">{stats.totalStars}</p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">estrelas dadas</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Média por Pessoa</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">{stats.averageStars.toFixed(1)}</p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">estrelas por colega</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Top Performer</p>
              {stats.topPerformer ? (
                <>
                  <p className="text-2xl font-roboto font-semibold text-rich-black-900">{stats.topPerformer.name}</p>
                  <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">{stats.topPerformer.starsReceived} estrelas</p>
                </>
                ) : (
                  <>
                    <p className="text-2xl font-roboto font-semibold text-rich-black-900">—</p>
                    <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">Sem líder definido</p>
                  </>
                )}
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Colaboradores</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">{stats.totalColleagues}</p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">na equipe</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-2">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('give')}
            className={`flex-1 py-3 px-4 rounded-xl font-roboto font-medium transition-all duration-200 ${
              activeTab === 'give'
                ? 'bg-[#1B263B] text-white shadow-sm'
                : 'text-oxford-blue-600 hover:bg-platinum-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Star className="h-4 w-4" />
              Dar Estrelas
            </div>
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-3 px-4 rounded-xl font-roboto font-medium transition-all duration-200 ${
              activeTab === 'received'
                ? 'bg-[#1B263B] text-white shadow-sm'
                : 'text-oxford-blue-600 hover:bg-platinum-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Gift className="h-4 w-4" />
              Feedback Recebido
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'give' ? (
        <>
          {/* Filtros e busca */}
          <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
            <div className="flex flex-col gap-4">
              {/* Barra de busca */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-oxford-blue-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-white border border-platinum-300 rounded-lg text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Buscar colaborador por nome, cargo ou departamento..."
                  />
                </div>
              </div>
              
              {/* Controles */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-roboto font-medium text-rich-black-900">Departamento:</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="appearance-none bg-white border border-platinum-300 rounded-lg px-4 py-2 pr-8 text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>
                        {dept === 'all' ? 'Todos os Departamentos' : dept}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-roboto font-medium text-rich-black-900">Ordenar:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-platinum-300 rounded-lg px-4 py-2 pr-8 text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="name">Nome</option>
                    <option value="stars">Estrelas</option>
                    <option value="department">Departamento</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-roboto font-medium text-rich-black-900">Visualizar:</label>
                  <div className="flex bg-platinum-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 rounded-md transition-all duration-200 ${
                        viewMode === 'table' 
                          ? 'bg-white text-yellow-600 shadow-sm' 
                          : 'text-oxford-blue-600 hover:text-yellow-600'
                      }`}
                      title="Visualização em tabela"
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`p-2 rounded-md transition-all duration-200 ${
                        viewMode === 'cards' 
                          ? 'bg-white text-yellow-600 shadow-sm' 
                          : 'text-oxford-blue-600 hover:text-yellow-600'
                      }`}
                      title="Visualização em cards"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visualização de colegas */}
          {viewMode === 'table' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-platinum-50 border-b border-platinum-200">
                    <tr className="text-left text-xs font-roboto font-medium text-oxford-blue-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Colaborador</th>
                      <th className="px-6 py-4">Cargo</th>
                      <th className="px-6 py-4">Departamento</th>
                      <th className="px-6 py-4 text-center">Estrelas</th>
                      <th className="px-6 py-4 text-center">Última Estrela</th>
                      <th className="px-6 py-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-platinum-200">
                    {filteredColleagues.map((colleague) => (
                      <tr key={colleague.id} className="hover:bg-platinum-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yinmn-blue-500 to-yinmn-blue-600 flex items-center justify-center text-sm font-roboto font-semibold text-white">
                              {colleague.avatar}
                            </div>
                            <div className="ml-3">
                              <p className="font-roboto font-medium text-rich-black-900">{colleague.name}</p>
                              <p className="text-sm font-roboto font-light text-oxford-blue-600">{colleague.position}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-roboto font-medium text-rich-black-900">{colleague.position}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium bg-platinum-100 text-oxford-blue-700">
                            {colleague.department}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-roboto font-semibold text-rich-black-900">{colleague.starsReceived}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {colleague.recentStars.length > 0 ? (
                            <span className="text-sm font-roboto font-medium text-rich-black-900">
                              {new Date(colleague.recentStars[0].date).toLocaleDateString('pt-BR')}
                            </span>
                          ) : (
                            <span className="text-oxford-blue-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleGiveStar(colleague)}
                              disabled={!hasInfiniteStars(currentUserId) && userStars.available <= 0 || Boolean(currentUserId && colleague.id === currentUserId)}
                              className={`px-3 py-2 rounded-lg font-roboto font-medium transition-all duration-200 flex items-center gap-2 ${
                                (hasInfiniteStars(currentUserId) || userStars.available > 0) && (!currentUserId || colleague.id !== currentUserId)
                                  ? 'bg-[#1B263B] hover:bg-[#0D1B2A] text-white'
                                  : 'bg-platinum-200 text-oxford-blue-400 cursor-not-allowed'
                              }`}
                            >
                              <Star className="h-4 w-4" />
                              Estrela
                            </button>
                            <button
                              onClick={() => handleGiveDislike(colleague)}
                              disabled={userDislikes.available <= 0 || Boolean(currentUserId && colleague.id === currentUserId)}
                              className={`px-3 py-2 rounded-lg font-roboto font-medium transition-all duration-200 flex items-center gap-2 ${
                                userDislikes.available > 0 && (!currentUserId || colleague.id !== currentUserId)
                                  ? 'bg-[#1B263B] hover:bg-[#0D1B2A] text-white'
                                  : 'bg-platinum-200 text-oxford-blue-400 cursor-not-allowed'
                              }`}
                            >
                              <ThumbsDown className="h-4 w-4" />
                              Dislike
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4 p-4">
                {filteredColleagues.map((colleague) => (
                  <div key={colleague.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yinmn-blue-500 to-yinmn-blue-600 flex items-center justify-center text-sm font-roboto font-semibold text-white">
                          {colleague.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-roboto font-medium text-rich-black-900 text-sm leading-tight mb-1">{colleague.name}</h3>
                          <p className="text-xs text-gray-500">{colleague.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-roboto font-semibold text-rich-black-900 text-sm">{colleague.starsReceived}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Departamento:</span>
                        <span className="font-medium text-gray-900">{colleague.department}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Última estrela:</span>
                        <span className="font-medium text-gray-900">
                          {colleague.recentStars.length > 0 
                            ? new Date(colleague.recentStars[0].date).toLocaleDateString('pt-BR')
                            : 'Nenhuma'
                          }
                        </span>
                      </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGiveStar(colleague)}
                        disabled={!hasInfiniteStars(currentUserId) && userStars.available <= 0 || Boolean(currentUserId && colleague.id === currentUserId)}
                        className={`flex-1 py-2 px-3 rounded-lg font-roboto font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                          (hasInfiniteStars(currentUserId) || userStars.available > 0) && (!currentUserId || colleague.id !== currentUserId)
                            ? 'bg-[#1B263B] hover:bg-[#0D1B2A] text-white'
                            : 'bg-platinum-200 text-oxford-blue-400 cursor-not-allowed'
                        }`}
                      >
                        <Star className="h-4 w-4" />
                        Estrela
                      </button>
                      <button
                        onClick={() => handleGiveDislike(colleague)}
                        disabled={userDislikes.available <= 0 || Boolean(currentUserId && colleague.id === currentUserId)}
                        className={`flex-1 py-2 px-3 rounded-lg font-roboto font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                          userDislikes.available > 0 && (!currentUserId || colleague.id !== currentUserId)
                            ? 'bg-[#1B263B] hover:bg-[#0D1B2A] text-white'
                            : 'bg-platinum-200 text-oxford-blue-400 cursor-not-allowed'
                        }`}
                      >
                        <ThumbsDown className="h-4 w-4" />
                        Dislike
                      </button>
                    </div>
                  </div>
                ))}
                {filteredColleagues.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum colega encontrado</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredColleagues.map((colleague) => (
                <div key={colleague.id} className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 hover:shadow-md transition-all duration-200">
                  {/* Header do card */}
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-yinmn-blue-500 to-yinmn-blue-600 flex items-center justify-center font-roboto font-semibold text-white text-lg mb-4">
                      {colleague.avatar}
                    </div>
                    <h3 className="font-roboto font-medium text-rich-black-900 text-lg mb-1">{colleague.name}</h3>
                    <p className="text-sm font-roboto font-light text-oxford-blue-600">{colleague.position}</p>
                  </div>
                  
                  {/* Informações do colaborador */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-oxford-blue-400" />
                      <span className="text-sm font-roboto font-light text-oxford-blue-600">{colleague.department}</span>
                    </div>
                    
                    {/* Estrelas recebidas */}
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-roboto font-medium text-rich-black-900">Estrelas Recebidas</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-gray-600 fill-gray-600" />
                          <span className="font-roboto font-semibold text-rich-black-900">{colleague.starsReceived}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                          className="bg-gradient-to-r from-gray-400 to-slate-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((colleague.starsReceived / 20) * 100, 100)}%` }}
                          />
                        </div>
                    </div>

                    {/* Dislikes recebidos */}
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-roboto font-medium text-rich-black-900">Dislikes Recebidos</span>
                          <div className="flex items-center space-x-1">
                            <ThumbsDown className="h-4 w-4 text-gray-600" />
                          <span className="font-roboto font-semibold text-rich-black-900">{colleague.dislikesReceived}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                          className="bg-gradient-to-r from-gray-400 to-slate-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((colleague.dislikesReceived / 10) * 100, 100)}%` }}
                          />
                        </div>
                    </div>
                {/* Botão fora da área de dislikes */}
                <div className="mt-3 text-right">
                  <button
                    onClick={() => {
                      setModalColleague(colleague)
                      openAllFeedbackModal(colleague)
                    }}
                    className="text-sm text-oxford-blue-600 hover:text-oxford-blue-800 underline"
                  >
                    Ver todas
                  </button>
                </div>

                    {/* Estrelas recentes */}
                    {colleague.recentStars.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-roboto font-medium text-oxford-blue-500">Últimas estrelas:</p>
                        {colleague.recentStars.map((star) => {
                          const Icon = getReasonIcon(star.reason)
                          const color = getReasonColor(star.reason)
                          return (
                            <div key={star.id} className="bg-platinum-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`p-1 rounded ${color}`}>
                                  <Icon className="h-3 w-3" />
                                </div>
                                <span className="text-xs font-roboto font-medium text-rich-black-900">
                                  {getReasonText(star.reason)}
                                </span>
                              </div>
                              <p className="text-xs font-roboto font-light text-oxford-blue-600 line-clamp-2">
                                {star.message}
                              </p>
                              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">
                                Por {star.from}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Dislikes recentes */}
                    {colleague.recentDislikes.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-roboto font-medium text-oxford-blue-500">Últimos dislikes:</p>
                        {colleague.recentDislikes.map((dislike) => {
                          const Icon = getDislikeReasonIcon(dislike.reason)
                          const color = getDislikeReasonColor(dislike.reason)
                          return (
                            <div key={dislike.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`p-1 rounded ${color}`}>
                                  <Icon className="h-3 w-3" />
                                </div>
                                <span className="text-xs font-roboto font-medium text-rich-black-900">
                                  {getDislikeReasonText(dislike.reason)}
                                </span>
                              </div>
                              <p className="text-xs font-roboto font-light text-oxford-blue-600 line-clamp-2">
                                {dislike.message}
                              </p>
                              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">
                                Por {dislike.from}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Botões de ação */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGiveStar(colleague)}
                      disabled={!hasInfiniteStars(currentUserId) && userStars.available <= 0 || Boolean(currentUserId && colleague.id === currentUserId)}
                      className={`flex-1 py-3 px-4 rounded-2xl font-roboto font-medium transition-all duration-200 flex items-center justify-center ${
                        (hasInfiniteStars(currentUserId) || userStars.available > 0) && (!currentUserId || colleague.id !== currentUserId)
                          ? 'bg-[#1B263B] hover:bg-[#0D1B2A] text-white shadow-sm hover:shadow-md'
                          : 'bg-platinum-200 text-oxford-blue-400 cursor-not-allowed'
                      }`}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Estrela
                    </button>
                    <button
                      onClick={() => handleGiveDislike(colleague)}
                      disabled={userDislikes.available <= 0 || Boolean(currentUserId && colleague.id === currentUserId)}
                      className={`flex-1 py-3 px-4 rounded-2xl font-roboto font-medium transition-all duration-200 flex items-center justify-center ${
                        userDislikes.available > 0 && (!currentUserId || colleague.id !== currentUserId)
                          ? 'bg-[#1B263B] hover:bg-[#0D1B2A] text-white shadow-sm hover:shadow-md'
                          : 'bg-platinum-200 text-oxford-blue-400 cursor-not-allowed'
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Dislike
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredColleagues.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-16 text-center">
              <div className="h-20 w-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                <Star className="h-10 w-10 text-yellow-500" />
              </div>
              <h3 className="text-xl font-roboto font-light text-rich-black-900 mb-4 tracking-wide">Nenhum colega encontrado</h3>
              <p className="text-sm text-oxford-blue-600 font-roboto font-light tracking-wide leading-relaxed max-w-md mx-auto">
                Tente ajustar sua busca para encontrar colegas para agradecer
              </p>
            </div>
          )}

          {/* Espaçamento no final da aba Dar Estrelas */}
          <div className="h-8"></div>
        </>
      ) : (
        /* Aba de Feedback Recebido */
        <div className="space-y-6">
          {/* Estrelas Recebidas */}
          <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
            <h2 className="text-xl font-roboto font-medium text-rich-black-900 mb-4">Suas Estrelas Recebidas</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-oxford-blue-600 font-roboto font-light">Carregando estrelas recebidas...</div>
                </div>
              ) : receivedStars.length > 0 ? (
                receivedStars.map((star) => {
                  const Icon = getReasonIcon(star.reason)
                  const color = getReasonColor(star.reason)
                  return (
                    <div key={star.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-roboto font-medium text-rich-black-900">
                              {getReasonText(star.reason)}
                            </h3>
                            <p className="text-sm font-roboto font-light text-oxford-blue-600 mt-1">
                              {star.message}
                            </p>
                            <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-2">
                              De {star.sender?.full_name || 'Usuário'} • {new Date(star.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <div className="h-16 w-16 bg-gradient-to-br from-platinum-100 to-platinum-200 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Star className="h-8 w-8 text-oxford-blue-400" />
                  </div>
                  <h3 className="text-lg font-roboto font-light text-rich-black-900 mb-2">Nenhuma estrela recebida ainda</h3>
                  <p className="text-sm text-oxford-blue-600 font-roboto font-light">
                    Continue fazendo um bom trabalho e seus colegas reconhecerão!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dislikes Recebidos */}
          <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
            <h2 className="text-xl font-roboto font-medium text-rich-black-900 mb-4">Seus Dislikes Recebidos</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-oxford-blue-600 font-roboto font-light">Carregando dislikes recebidos...</div>
                </div>
              ) : receivedDislikes.length > 0 ? (
                receivedDislikes.map((dislike) => {
                  const Icon = getDislikeReasonIcon(dislike.reason)
                  const color = getDislikeReasonColor(dislike.reason)
                  return (
                    <div key={dislike.id} className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-roboto font-medium text-rich-black-900">
                              {getDislikeReasonText(dislike.reason)}
                            </h3>
                            <p className="text-sm font-roboto font-light text-oxford-blue-600 mt-1">
                              {dislike.message}
                            </p>
                            <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-2">
                              De {dislike.sender?.full_name || 'Usuário'} • {new Date(dislike.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <ThumbsDown className="h-6 w-6 text-red-500" />
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <div className="h-16 w-16 bg-gradient-to-br from-platinum-100 to-platinum-200 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <ThumbsDown className="h-8 w-8 text-oxford-blue-400" />
                  </div>
                  <h3 className="text-lg font-roboto font-light text-rich-black-900 mb-2">Nenhum dislike recebido</h3>
                  <p className="text-sm text-oxford-blue-600 font-roboto font-light">
                    Continue fazendo um bom trabalho!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Espaçamento no final da aba Feedback Recebido */}
          <div className="h-8"></div>
        </div>
      )}

      {/* Modal para dar estrela */}
      {showStarModal && selectedColleague && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-roboto font-medium text-rich-black-900">Dar Estrela</h3>
                  <p className="text-sm font-roboto font-light text-oxford-blue-600">Para {selectedColleague.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowStarModal(false)
                  setSelectedColleague(null)
                  setStarForm({ reason: '', message: '' })
                }}
                className="text-oxford-blue-400 hover:text-oxford-blue-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Motivo do agradecimento
                </label>
                <select
                  value={starForm.reason}
                  onChange={(e) => setStarForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-no-repeat bg-right pr-8"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="">Selecione um motivo</option>
                  <option value="1">Ajudou com um problema</option>
                  <option value="2">Excelente colaboração</option>
                  <option value="3">Fez mentoria/ensino</option>
                  <option value="4">Demonstrou proatividade</option>
                  <option value="5">Liderança exemplar</option>
                  <option value="6">Trouxe inovação</option>
                  <option value="7">Apoio em momento difícil</option>
                  <option value="8">Outro motivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Mensagem de agradecimento
                </label>
                <textarea
                  value={starForm.message}
                  onChange={(e) => setStarForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-platinum-300 rounded-lg text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={3}
                  placeholder="Escreva uma mensagem de agradecimento..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowStarModal(false)
                    setSelectedColleague(null)
                    setStarForm({ reason: '', message: '' })
                  }}
                  className="px-4 py-2 text-oxford-blue-600 hover:text-oxford-blue-800 font-roboto font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitStar}
                  disabled={loading}
                  className="bg-[#1B263B] hover:bg-[#0D1B2A] text-white px-6 py-2 rounded-xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Star className="h-4 w-4" />
                  Enviar Estrela
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para dar dislike */}
      {showDislikeModal && selectedColleague && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-[#E0E1DD]">
                  <ThumbsDown className="h-5 w-5 text-[#778DA9]" />
                </div>
                <div>
                  <h3 className="text-lg font-roboto font-medium text-rich-black-900">Dar Dislike</h3>
                  <p className="text-sm font-roboto font-light text-oxford-blue-600">Para {selectedColleague.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDislikeModal(false)
                  setSelectedColleague(null)
                  setDislikeForm({ reason: '', message: '' })
                }}
                className="text-oxford-blue-400 hover:text-oxford-blue-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Motivo do feedback negativo
                </label>
                <select
                  value={dislikeForm.reason}
                  onChange={(e) => setDislikeForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-no-repeat bg-right pr-8"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="">Selecione um motivo</option>
                  <option value="1">Comportamento inadequado</option>
                  <option value="2">Falta de colaboração</option>
                  <option value="3">Atitude negativa</option>
                  <option value="4">Não cumpriu prazos</option>
                  <option value="5">Falta de comunicação</option>
                  <option value="6">Resistência a mudanças</option>
                  <option value="7">Outro motivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Mensagem de feedback
                </label>
                <textarea
                  value={dislikeForm.message}
                  onChange={(e) => setDislikeForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-platinum-300 rounded-lg text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={3}
                  placeholder="Escreva uma mensagem de feedback construtivo..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowDislikeModal(false)
                    setSelectedColleague(null)
                    setDislikeForm({ reason: '', message: '' })
                  }}
                  className="px-4 py-2 text-oxford-blue-600 hover:text-oxford-blue-800 font-roboto font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitDislike}
                  disabled={loading}
                  className="bg-[#1B263B] hover:bg-[#0D1B2A] text-white px-6 py-2 rounded-xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ThumbsDown className="h-4 w-4" />
                  Enviar Dislike
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal: Ver todas as estrelas e dislikes */}
      {showAllFeedbackModal && modalColleague && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-platinum-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-roboto font-medium text-rich-black-900">Feedback de {modalColleague.name}</h3>
                <p className="text-sm font-roboto font-light text-oxford-blue-600">Todas as estrelas e dislikes recebidos</p>
              </div>
              <button
                onClick={() => {
                  setShowAllFeedbackModal(false)
                  setModalColleague(null)
                  setModalStars([])
                  setModalDislikes([])
                }}
                className="text-oxford-blue-400 hover:text-oxford-blue-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-auto">
              {modalLoading ? (
                <div className="text-center py-12 text-oxford-blue-600">Carregando feedbacks...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Estrelas */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-roboto font-medium text-rich-black-900">Estrelas ({modalStars.length})</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {modalStars.length === 0 ? (
                        <p className="text-sm text-oxford-blue-400">Nenhuma estrela</p>
                      ) : modalStars.map((s) => {
                        const Icon = getReasonIcon(String(s.reason))
                        const color = getReasonColor(String(s.reason))
                        return (
                          <div key={s.id} className="bg-platinum-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`p-1 rounded ${color}`}>
                                <Icon className="h-3 w-3" />
                              </div>
                              <span className="text-xs font-roboto font-medium text-rich-black-900">
                                {getReasonText(String(s.reason))}
                              </span>
                              <span className="ml-auto text-xs text-oxford-blue-400">{new Date(s.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <p className="text-xs font-roboto font-light text-oxford-blue-600">{s.message}</p>
                            <p className="text-[11px] font-roboto font-light text-oxford-blue-400 mt-1">Por {s.from}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Dislikes */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ThumbsDown className="h-5 w-5 text-red-500" />
                        <span className="font-roboto font-medium text-rich-black-900">Dislikes ({modalDislikes.length})</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {modalDislikes.length === 0 ? (
                        <p className="text-sm text-oxford-blue-400">Nenhum dislike</p>
                      ) : modalDislikes.map((d) => {
                        const Icon = getDislikeReasonIcon(String(d.reason))
                        const color = getDislikeReasonColor(String(d.reason))
                        return (
                          <div key={d.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`p-1 rounded ${color}`}>
                                <Icon className="h-3 w-3" />
                              </div>
                              <span className="text-xs font-roboto font-medium text-rich-black-900">
                                {getDislikeReasonText(String(d.reason))}
                              </span>
                              <span className="ml-auto text-xs text-oxford-blue-400">{new Date(d.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <p className="text-xs font-roboto font-light text-oxford-blue-600">{d.message}</p>
                            <p className="text-[11px] font-roboto font-light text-oxford-blue-400 mt-1">Por {d.from}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}