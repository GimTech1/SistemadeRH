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
  recentStars: Array<{
    id: string
    reason: string
    message: string
    from: string
    date: string
  }>
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
  const [userStars, setUserStars] = useState({
    available: 3,
    used: 0,
    resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
  })
  const [starForm, setStarForm] = useState({
    reason: '',
    message: ''
  })
  const [showStarModal, setShowStarModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'give' | 'received'>('give')
  const [receivedStars, setReceivedStars] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadColleagues()
    loadUserStars()
    loadReceivedStars()
  }, [])

  const loadUserStars = async () => {
    try {
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

  const loadReceivedStars = async () => {
    try {
      const response = await fetch('/api/stars/received')
      const data = await response.json()
      
      if (response.ok) {
        setReceivedStars(data.stars || [])
      }
    } catch (error) {
      console.error('Erro ao carregar estrelas recebidas:', error)
    }
  }

  const loadColleagues = async () => {
    try {
      setLoading(true)
      
      // Buscar colegas da tabela employees
      console.log('👥 Buscando colegas da tabela employees...')
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
        console.error('❌ Erro ao buscar colegas:', colleaguesError)
      } else {
        console.log(`👥 Total de colegas encontrados: ${colleaguesData?.length || 0}`)
        console.log('👥 Dados dos colegas:', colleaguesData)
      }

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
      console.log('🔍 Buscando todas as estrelas do sistema via API SQL direta...')
      const response = await fetch('/api/stars/raw-sql')
      const { stars: allStarsData, total, error: apiError } = await response.json()

      if (apiError || !response.ok) {
        console.error('❌ Erro ao buscar todas as estrelas via API admin:', apiError)
        console.error('📋 Detalhes do erro:', apiError)
      } else {
        console.log(`⭐ Total de estrelas no sistema: ${total}`)
        console.log('📊 Dados das estrelas:', allStarsData)
      }

      // Agrupar estrelas por usuário
      const starsByUser = new Map<string, any[]>()
      if (allStarsData) {
        console.log('🔄 Agrupando estrelas por usuário...')
        for (const star of allStarsData as any[]) {
          console.log(`⭐ Estrela: ${star.id} - De: ${star.user_id} Para: ${star.recipient_id}`)
          if (!starsByUser.has(star.recipient_id)) {
            starsByUser.set(star.recipient_id, [])
          }
          starsByUser.get(star.recipient_id)!.push(star)
        }
        console.log('📊 Agrupamento final:', Object.fromEntries(starsByUser))
      }

      // Buscar estrelas para cada colega
      const colleaguesWithStars = await Promise.all((colleaguesData || []).map(async (colleague: any) => {
        console.log(`🔍 Processando: ${colleague.full_name} (ID: ${colleague.id})`)
        
        // Obter estrelas recebidas por este colega
        const userStars = starsByUser.get(colleague.id) || []
        const totalStars = userStars.length
        
        console.log(`⭐ Estrelas recebidas por ${colleague.full_name}: ${totalStars}`)

        // Pegar as 3 estrelas mais recentes
        const recentStars = userStars.slice(0, 3)

        // Buscar nomes dos remetentes das estrelas recentes
        const starsWithSenders = await Promise.all(recentStars.map(async (star: any) => {
          const { data: senderData, error: senderError } = await supabase
            .from('employees')
            .select('full_name')
            .eq('id', star.user_id)
            .single()
          
          if (senderError) {
            console.error(`❌ Erro ao buscar remetente ${star.user_id}:`, senderError)
          }
          
          return {
            id: star.id,
            reason: star.reason,
            message: star.message,
            from: (senderData as any)?.full_name || 'Usuário',
            date: star.created_at
          }
        }))

        const result = {
          id: colleague.id,
          name: colleague.full_name || 'Usuário',
          position: colleague.position || 'Sem cargo',
          department: departmentsMap.get(colleague.department) || colleague.department || 'Sem departamento',
          avatar: colleague.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U',
          starsReceived: totalStars,
          recentStars: starsWithSenders
        }

        console.log(`✅ Resultado final para ${colleague.full_name}:`, {
          starsReceived: result.starsReceived,
          recentStarsCount: result.recentStars.length
        })

        return result
      }))

      const formattedColleagues: Colleague[] = colleaguesWithStars

      setColleagues(formattedColleagues)
    } catch (error) {
      console.error('Erro ao carregar colegas:', error)
    } finally {
      setLoading(false)
    }
  }


  const handleGiveStar = (colleague: Colleague) => {
    if (userStars.available <= 0) {
      toast.error('Você não tem estrelas disponíveis este mês')
      return
    }
    setSelectedColleague(colleague)
    setShowStarModal(true)
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
      loadUserStars()
      loadColleagues()
    } catch (error) {
      console.error('Erro ao enviar estrela:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar estrela')
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
      default: return 'text-gray-500 bg-gray-50'
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
      const top = [...colleagues].sort((a, b) => b.starsReceived - a.starsReceived)[0]
      return top && top.starsReceived > 0 ? top : undefined
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

      {/* Sistema de Estrelas Principal */}
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
              {userStars.available}/3
            </div>
            <div className="text-sm font-roboto font-light text-oxford-blue-400">disponíveis</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <Star
                key={i}
                className={`h-8 w-8 ${
                  i < userStars.available
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-platinum-300'
                }`}
              />
            ))}
          </div>
          <div className="text-xs font-roboto font-light text-oxford-blue-500">
            Reset em {userStars.resetDate.toLocaleDateString('pt-BR')}
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
                  <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">Sem estrelas registradas</p>
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
              Estrelas Recebidas
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
                          <button
                            onClick={() => handleGiveStar(colleague)}
                            disabled={userStars.available <= 0}
                            className={`px-4 py-2 rounded-lg font-roboto font-medium transition-all duration-200 flex items-center gap-2 ${
                              userStars.available > 0
                                ? 'bg-[#1B263B] hover:bg-[#0D1B2A] text-white'
                                : 'bg-platinum-200 text-oxford-blue-400 cursor-not-allowed'
                            }`}
                          >
                            <Star className="h-4 w-4" />
                            Dar Estrela
                          </button>
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

                    {/* Botão de ação */}
                    <button
                      onClick={() => handleGiveStar(colleague)}
                      disabled={userStars.available <= 0}
                      className={`w-full py-2 px-4 rounded-lg font-roboto font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        userStars.available > 0
                          ? 'bg-[#1B263B] hover:bg-[#0D1B2A] text-white'
                          : 'bg-platinum-200 text-oxford-blue-400 cursor-not-allowed'
                      }`}
                    >
                      <Star className="h-4 w-4" />
                      Dar Estrela
                    </button>
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
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                        <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-roboto font-medium text-oxford-blue-500">Estrelas Recebidas</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-roboto font-semibold text-rich-black-900">{colleague.starsReceived}</span>
                        </div>
                      </div>
                      <div className="w-full bg-yellow-200 rounded-full h-2">
                          <div
                          className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((colleague.starsReceived / 20) * 100, 100)}%` }}
                          />
                        </div>
                    </div>

                    {/* Estrelas recentes */}
                    {colleague.recentStars.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-roboto font-medium text-oxford-blue-500">Últimas estrelas:</p>
                        {colleague.recentStars.slice(0, 2).map((star) => {
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
                  </div>

                  {/* Botão de ação */}
                  <button
                    onClick={() => handleGiveStar(colleague)}
                    disabled={userStars.available <= 0}
                    className={`w-full py-3 px-4 rounded-2xl font-roboto font-medium transition-all duration-200 flex items-center justify-center ${
                      userStars.available > 0
                        ? 'bg-[#1B263B] hover:bg-[#0D1B2A] text-white shadow-sm hover:shadow-md'
                        : 'bg-platinum-200 text-oxford-blue-400 cursor-not-allowed'
                    }`}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Dar Estrela
                  </button>
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
        </>
      ) : (
        /* Aba de Estrelas Recebidas */
        <div className="space-y-6">
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
    </div>
  )
}