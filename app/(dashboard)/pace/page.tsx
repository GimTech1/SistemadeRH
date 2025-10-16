'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Save
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

interface Department {
  id: string
  name: string
  description: string | null
}

interface DailyQuestion {
  id: string
  department_id: string
  question: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface DailyResponse {
  id: string
  question_id: string
  employee_id: string
  response: string
  response_date: string
  created_at: string
}

interface Employee {
  id: string
  full_name: string
  email: string
  position: string
  department: string
  department_name?: string
}

export default function PacePage() {
  const supabase: SupabaseClient<Database> = createClient()
  const [departments, setDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [dailyQuestions, setDailyQuestions] = useState<DailyQuestion[]>([])
  const [dailyResponses, setDailyResponses] = useState<DailyResponse[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')
  const [newQuestion, setNewQuestion] = useState('')
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [editQuestionText, setEditQuestionText] = useState('')
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'gerente' | 'employee'>('employee')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userDepartmentId, setUserDepartmentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [todayResponses, setTodayResponses] = useState<Record<string, string>>({})
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0])
  const [activeTab, setActiveTab] = useState<'responder' | 'manage'>('responder')
  const isManagerOrAdmin = userRole === 'admin' || userRole === 'manager' || userRole === 'gerente'
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null)

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      // Carregar perfil do usuário
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser(user)
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, department_id')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setUserRole((profile as any).role as 'admin' | 'manager' | 'gerente' | 'employee')
          setUserDepartmentId((profile as any).department_id)
        }
      }

      // Carregar departamentos
      const { data: deptData } = await supabase
        .from('departments')
        .select('id, name, description')
        .order('name')
      
      if (deptData) {
        setDepartments(deptData as Department[])
      }

      // Carregar funcionários
      const { data: empData } = await supabase
        .from('employees')
        .select(`
          id, 
          full_name, 
          email, 
          position, 
          department,
          departments!employees_department_fkey(name)
        `)
        .eq('is_active', true)
        .order('full_name')
      
      if (empData) {
        const employeesWithDeptName = empData.map((emp: any) => ({
          ...emp,
          department_name: emp.departments?.name
        }))
        setEmployees(employeesWithDeptName as Employee[])
      }

      // Carregar perguntas diárias
      await loadDailyQuestions()
      
      // Carregar respostas do dia selecionado
      await loadTodayResponses(selectedDate)

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const loadDailyQuestions = async () => {
    try {
      const response = await fetch('/api/daily-questions')
      if (response.ok) {
        const data = await response.json()
        setDailyQuestions(data)
      }
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error)
    }
  }

  const loadTodayResponses = async (dateOverride?: string) => {
    try {
      const targetDate = dateOverride || selectedDate
      
      const response = await fetch(`/api/daily-responses?date=${targetDate}`)
      if (response.ok) {
        const data = await response.json()
        const responsesMap: Record<string, string> = {}
        data.forEach((resp: any) => {
          responsesMap[resp.question_id] = resp.response
        })
        setTodayResponses(responsesMap)
      }
    } catch (error) {
      console.error('Erro ao carregar respostas:', error)
    }
  }

  useEffect(() => {
    // Recarrega respostas quando a data muda
    loadTodayResponses(selectedDate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  const createDailyQuestion = async () => {
    if (!newQuestion.trim()) {
      toast.error('Preencha a pergunta')
      return
    }

    if (!userDepartmentId) {
      toast.error('Departamento não identificado')
      return
    }

    try {
      const response = await fetch('/api/daily-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          department_id: userDepartmentId,
          question: newQuestion.trim(),
          is_active: true
        })
      })

      if (response.ok) {
        toast.success('Pergunta criada com sucesso')
        setNewQuestion('')
        await loadDailyQuestions()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao criar pergunta')
      }
    } catch (error) {
      console.error('Erro ao criar pergunta:', error)
      toast.error('Erro ao criar pergunta')
    }
  }

  const updateQuestion = async (questionId: string) => {
    if (!editQuestionText.trim()) {
      toast.error('Pergunta não pode estar vazia')
      return
    }

    try {
      const response = await fetch(`/api/daily-questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: editQuestionText.trim()
        })
      })

      if (response.ok) {
        toast.success('Pergunta atualizada com sucesso')
        setEditingQuestion(null)
        setEditQuestionText('')
        await loadDailyQuestions()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao atualizar pergunta')
      }
    } catch (error) {
      console.error('Erro ao atualizar pergunta:', error)
      toast.error('Erro ao atualizar pergunta')
    }
  }

  const toggleQuestionStatus = async (questionId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/daily-questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !isActive
        })
      })

      if (response.ok) {
        toast.success(`Pergunta ${!isActive ? 'ativada' : 'desativada'} com sucesso`)
        await loadDailyQuestions()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao alterar status da pergunta')
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status da pergunta')
    }
  }

  const deleteQuestion = async (questionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta pergunta?')) return

    try {
      const response = await fetch(`/api/daily-questions/${questionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Pergunta excluída com sucesso')
        await loadDailyQuestions()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao excluir pergunta')
      }
    } catch (error) {
      console.error('Erro ao excluir pergunta:', error)
      toast.error('Erro ao excluir pergunta')
    }
  }

  const submitResponse = async (questionId: string, response: string) => {
    if (!response.trim()) {
      toast.error('Resposta não pode estar vazia')
      return
    }

    try {
      const targetDate = selectedDate
      
      const responseData = await fetch('/api/daily-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: questionId,
          response: response.trim(),
          response_date: targetDate
        })
      })

      if (responseData.ok) {
        toast.success('Resposta salva com sucesso')
        await loadTodayResponses(selectedDate)
      } else {
        const error = await responseData.json()
        toast.error(error.error || 'Erro ao salvar resposta')
      }
    } catch (error) {
      console.error('Erro ao salvar resposta:', error)
      toast.error('Erro ao salvar resposta')
    }
  }

  const getDepartmentName = (departmentId: string) => {
    const dept = departments.find(d => d.id === departmentId)
    return dept?.name || 'Departamento não encontrado'
  }

  const getQuestionsForUser = () => {
    if (userRole === 'admin' || userRole === 'manager' || userRole === 'gerente') {
      return dailyQuestions.filter(q => q.is_active)
    } else {
      return dailyQuestions.filter(q => q.is_active && q.department_id === userDepartmentId)
    }
  }

  const getQuestionsForDepartment = () => {
    if (userRole === 'admin') {
      return dailyQuestions.filter(q => q.is_active)
    } else {
      return dailyQuestions.filter(q => q.is_active && q.department_id === userDepartmentId)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Check-in de perguntas diário</h1>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 rounded-md border border-gray-300 px-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          />
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Departamentos</p>
              <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Perguntas Ativas</p>
              <p className="text-2xl font-bold text-gray-900">
                {dailyQuestions.filter(q => q.is_active).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Respostas Hoje</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(todayResponses).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Funcionários</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('responder')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'responder'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Responder
          </button>
          {isManagerOrAdmin && (
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Perguntas do Setor
            </button>
          )}
        </nav>
      </div>

      {/* Gerenciamento de Perguntas (Admin/Manager) */}
      {isManagerOrAdmin && activeTab === 'manage' && (
        <Card className="p-6 mt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Perguntas do Meu Setor</h2>
              <p className="text-sm text-gray-600">
                {userDepartmentId ? getDepartmentName(userDepartmentId) : 'Carregando departamento...'}
              </p>
            </div>  
          </div>

          {/* Formulário de Nova Pergunta */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="question">Pergunta Diária</Label>
                <Input
                  id="question"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Ex: Como você está se sentindo hoje?"
                  className="mt-1"
                />
              </div>
            </div>
            <Button 
              onClick={createDailyQuestion} 
              className="w-full md:w-auto"
              disabled={!userDepartmentId}
              style={{ backgroundColor: '#1b263b' }}
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Criar Pergunta
            </Button>
          </div>

          {/* Lista de Perguntas */}
          <div className="space-y-3">
            {getQuestionsForDepartment().map(question => (
              <div key={question.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {getDepartmentName(question.department_id)}
                    </span>
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      question.is_active 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    )}>
                      {question.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                  {editingQuestion === question.id ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={editQuestionText}
                        onChange={(e) => setEditQuestionText(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => updateQuestion(question.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEditingQuestion(null)
                          setEditQuestionText('')
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-700">{question.question}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {editingQuestion !== question.id && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingQuestion(question.id)
                          setEditQuestionText(question.question)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleQuestionStatus(question.id, question.is_active)}
                        className={question.is_active ? "text-red-600" : "text-green-600"}
                      >
                        {question.is_active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteQuestion(question.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {getQuestionsForDepartment().length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {userDepartmentId 
                    ? 'Não há perguntas cadastradas para seu departamento.'
                    : 'Carregando departamento...'
                  }
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Check-in Diário */}
      {activeTab === 'responder' && (
      <Card className="p-6 mt-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Check-in Diário</h2>
        
        {getQuestionsForUser().length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {userRole === 'employee' 
                ? 'Não há perguntas diárias para seu departamento hoje.'
                : 'Não há perguntas diárias cadastradas.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {getQuestionsForUser().map(question => {
              const answered = Boolean(todayResponses[question.id])
              const isEditing = editingResponseId === question.id
              return (
                <div
                  key={question.id}
                  className={cn(
                    "rounded-lg p-4 border",
                    answered && !isEditing
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">
                      {getDepartmentName(question.department_id)}
                    </h3>
                    {answered && !isEditing && (
                      <span className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Respondido
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-3">{question.question}</p>

                  {/* Estado: respondido (visualização) */}
                  {answered && !isEditing && (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="px-3 py-3 rounded-lg bg-white border border-green-200 text-gray-900">
                          {todayResponses[question.id]}
                        </div>
                      </div>
                      <div className="ml-2">
                        <Button
                          variant="secondary"
                          onClick={() => setEditingResponseId(question.id)}
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Estado: edição da resposta */}
                  {answered && isEditing && (
                    <div className="flex space-x-2">
                      <Input
                        defaultValue={todayResponses[question.id]}
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            submitResponse(question.id, (e.target as HTMLInputElement).value)
                            setEditingResponseId(null)
                          }
                        }}
                      />
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={(e) => {
                          const input = (e.currentTarget.previousElementSibling as HTMLInputElement)
                          submitResponse(question.id, input.value)
                          setEditingResponseId(null)
                        }}
                      >
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={() => setEditingResponseId(null)}>Cancelar</Button>
                    </div>
                  )}

                  {/* Estado: não respondido */}
                  {!answered && (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Sua resposta..."
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            submitResponse(question.id, (e.target as HTMLInputElement).value)
                          }
                        }}
                      />
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement
                          submitResponse(question.id, input.value)
                        }}
                      >
                        Responder
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>
      )}
    </div>
  )
}

