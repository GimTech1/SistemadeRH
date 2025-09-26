'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
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
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Colleague {
  id: string
  name: string
  position: string
  department: string
  avatar: string
  lastEvaluation: string
  canEvaluate: boolean
  averageScore?: number
  totalEvaluations?: number
}

export default function InternalFeedbackPage() {
  const [colleagues, setColleagues] = useState<Colleague[]>([])
  const [selectedColleague, setSelectedColleague] = useState<Colleague | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')
  const [loading, setLoading] = useState(true)
  const [feedbackForm, setFeedbackForm] = useState({
    conhecimento: 0,
    habilidade: 0,
    atitude: 0,
    comment: '',
  })
  const supabase = createClient()

  useEffect(() => {
    loadColleagues()
  }, [])

  const loadColleagues = async () => {
    try {
      // Simular dados de colegas
      setColleagues([
        {
          id: '1',
          name: 'Maria Santos',
          position: 'Gerente de Marketing',
          department: 'Marketing',
          avatar: 'MS',
          lastEvaluation: 'Há 2 meses',
          canEvaluate: true,
          averageScore: 8.7,
          totalEvaluations: 12,
        },
        {
          id: '2',
          name: 'Pedro Costa',
          position: 'Desenvolvedor Senior',
          department: 'TI',
          avatar: 'PC',
          lastEvaluation: 'Há 1 mês',
          canEvaluate: true,
          averageScore: 9.1,
          totalEvaluations: 8,
        },
        {
          id: '3',
          name: 'Ana Oliveira',
          position: 'Analista de RH',
          department: 'RH',
          avatar: 'AO',
          lastEvaluation: 'Há 3 semanas',
          canEvaluate: false,
          averageScore: 8.9,
          totalEvaluations: 15,
        },
        {
          id: '4',
          name: 'Carlos Mendes',
          position: 'Vendedor',
          department: 'Vendas',
          avatar: 'CM',
          lastEvaluation: 'Nunca avaliado',
          canEvaluate: true,
          averageScore: 0,
          totalEvaluations: 0,
        },
        {
          id: '5',
          name: 'Juliana Lima',
          position: 'Designer',
          department: 'Marketing',
          avatar: 'JL',
          lastEvaluation: 'Há 1 semana',
          canEvaluate: false,
          averageScore: 8.5,
          totalEvaluations: 6,
        },
        {
          id: '6',
          name: 'Roberto Silva',
          position: 'Analista Financeiro',
          department: 'Financeiro',
          avatar: 'RS',
          lastEvaluation: 'Há 2 semanas',
          canEvaluate: true,
          averageScore: 8.3,
          totalEvaluations: 9,
        },
        {
          id: '7',
          name: 'Fernanda Costa',
          position: 'Coordenadora de RH',
          department: 'RH',
          avatar: 'FC',
          lastEvaluation: 'Há 1 mês',
          canEvaluate: true,
          averageScore: 9.0,
          totalEvaluations: 11,
        },
        {
          id: '8',
          name: 'Lucas Oliveira',
          position: 'Desenvolvedor Junior',
          department: 'TI',
          avatar: 'LO',
          lastEvaluation: 'Nunca avaliado',
          canEvaluate: true,
          averageScore: 0,
          totalEvaluations: 0,
        },
      ])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!selectedColleague) return

    const averageScore = (feedbackForm.conhecimento + feedbackForm.habilidade + feedbackForm.atitude) / 3
    
    if (averageScore === 0) {
      toast.error('Por favor, avalie pelo menos uma competência')
      return
    }

    if (!feedbackForm.comment.trim()) {
      toast.error('Por favor, adicione um comentário')
      return
    }

    setLoading(true)
    try {
      // Aqui você salvaria no banco
      toast.success(`Feedback enviado para ${selectedColleague.name}!`)
      
      // Reset form
      setSelectedColleague(null)
      setFeedbackForm({
        conhecimento: 0,
        habilidade: 0,
        atitude: 0,
        comment: '',
      })
      
      // Atualizar lista
      loadColleagues()
    } catch (error) {
      toast.error('Erro ao enviar feedback')
    } finally {
      setLoading(false)
    }
  }

  const getCHAIcon = (skill: string) => {
    switch (skill) {
      case 'conhecimento': return Brain
      case 'habilidade': return Zap
      case 'atitude': return Heart
      default: return Star
    }
  }

  const getCHAColor = (skill: string) => {
    switch (skill) {
      case 'conhecimento': return 'text-purple-500'
      case 'habilidade': return 'text-blue-500'
      case 'atitude': return 'text-pink-500'
      default: return 'text-oxford-blue-500'
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
      if (sortBy === 'score') return (b.averageScore || 0) - (a.averageScore || 0)
      if (sortBy === 'department') return a.department.localeCompare(b.department)
      return 0
    })

  const departments = ['all', ...new Set(colleagues.map(c => c.department))]

  const stats = {
    totalColleagues: colleagues.length,
    canEvaluate: colleagues.filter(c => c.canEvaluate).length,
    alreadyEvaluated: colleagues.filter(c => !c.canEvaluate).length,
    averageScore: colleagues.filter(c => c.averageScore && c.averageScore > 0).reduce((acc, c) => acc + (c.averageScore || 0), 0) / colleagues.filter(c => c.averageScore && c.averageScore > 0).length || 0,
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
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-roboto font-medium text-rich-black-900 tracking-wide">Avalie seus colegas de trabalho e ajude no desenvolvimento da equipe</h1>
          </div>
        </div>
        <button className="text-white px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2" style={{ backgroundColor: '#1B263B' }}>
          <Plus className="h-4 w-4" />
          Nova Avaliação
        </button>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Total de Colegas</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">{stats.totalColleagues}</p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">colaboradores disponíveis</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Disponíveis</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">{stats.canEvaluate}</p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">para avaliação</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Já Avaliados</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">{stats.alreadyEvaluated}</p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">avaliações concluídas</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Média Geral</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">{stats.averageScore.toFixed(1)}</p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">pontuação média</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>
      </div>

      {selectedColleague ? (
        /* Feedback Form */
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 overflow-hidden">
          <div className="p-6 border-b border-platinum-200 bg-gradient-to-r from-platinum-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yinmn-blue-500 to-yinmn-blue-600 flex items-center justify-center font-roboto font-semibold text-white text-lg">
                  {selectedColleague.avatar}
                </div>
                <div>
                  <h2 className="text-xl font-roboto font-medium text-rich-black-900">Avaliando: {selectedColleague.name}</h2>
                  <p className="text-sm font-roboto font-light text-oxford-blue-600">{selectedColleague.position} • {selectedColleague.department}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedColleague(null)}
                className="text-oxford-blue-600 hover:text-yinmn-blue-600 font-roboto font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-8">
            {/* CHA Evaluation */}
            {['conhecimento', 'habilidade', 'atitude'].map((skill) => {
              const Icon = getCHAIcon(skill)
              const color = getCHAColor(skill)
              const skillValue = feedbackForm[skill as keyof typeof feedbackForm] as number
              
              return (
                <div key={skill} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <label className="text-lg font-roboto font-medium text-rich-black-900 capitalize">
                          {skill}
                        </label>
                        <p className="text-sm font-roboto font-light text-oxford-blue-600">
                          {skill === 'conhecimento' && 'Domínio técnico e conhecimento do trabalho'}
                          {skill === 'habilidade' && 'Capacidade de execução e resolução de problemas'}
                          {skill === 'atitude' && 'Proatividade, colaboração e comprometimento'}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-roboto font-semibold text-rich-black-900">
                      {skillValue}/10
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    {[...Array(10)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setFeedbackForm(prev => ({
                          ...prev,
                          [skill]: i + 1
                        }))}
                        className="p-2 transition-all duration-200 hover:scale-110"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            i < skillValue
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-platinum-300 hover:text-yellow-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Comment */}
            <div className="space-y-3">
              <label className="block text-lg font-roboto font-medium text-rich-black-900">
                Comentário
              </label>
              <textarea
                value={feedbackForm.comment}
                onChange={(e) => setFeedbackForm(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent font-roboto font-light"
                rows={4}
                placeholder="Compartilhe sua experiência trabalhando com este colega..."
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-platinum-200">
              <button
                onClick={() => setSelectedColleague(null)}
                className="bg-platinum-100 hover:bg-platinum-200 text-oxford-blue-600 px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={loading}
                className="bg-yinmn-blue-600 hover:bg-yinmn-blue-700 text-white px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                Enviar Avaliação
              </button>
            </div>
          </div>
        </div>
      ) : (
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
                    className="w-full pl-10 pr-3 py-2 bg-white border border-platinum-300 rounded-lg text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
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
                    className="appearance-none bg-white border border-platinum-300 rounded-lg px-4 py-2 pr-8 text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
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
                    className="appearance-none bg-white border border-platinum-300 rounded-lg px-4 py-2 pr-8 text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                  >
                    <option value="name">Nome</option>
                    <option value="score">Pontuação</option>
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
                          ? 'bg-white text-yinmn-blue-600 shadow-sm' 
                          : 'text-oxford-blue-600 hover:text-yinmn-blue-600'
                      }`}
                      title="Visualização em tabela"
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`p-2 rounded-md transition-all duration-200 ${
                        viewMode === 'cards' 
                          ? 'bg-white text-yinmn-blue-600 shadow-sm' 
                          : 'text-oxford-blue-600 hover:text-yinmn-blue-600'
                      }`}
                      title="Visualização em cards"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="bg-platinum-100 hover:bg-platinum-200 text-oxford-blue-600 px-4 py-2 rounded-lg font-roboto font-medium transition-all duration-200 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Exportar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Visualização de colegas */}
          {viewMode === 'table' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-platinum-50 border-b border-platinum-200">
                    <tr className="text-left text-xs font-roboto font-medium text-oxford-blue-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Colaborador</th>
                      <th className="px-6 py-4">Cargo</th>
                      <th className="px-6 py-4">Departamento</th>
                      <th className="px-6 py-4 text-center">Pontuação</th>
                      <th className="px-6 py-4 text-center">Avaliações</th>
                      <th className="px-6 py-4 text-center">Última Avaliação</th>
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
                          {colleague.averageScore && colleague.averageScore > 0 ? (
                            <div className="flex items-center justify-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-roboto font-semibold text-rich-black-900">{colleague.averageScore.toFixed(1)}</span>
                            </div>
                          ) : (
                            <span className="text-oxford-blue-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-roboto font-medium text-rich-black-900">{colleague.totalEvaluations || 0}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-roboto font-medium text-rich-black-900">{colleague.lastEvaluation}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedColleague(colleague)}
                              disabled={!colleague.canEvaluate}
                              className={`px-4 py-2 rounded-lg font-roboto font-medium transition-all duration-200 flex items-center gap-2 ${
                                colleague.canEvaluate
                                  ? 'bg-yinmn-blue-600 hover:bg-yinmn-blue-700 text-white'
                                  : 'bg-platinum-200 text-oxford-blue-400 cursor-not-allowed'
                              }`}
                            >
                              {colleague.canEvaluate ? (
                                <>
                                  Avaliar
                                  <ChevronRight className="h-4 w-4" />
                                </>
                              ) : (
                                'Já avaliado'
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-oxford-blue-400" />
                      <span className="text-sm font-roboto font-light text-oxford-blue-600">{colleague.lastEvaluation}</span>
                    </div>

                    {/* Pontuação */}
                    {colleague.averageScore && colleague.averageScore > 0 && (
                      <div className="bg-platinum-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-roboto font-medium text-oxford-blue-500">Pontuação Média</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-roboto font-semibold text-rich-black-900">{colleague.averageScore.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="w-full bg-platinum-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-yinmn-blue-500 to-yinmn-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(colleague.averageScore / 10) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs font-roboto font-light text-oxford-blue-500 mt-2">
                          {colleague.totalEvaluations} avaliações
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Botão de ação */}
                  <button
                    onClick={() => setSelectedColleague(colleague)}
                    disabled={!colleague.canEvaluate}
                    className={`w-full py-3 px-4 rounded-2xl font-roboto font-medium transition-all duration-200 flex items-center justify-center ${
                      colleague.canEvaluate
                        ? 'bg-yinmn-blue-600 hover:bg-yinmn-blue-700 text-white shadow-sm hover:shadow-md'
                        : 'bg-platinum-200 text-oxford-blue-400 cursor-not-allowed'
                    }`}
                  >
                    {colleague.canEvaluate ? (
                      <>
                        Avaliar
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      'Já avaliado'
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredColleagues.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-16 text-center">
              <div className="h-20 w-20 bg-gradient-to-br from-platinum-100 to-platinum-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                <Users className="h-10 w-10 text-oxford-blue-400" />
              </div>
              <h3 className="text-xl font-roboto font-light text-rich-black-900 mb-4 tracking-wide">Nenhum colega encontrado</h3>
              <p className="text-sm text-oxford-blue-600 font-roboto font-light tracking-wide leading-relaxed max-w-md mx-auto">
                Tente ajustar sua busca ou verifique se há colegas disponíveis para avaliação
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}