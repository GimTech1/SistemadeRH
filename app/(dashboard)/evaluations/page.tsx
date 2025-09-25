'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Star,
  Brain,
  Zap,
  Heart,
  ChevronRight,
  Calendar,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatDate } from '@/lib/utils'

interface Evaluation {
  id: string
  employee_name: string
  evaluator_name: string
  cycle_name: string
  status: 'draft' | 'in_progress' | 'completed' | 'reviewed'
  overall_score: number
  created_at: string
  submitted_at: string
  cha_scores: {
    conhecimento: number
    habilidade: number
    atitude: number
  }
}

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    loadEvaluations()
  }, [])

  const loadEvaluations = async () => {
    try {
      // Simular dados de avaliações
      setEvaluations([
        {
          id: '1',
          employee_name: 'João Silva',
          evaluator_name: 'Maria Santos',
          cycle_name: 'Q1 2024',
          status: 'completed',
          overall_score: 8.5,
          created_at: '2024-01-10',
          submitted_at: '2024-01-15',
          cha_scores: {
            conhecimento: 8.0,
            habilidade: 9.0,
            atitude: 8.5,
          },
        },
        {
          id: '2',
          employee_name: 'Ana Costa',
          evaluator_name: 'Pedro Oliveira',
          cycle_name: 'Q1 2024',
          status: 'in_progress',
          overall_score: 0,
          created_at: '2024-01-12',
          submitted_at: '',
          cha_scores: {
            conhecimento: 7.5,
            habilidade: 8.0,
            atitude: 0,
          },
        },
        {
          id: '3',
          employee_name: 'Carlos Mendes',
          evaluator_name: 'Maria Santos',
          cycle_name: 'Q4 2023',
          status: 'reviewed',
          overall_score: 9.2,
          created_at: '2023-10-05',
          submitted_at: '2023-10-20',
          cha_scores: {
            conhecimento: 9.0,
            habilidade: 9.5,
            atitude: 9.0,
          },
        },
      ])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500/20 text-gray-400'
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'completed':
        return 'bg-green-500/20 text-green-400'
      case 'reviewed':
        return 'bg-blue-500/20 text-blue-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Rascunho'
      case 'in_progress':
        return 'Em Andamento'
      case 'completed':
        return 'Concluída'
      case 'reviewed':
        return 'Revisada'
      default:
        return status
    }
  }

  const getCHAIcon = (category: string) => {
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

  const getCHAColor = (category: string) => {
    switch (category) {
      case 'conhecimento':
        return 'text-purple-400'
      case 'habilidade':
        return 'text-blue-400'
      case 'atitude':
        return 'text-pink-400'
      default:
        return 'text-gray-400'
    }
  }

  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch = evaluation.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evaluation.evaluator_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || evaluation.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Avaliações de Desempenho</h1>
          <p className="text-gray-400 mt-2">
            Gerencie e acompanhe as avaliações CHA dos colaboradores
          </p>
        </div>
        <Link href="/evaluations/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Avaliação
          </Button>
        </Link>
      </div>

      {/* CHA Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['conhecimento', 'habilidade', 'atitude'].map((category) => {
          const Icon = getCHAIcon(category)
          const color = getCHAColor(category)
          
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 capitalize">{category}</p>
                      <p className="text-2xl font-bold mt-1">8.5</p>
                      <p className="text-xs text-gray-500 mt-1">Média Geral</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-dark-800/50`}>
                      <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar por colaborador ou avaliador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-dark-900/50 border border-dark-700 rounded-lg focus:outline-none focus:border-primary-500"
              >
                <option value="all">Todos os Status</option>
                <option value="draft">Rascunho</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluída</option>
                <option value="reviewed">Revisada</option>
              </select>
              <Button variant="secondary">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="secondary">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evaluations List */}
      <div className="grid gap-4">
        {filteredEvaluations.map((evaluation, index) => (
          <motion.div
            key={evaluation.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <User className="h-4 w-4 text-primary-400" />
                          {evaluation.employee_name}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Avaliador: {evaluation.evaluator_name}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(evaluation.status)}`}>
                        {getStatusText(evaluation.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {Object.entries(evaluation.cha_scores).map(([category, score]) => {
                        const Icon = getCHAIcon(category)
                        const color = getCHAColor(category)
                        
                        return (
                          <div key={category} className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${color}`} />
                            <div>
                              <p className="text-xs text-gray-500 capitalize">{category}</p>
                              <p className="font-semibold">{score > 0 ? score.toFixed(1) : '-'}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Criada: {formatDate(evaluation.created_at)}
                      </span>
                      {evaluation.submitted_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Enviada: {formatDate(evaluation.submitted_at)}
                        </span>
                      )}
                      <span>{evaluation.cycle_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {evaluation.overall_score > 0 && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Nota Final</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                          <span className="text-2xl font-bold">{evaluation.overall_score.toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Link href={`/evaluations/${evaluation.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/evaluations/${evaluation.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredEvaluations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-400">Nenhuma avaliação encontrada</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}






