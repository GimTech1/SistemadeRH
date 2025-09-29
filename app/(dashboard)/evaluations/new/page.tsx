'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Save,
  Send,
  ArrowLeft,
  Brain,
  Zap,
  Heart,
  Plus,
  Minus,
  Star,
  User,
  Calendar,
  Target,
  Award,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Skill {
  id: string
  name: string
  description: string
  category: 'conhecimento' | 'habilidade' | 'atitude'
  score: number
  comments: string
}

const defaultSkills: Skill[] = [
  // Conhecimentos
  {
    id: '1',
    name: 'Conhecimento Técnico',
    description: 'Domínio das ferramentas e tecnologias necessárias para o trabalho',
    category: 'conhecimento',
    score: 0,
    comments: '',
  },
  {
    id: '2',
    name: 'Conhecimento do Negócio',
    description: 'Compreensão dos processos e objetivos da empresa',
    category: 'conhecimento',
    score: 0,
    comments: '',
  },
  {
    id: '3',
    name: 'Conhecimento Regulatório',
    description: 'Entendimento das normas e regulamentos aplicáveis',
    category: 'conhecimento',
    score: 0,
    comments: '',
  },
  // Habilidades
  {
    id: '4',
    name: 'Comunicação',
    description: 'Capacidade de transmitir informações de forma clara e eficaz',
    category: 'habilidade',
    score: 0,
    comments: '',
  },
  {
    id: '5',
    name: 'Resolução de Problemas',
    description: 'Habilidade para identificar e solucionar desafios',
    category: 'habilidade',
    score: 0,
    comments: '',
  },
  {
    id: '6',
    name: 'Gestão do Tempo',
    description: 'Capacidade de organizar e priorizar tarefas',
    category: 'habilidade',
    score: 0,
    comments: '',
  },
  // Atitudes
  {
    id: '7',
    name: 'Proatividade',
    description: 'Iniciativa para antecipar problemas e propor soluções',
    category: 'atitude',
    score: 0,
    comments: '',
  },
  {
    id: '8',
    name: 'Trabalho em Equipe',
    description: 'Colaboração e integração com colegas',
    category: 'atitude',
    score: 0,
    comments: '',
  },
  {
    id: '9',
    name: 'Comprometimento',
    description: 'Dedicação e responsabilidade com resultados',
    category: 'atitude',
    score: 0,
    comments: '',
  },
]

export default function NewEvaluationPage() {
  const router = useRouter()
  const [employee, setEmployee] = useState('')
  const [evaluationCycle, setEvaluationCycle] = useState('')
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([])
  const [cycles, setCycles] = useState<{ id: string; name: string }[]>([])
  const [skills, setSkills] = useState<Skill[]>(defaultSkills)
  const [loading, setLoading] = useState(false)
  const [loadingOptions, setLoadingOptions] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true)
      try {
        const [empRes, cycRes] = await Promise.all([
          supabase.from('employees').select('id, full_name').order('full_name', { ascending: true }),
          supabase.from('evaluation_cycles').select('id, name').order('start_date', { ascending: false }),
        ])

        if (empRes.error) {
          toast.error('Erro ao carregar colaboradores')
        }
        if (cycRes.error) {
          toast.error('Erro ao carregar ciclos de avaliação')
        }

        setEmployees(empRes.data || [])
        setCycles(cycRes.data || [])
      } finally {
        setLoadingOptions(false)
      }
    }
    loadOptions()
  }, [])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'conhecimento':
        return Brain
      case 'habilidade':
        return Zap
      case 'atitude':
        return Heart
      default:
        return Star
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'conhecimento':
        return 'text-purple-500 bg-purple-500/10'
      case 'habilidade':
        return 'text-blue-500 bg-blue-500/10'
      case 'atitude':
        return 'text-pink-500 bg-pink-500/10'
      default:
        return 'text-oxford-blue-500 bg-oxford-blue-500/10'
    }
  }

  const updateSkillScore = (skillId: string, score: number) => {
    setSkills(skills.map(skill => 
      skill.id === skillId ? { ...skill, score: Math.max(0, Math.min(10, score)) } : skill
    ))
  }

  const updateSkillComments = (skillId: string, comments: string) => {
    setSkills(skills.map(skill => 
      skill.id === skillId ? { ...skill, comments } : skill
    ))
  }

  const calculateCategoryAverage = (category: string) => {
    const categorySkills = skills.filter(s => s.category === category)
    const total = categorySkills.reduce((acc, skill) => acc + skill.score, 0)
    return categorySkills.length > 0 ? (total / categorySkills.length).toFixed(1) : '0'
  }

  const calculateOverallScore = () => {
    const total = skills.reduce((acc, skill) => acc + skill.score, 0)
    return skills.length > 0 ? (total / skills.length).toFixed(1) : '0'
  }

  const handleSubmit = async (action: 'save' | 'submit') => {
    if (!employee || !evaluationCycle) {
      toast.error('Por favor, preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const payload = {
        cycle_id: evaluationCycle,
        employee_id: employee,
        evaluator_id: user?.id,
        status: action === 'save' ? 'draft' : 'completed',
        overall_score: Number(calculateOverallScore()),
        comments: null,
        strengths: null,
        improvements: null,
        goals: null,
        // skills: [] // opcional: enviar quando mapear para IDs reais de skills
        submitted: action === 'submit',
      }

      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error?.message || 'Erro ao salvar avaliação')
      }

      toast.success(action === 'save' ? 'Avaliação salva como rascunho!' : 'Avaliação enviada com sucesso!')
      router.push('/evaluations')
    } catch (error) {
      toast.error('Erro ao salvar avaliação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/evaluations">
            <button className="p-2 hover:bg-platinum-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-oxford-blue-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-roboto font-medium text-rich-black-900 tracking-wide">Nova Avaliação CHA</h1>
            <p className="text-sm font-roboto font-light text-oxford-blue-600 mt-1">
              Avalie Conhecimentos, Habilidades e Atitudes do colaborador
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleSubmit('save')}
            disabled={loading}
            className="bg-platinum-100 hover:bg-platinum-200 text-oxford-blue-600 px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Salvar Rascunho
          </button>
          <button
            onClick={() => handleSubmit('submit')}
            disabled={loading}
            className="text-white px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 hover:opacity-90"
            style={{ backgroundColor: '#1B263B' }}
          >
            <Send className="h-4 w-4" />
            Enviar Avaliação
          </button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Conhecimento</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">
                {calculateCategoryAverage('conhecimento')}
              </p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">pontuação média</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Habilidade</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">
                {calculateCategoryAverage('habilidade')}
              </p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">pontuação média</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-pink-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Atitude</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">
                {calculateCategoryAverage('atitude')}
              </p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">pontuação média</p>
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Nota Geral</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">
                {calculateOverallScore()}
              </p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">pontuação final</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>
      </div>

      {/* Informações Básicas */}
      <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
        <h2 className="text-lg font-roboto font-medium text-rich-black-900 mb-6">Informações Básicas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Colaborador
            </label>
            <select
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              disabled={loadingOptions}
              className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent appearance-none cursor-pointer hover:bg-platinum-50 transition-colors disabled:opacity-60"
            >
              <option value="">Selecione o colaborador</option>
              {employees.length === 0 && !loadingOptions && (
                <option disabled value="">Nenhum colaborador encontrado</option>
              )}
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Ciclo de Avaliação
            </label>
            <select
              value={evaluationCycle}
              onChange={(e) => setEvaluationCycle(e.target.value)}
              disabled={loadingOptions}
              className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent appearance-none cursor-pointer hover:bg-platinum-50 transition-colors disabled:opacity-60"
            >
              <option value="">Selecione o ciclo</option>
              {cycles.length === 0 && !loadingOptions && (
                <option disabled value="">Nenhum ciclo encontrado</option>
              )}
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Avaliação CHA */}
      {['conhecimento', 'habilidade', 'atitude'].map((category) => {
        const Icon = getCategoryIcon(category)
        const categorySkills = skills.filter(s => s.category === category)
        const categoryAverage = calculateCategoryAverage(category)
        
        return (
          <div key={category} className="bg-white rounded-2xl shadow-sm border border-platinum-200 overflow-hidden">
            <div className="p-6 border-b border-platinum-200 bg-gradient-to-r from-platinum-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${getCategoryColor(category)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-roboto font-medium text-rich-black-900 capitalize">
                      {category}
                    </h2>
                    <p className="text-sm font-roboto font-light text-oxford-blue-600">
                      Avalie cada competência de 0 a 10
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-roboto font-medium text-oxford-blue-500">Média da Categoria</p>
                  <p className="text-2xl font-roboto font-semibold text-rich-black-900">{categoryAverage}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-8">
              {categorySkills.map((skill) => (
                <div key={skill.id} className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-roboto font-medium text-rich-black-900 mb-2">{skill.name}</h3>
                      <p className="text-sm font-roboto font-light text-oxford-blue-600 mb-4">{skill.description}</p>
                    </div>
                    <div className="text-right ml-6">
                      <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Pontuação</p>
                      <p className="text-3xl font-roboto font-semibold text-rich-black-900">{skill.score}</p>
                    </div>
                  </div>
                  
                  {/* Score Controls */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => updateSkillScore(skill.id, skill.score - 1)}
                      className="p-3 hover:bg-platinum-100 rounded-xl transition-colors border border-platinum-300"
                    >
                      <Minus className="h-5 w-5 text-oxford-blue-600" />
                    </button>
                    
                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={skill.score}
                        onChange={(e) => updateSkillScore(skill.id, parseInt(e.target.value))}
                        className="w-full h-3 bg-platinum-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #415A77 0%, #415A77 ${skill.score * 10}%, #E0E1DD ${skill.score * 10}%, #E0E1DD 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs font-roboto font-light text-oxford-blue-500 mt-2">
                        <span>0</span>
                        <span>5</span>
                        <span>10</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => updateSkillScore(skill.id, skill.score + 1)}
                      className="p-3 hover:bg-platinum-100 rounded-xl transition-colors border border-platinum-300"
                    >
                      <Plus className="h-5 w-5 text-oxford-blue-600" />
                    </button>
                  </div>
                  
                  {/* Comments */}
                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      Observações (opcional)
                    </label>
                    <textarea
                      value={skill.comments}
                      onChange={(e) => updateSkillComments(skill.id, e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-sm font-roboto font-light text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Adicione comentários sobre esta competência..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}