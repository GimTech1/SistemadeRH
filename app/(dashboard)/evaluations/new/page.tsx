'use client'

import { useState } from 'react'
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
  Info,
  User,
  Calendar,
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
  const [skills, setSkills] = useState<Skill[]>(defaultSkills)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

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
        return 'text-neutral-500 bg-neutral-500/10'
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
      // Aqui você salvaria no banco
      toast.success(
        action === 'save' 
          ? 'Avaliação salva como rascunho!' 
          : 'Avaliação enviada com sucesso!'
      )
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/evaluations">
            <button className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-neutral-400" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-50">Nova Avaliação CHA</h1>
            <p className="text-sm text-neutral-400 mt-1">
              Avalie Conhecimentos, Habilidades e Atitudes do colaborador
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleSubmit('save')}
            disabled={loading}
            className="btn-secondary"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Rascunho
          </button>
          <button
            onClick={() => handleSubmit('submit')}
            disabled={loading}
            className="btn-primary"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar Avaliação
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-neutral-200 mb-6">Informações Básicas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Colaborador
            </label>
            <select
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none cursor-pointer hover:bg-neutral-800 transition-colors"
            >
              <option value="" className="bg-neutral-900">Selecione o colaborador</option>
              <option value="1" className="bg-neutral-900">João Silva</option>
              <option value="2" className="bg-neutral-900">Maria Santos</option>
              <option value="3" className="bg-neutral-900">Pedro Costa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Ciclo de Avaliação
            </label>
            <select
              value={evaluationCycle}
              onChange={(e) => setEvaluationCycle(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none cursor-pointer hover:bg-neutral-800 transition-colors"
            >
              <option value="" className="bg-neutral-900">Selecione o ciclo</option>
              <option value="2024-Q1" className="bg-neutral-900">2024 - Q1</option>
              <option value="2024-Q2" className="bg-neutral-900">2024 - Q2</option>
              <option value="2024-Q3" className="bg-neutral-900">2024 - Q3</option>
              <option value="2024-Q4" className="bg-neutral-900">2024 - Q4</option>
            </select>
          </div>
        </div>
      </div>

      {/* Score Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-400">Conhecimento</span>
            <Brain className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-semibold text-neutral-50">
            {calculateCategoryAverage('conhecimento')}
          </p>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-400">Habilidade</span>
            <Zap className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-semibold text-neutral-50">
            {calculateCategoryAverage('habilidade')}
          </p>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-400">Atitude</span>
            <Heart className="h-4 w-4 text-pink-500" />
          </div>
          <p className="text-2xl font-semibold text-neutral-50">
            {calculateCategoryAverage('atitude')}
          </p>
        </div>
        <div className="card p-6 bg-primary-500/10 border-primary-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-primary-400">Nota Geral</span>
            <Star className="h-4 w-4 text-primary-500" />
          </div>
          <p className="text-2xl font-semibold text-primary-500">
            {calculateOverallScore()}
          </p>
        </div>
      </div>

      {/* Skills Evaluation */}
      {['conhecimento', 'habilidade', 'atitude'].map((category) => {
        const Icon = getCategoryIcon(category)
        const categorySkills = skills.filter(s => s.category === category)
        
        return (
          <div key={category} className="card">
            <div className="p-6 border-b border-neutral-800">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-200 capitalize">
                    {category}
                  </h2>
                  <p className="text-sm text-neutral-400">
                    Avalie cada competência de 0 a 10
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {categorySkills.map((skill) => (
                <div key={skill.id} className="space-y-4">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-neutral-200">{skill.name}</h3>
                        <p className="text-sm text-neutral-400 mt-1">{skill.description}</p>
                      </div>
                      <span className="text-2xl font-semibold text-neutral-50 ml-4">
                        {skill.score}
                      </span>
                    </div>
                    
                    {/* Score Controls */}
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => updateSkillScore(skill.id, skill.score - 1)}
                        className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                      >
                        <Minus className="h-4 w-4 text-neutral-400" />
                      </button>
                      
                      <div className="flex-1">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={skill.score}
                          onChange={(e) => updateSkillScore(skill.id, parseInt(e.target.value))}
                          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, rgb(var(--primary)) 0%, rgb(var(--primary)) ${skill.score * 10}%, rgb(38, 38, 38) ${skill.score * 10}%, rgb(38, 38, 38) 100%)`
                          }}
                        />
                        <div className="flex justify-between text-xs text-neutral-500 mt-1">
                          <span>0</span>
                          <span>5</span>
                          <span>10</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => updateSkillScore(skill.id, skill.score + 1)}
                        className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                      >
                        <Plus className="h-4 w-4 text-neutral-400" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Comments */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                      Observações (opcional)
                    </label>
                    <textarea
                      value={skill.comments}
                      onChange={(e) => updateSkillComments(skill.id, e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                      rows={2}
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