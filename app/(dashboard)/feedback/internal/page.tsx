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
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Colleague {
  id: string
  name: string
  position: string
  department: string
  avatar: string
  lastEvaluation: string
  canEvaluate: boolean
}

export default function InternalFeedbackPage() {
  const [colleagues, setColleagues] = useState<Colleague[]>([])
  const [selectedColleague, setSelectedColleague] = useState<Colleague | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
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
        },
        {
          id: '2',
          name: 'Pedro Costa',
          position: 'Desenvolvedor Senior',
          department: 'TI',
          avatar: 'PC',
          lastEvaluation: 'Há 1 mês',
          canEvaluate: true,
        },
        {
          id: '3',
          name: 'Ana Oliveira',
          position: 'Analista de RH',
          department: 'RH',
          avatar: 'AO',
          lastEvaluation: 'Há 3 semanas',
          canEvaluate: false,
        },
        {
          id: '4',
          name: 'Carlos Mendes',
          position: 'Vendedor',
          department: 'Vendas',
          avatar: 'CM',
          lastEvaluation: 'Nunca avaliado',
          canEvaluate: true,
        },
        {
          id: '5',
          name: 'Juliana Lima',
          position: 'Designer',
          department: 'Marketing',
          avatar: 'JL',
          lastEvaluation: 'Há 1 semana',
          canEvaluate: false,
        },
        {
          id: '6',
          name: 'Roberto Silva',
          position: 'Analista Financeiro',
          department: 'Financeiro',
          avatar: 'RS',
          lastEvaluation: 'Há 2 semanas',
          canEvaluate: true,
        },
        {
          id: '7',
          name: 'Fernanda Costa',
          position: 'Coordenadora de RH',
          department: 'RH',
          avatar: 'FC',
          lastEvaluation: 'Há 1 mês',
          canEvaluate: true,
        },
        {
          id: '8',
          name: 'Lucas Oliveira',
          position: 'Desenvolvedor Junior',
          department: 'TI',
          avatar: 'LO',
          lastEvaluation: 'Nunca avaliado',
          canEvaluate: true,
        },
      ])
    } catch (error) {
      console.error('Erro ao carregar colegas:', error)
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

  const filteredColleagues = colleagues.filter(colleague => {
    const matchesSearch = colleague.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         colleague.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === 'all' || colleague.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const departments = ['all', ...new Set(colleagues.map(c => c.department))]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-neutral-400">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-50">
          Avaliação de Colegas
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Avalie seus colegas de trabalho e ajude no desenvolvimento da equipe
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Avaliações Realizadas</p>
              <p className="text-2xl font-semibold text-neutral-50 mt-1">8</p>
            </div>
            <Award className="h-8 w-8 text-primary-500" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Pendentes</p>
              <p className="text-2xl font-semibold text-neutral-50 mt-1">3</p>
            </div>
            <MessageSquare className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Sua Pontuação</p>
              <p className="text-2xl font-semibold text-neutral-50 mt-1">9.2</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {selectedColleague ? (
        /* Feedback Form */
        <div className="card">
          <div className="p-6 border-b border-neutral-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-neutral-800 flex items-center justify-center font-medium">
                  {selectedColleague.avatar}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Avaliando: {selectedColleague.name}</h2>
                  <p className="text-sm text-neutral-400">{selectedColleague.position} • {selectedColleague.department}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedColleague(null)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                Cancelar
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* CHA Evaluation */}
            {['conhecimento', 'habilidade', 'atitude'].map((skill) => (
              <div key={skill}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-neutral-300 capitalize">
                    {skill}
                  </label>
                  <span className="text-sm text-neutral-500">
                    {feedbackForm[skill as keyof typeof feedbackForm] || 0}/10
                  </span>
                </div>
                <div className="flex space-x-1">
                  {[...Array(10)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFeedbackForm(prev => ({
                        ...prev,
                        [skill]: i + 1
                      }))}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          i < (feedbackForm[skill as keyof typeof feedbackForm] as number)
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-neutral-700 hover:text-neutral-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {skill === 'conhecimento' && 'Domínio técnico e conhecimento do trabalho'}
                  {skill === 'habilidade' && 'Capacidade de execução e resolução de problemas'}
                  {skill === 'atitude' && 'Proatividade, colaboração e comprometimento'}
                </p>
              </div>
            ))}

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Comentário
              </label>
              <textarea
                value={feedbackForm.comment}
                onChange={(e) => setFeedbackForm(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-primary-500"
                rows={4}
                placeholder="Compartilhe sua experiência trabalhando com este colega..."
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedColleague(null)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitFeedback}
                className="btn-primary"
                disabled={loading}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Avaliação
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="card p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500"
                    placeholder="Buscar colaborador..."
                  />
                </div>
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'Todos os Departamentos' : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Colleagues List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredColleagues.map((colleague) => (
              <div key={colleague.id} className="card hover:bg-neutral-800/50 transition-colors h-full">
                <div className="p-6 flex flex-col h-full">
                  {/* Avatar and Name */}
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-neutral-800 flex items-center justify-center font-medium text-lg mb-3">
                      {colleague.avatar}
                    </div>
                    <h3 className="font-medium text-neutral-200">{colleague.name}</h3>
                    <p className="text-sm text-neutral-500">{colleague.position}</p>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 space-y-3 mb-4">
                    <div className="pb-3 border-b border-neutral-800">
                      <p className="text-xs text-neutral-500 mb-1">Departamento</p>
                      <p className="text-sm text-neutral-300 font-medium">{colleague.department}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Última avaliação</p>
                      <p className="text-sm text-neutral-300">{colleague.lastEvaluation}</p>
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => setSelectedColleague(colleague)}
                    disabled={!colleague.canEvaluate}
                    className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
                      colleague.canEvaluate 
                        ? 'bg-primary-500 text-white hover:bg-primary-600' 
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
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
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
