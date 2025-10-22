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
  Save,
  ChevronDown
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
  question_type: 'text' | 'multiple_choice'
  options: string[] | null
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
  const [newQuestionType, setNewQuestionType] = useState<'text' | 'multiple_choice'>('text')
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>(['', ''])
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [editQuestionText, setEditQuestionText] = useState('')
  const [editQuestionType, setEditQuestionType] = useState<'text' | 'multiple_choice'>('text')
  const [editQuestionOptions, setEditQuestionOptions] = useState<string[]>(['', ''])
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'gerente' | 'employee'>('employee')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userDepartmentId, setUserDepartmentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [todayResponses, setTodayResponses] = useState<Record<string, string>>({})
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({})
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })
  const [activeTab, setActiveTab] = useState<'responder' | 'manage' | 'respostas'>('responder')
  const isManagerOrAdmin = userRole === 'admin' || userRole === 'manager' || userRole === 'gerente'
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null)
  const [allResponses, setAllResponses] = useState<any[]>([])
  const [loadingResponses, setLoadingResponses] = useState(false)
  const [showPendingModal, setShowPendingModal] = useState(false)

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

  const loadDailyQuestions = async (dateOverride?: string) => {
    try {
      const d = dateOverride || selectedDate
      const response = await fetch(`/api/daily-questions?date=${encodeURIComponent(d)}`)
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
    // Recarrega perguntas e respostas quando a data muda (somente perguntas filtradas na aba Responder)
    if (activeTab === 'responder') {
      loadDailyQuestions(selectedDate)
    } else {
      loadDailyQuestions()
    }
    loadTodayResponses(selectedDate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  useEffect(() => {
    // Ao mudar de aba, garante o dataset correto de perguntas
    if (activeTab === 'responder') {
      loadDailyQuestions(selectedDate)
    } else {
      loadDailyQuestions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const loadAllResponses = async (date?: string) => {
    if (!isManagerOrAdmin) return
    
    setLoadingResponses(true)
    try {
      const targetDate = date || selectedDate
      const response = await fetch(`/api/daily-responses?date=${targetDate}`)
      if (response.ok) {
        const data = await response.json()
        setAllResponses(data)
      }
    } catch (error) {
      console.error('Erro ao carregar respostas:', error)
    } finally {
      setLoadingResponses(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'respostas' && isManagerOrAdmin) {
      loadAllResponses()
    }
  }, [activeTab, selectedDate, isManagerOrAdmin])

  // Verificar se deve mostrar modal de pendentes
  useEffect(() => {
    if (shouldShowPendingModal()) {
      setShowPendingModal(true)
    }
  }, [allResponses, employees, userRole, userDepartmentId])

  const createDailyQuestion = async () => {
    if (!newQuestion.trim()) {
      toast.error('Preencha a pergunta')
      return
    }

    if (!userDepartmentId) {
      toast.error('Departamento não identificado')
      return
    }

    // Validação para perguntas de múltipla escolha
    if (newQuestionType === 'multiple_choice') {
      const validOptions = newQuestionOptions.filter(opt => opt.trim())
      if (validOptions.length < 2) {
        toast.error('Perguntas de múltipla escolha devem ter pelo menos 2 opções')
        return
      }
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
          question_type: newQuestionType,
          options: newQuestionType === 'multiple_choice' ? newQuestionOptions.filter(opt => opt.trim()) : null,
          is_active: true
        })
      })

      if (response.ok) {
        toast.success('Pergunta criada com sucesso')
        setNewQuestion('')
        setNewQuestionType('text')
        setNewQuestionOptions(['', ''])
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

    // Validação para perguntas de múltipla escolha
    if (editQuestionType === 'multiple_choice') {
      const validOptions = editQuestionOptions.filter(opt => opt.trim())
      if (validOptions.length < 2) {
        toast.error('Perguntas de múltipla escolha devem ter pelo menos 2 opções')
        return
      }
    }

    try {
      const response = await fetch(`/api/daily-questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: editQuestionText.trim(),
          question_type: editQuestionType,
          options: editQuestionType === 'multiple_choice' ? editQuestionOptions.filter(opt => opt.trim()) : null
        })
      })

      if (response.ok) {
        toast.success('Pergunta atualizada com sucesso')
        setEditingQuestion(null)
        setEditQuestionText('')
        setEditQuestionType('text')
        setEditQuestionOptions(['', ''])
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

  const getPendingCountForSelectedDate = () => {
    // Primeiro verifica se há perguntas ativas para responder
    const activeQuestions = getQuestionsForUser()
    if (activeQuestions.length === 0) {
      return -1 // Indica que não há perguntas para responder
    }

    // Considera todos os colaboradores se admin; caso contrário, apenas do departamento do gerente
    const relevantEmployees = (userRole === 'admin')
      ? employees
      : employees.filter(emp => emp.department === userDepartmentId)

    const relevantEmployeeIds = new Set(relevantEmployees.map(emp => emp.id))
    const responderIds = new Set(
      allResponses
        .filter((resp: any) => relevantEmployeeIds.has(resp.employee_id))
        .map((resp: any) => resp.employee_id)
    )

    let pending = 0
    for (const emp of relevantEmployees) {
      if (!responderIds.has(emp.id)) pending++
    }
    return pending
  }

  const getPendingEmployees = () => {
    const activeQuestions = getQuestionsForUser()
    if (activeQuestions.length === 0) {
      return []
    }

    const relevantEmployees = (userRole === 'admin')
      ? employees
      : employees.filter(emp => emp.department === userDepartmentId)

    const relevantEmployeeIds = new Set(relevantEmployees.map(emp => emp.id))
    const responderIds = new Set(
      allResponses
        .filter((resp: any) => relevantEmployeeIds.has(resp.employee_id))
        .map((resp: any) => resp.employee_id)
    )

    return relevantEmployees.filter(emp => !responderIds.has(emp.id))
  }

  const shouldShowPendingModal = () => {
    if (!isManagerOrAdmin) return false
    
    const now = new Date()
    const currentHour = now.getHours()
    
    // Só mostra após 10h da manhã
    if (currentHour < 10) return false
    
    // Verifica se há pendentes hoje
    const pending = getPendingCountForSelectedDate()
    return pending > 0
  }

  const addNewOption = () => {
    setNewQuestionOptions([...newQuestionOptions, ''])
  }

  const removeNewOption = (index: number) => {
    if (newQuestionOptions.length > 2) {
      setNewQuestionOptions(newQuestionOptions.filter((_, i) => i !== index))
    }
  }

  const updateNewOption = (index: number, value: string) => {
    const newOptions = [...newQuestionOptions]
    newOptions[index] = value
    setNewQuestionOptions(newOptions)
  }

  const addEditOption = () => {
    setEditQuestionOptions([...editQuestionOptions, ''])
  }

  const removeEditOption = (index: number) => {
    if (editQuestionOptions.length > 2) {
      setEditQuestionOptions(editQuestionOptions.filter((_, i) => i !== index))
    }
  }

  const updateEditOption = (index: number, value: string) => {
    const newOptions = [...editQuestionOptions]
    newOptions[index] = value
    setEditQuestionOptions(newOptions)
  }

  const startEditingQuestion = (question: DailyQuestion) => {
    setEditingQuestion(question.id)
    setEditQuestionText(question.question)
    setEditQuestionType(question.question_type)
    setEditQuestionOptions(question.options || ['', ''])
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
          {isManagerOrAdmin && (
            <button
              onClick={() => setActiveTab('respostas')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'respostas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Respostas
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
              
              <div>
                <Label htmlFor="questionType">Tipo de Pergunta</Label>
                <div className="relative">
                  <select
                    id="questionType"
                    value={newQuestionType}
                    onChange={(e) => setNewQuestionType(e.target.value as 'text' | 'multiple_choice')}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 appearance-none bg-white no-native-select-arrow"
                    style={{ 
                      backgroundImage: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none'
                    }}
                  >
                    <option value="text">Texto Livre</option>
                    <option value="multiple_choice">Múltipla Escolha</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {newQuestionType === 'multiple_choice' && (
                <div>
                  <Label>Opções de Resposta</Label>
                  <div className="mt-2 space-y-2">
                    {newQuestionOptions.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={option}
                          onChange={(e) => updateNewOption(index, e.target.value)}
                          placeholder={`Opção ${index + 1}`}
                          className="flex-1"
                        />
                        {newQuestionOptions.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeNewOption(index)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addNewOption}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Opção
                    </Button>
                  </div>
                </div>
              )}
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
                    <div className="space-y-3">
                      <Input
                        value={editQuestionText}
                        onChange={(e) => setEditQuestionText(e.target.value)}
                        className="w-full"
                      />
                      
                      <div>
                        <Label htmlFor={`editQuestionType-${question.id}`}>Tipo de Pergunta</Label>
                        <div className="relative">
                          <select
                            id={`editQuestionType-${question.id}`}
                            value={editQuestionType}
                            onChange={(e) => setEditQuestionType(e.target.value as 'text' | 'multiple_choice')}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 appearance-none bg-white no-native-select-arrow"
                            style={{ 
                              backgroundImage: 'none',
                              WebkitAppearance: 'none',
                              MozAppearance: 'none'
                            }}
                          >
                            <option value="text">Texto Livre</option>
                            <option value="multiple_choice">Múltipla Escolha</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {editQuestionType === 'multiple_choice' && (
                        <div>
                          <Label>Opções de Resposta</Label>
                          <div className="mt-2 space-y-2">
                            {editQuestionOptions.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Input
                                  value={option}
                                  onChange={(e) => updateEditOption(index, e.target.value)}
                                  placeholder={`Opção ${index + 1}`}
                                  className="flex-1"
                                />
                                {editQuestionOptions.length > 2 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeEditOption(index)}
                                    className="text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addEditOption}
                              className="w-full"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Adicionar Opção
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
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
                            setEditQuestionType('text')
                            setEditQuestionOptions(['', ''])
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700">{question.question}</p>
                      {question.question_type === 'multiple_choice' && question.options && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 mb-1">Opções:</p>
                          <div className="flex flex-wrap gap-2">
                            {question.options.map((option, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {option}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {editingQuestion !== question.id && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditingQuestion(question)}
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
                    <div className="space-y-3">
                      {question.question_type === 'multiple_choice' && question.options ? (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Escolha uma opção:</p>
                          <div className="space-y-2">
                            {question.options.map((option, index) => (
                              <label key={index} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`edit-question-${question.id}`}
                                  value={option}
                                  defaultChecked={(selectedChoices[question.id] ?? todayResponses[question.id]) === option}
                                  className="text-blue-600 focus:ring-blue-500"
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedChoices(prev => ({ ...prev, [question.id]: option }))
                                    }
                                  }}
                                />
                                <span className="text-gray-700">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : (
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
                        </div>
                      )}
                      {question.question_type === 'multiple_choice' && (
                        <div className="flex space-x-2">
                          <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                              const value = selectedChoices[question.id] ?? todayResponses[question.id] ?? ''
                              submitResponse(question.id, value)
                              setEditingResponseId(null)
                            }}
                          >
                            Salvar
                          </Button>
                          <Button variant="outline" onClick={() => setEditingResponseId(null)}>Cancelar</Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Estado: não respondido */}
                  {!answered && (
                    <div className="space-y-3">
                      {question.question_type === 'multiple_choice' && question.options ? (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Escolha uma opção:</p>
                          <div className="space-y-2">
                            {question.options.map((option, index) => (
                              <label key={index} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`question-${question.id}`}
                                  value={option}
                                  className="text-blue-600 focus:ring-blue-500"
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedChoices(prev => ({ ...prev, [question.id]: option }))
                                    }
                                  }}
                                />
                                <span className="text-gray-700">{option}</span>
                              </label>
                            ))}
                          </div>
                          <div className="flex space-x-2 mt-4 md:mt-6">
                            <Button
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => {
                                const value = selectedChoices[question.id] ?? ''
                                submitResponse(question.id, value)
                              }}
                            >
                              Responder
                            </Button>
                          </div>
                        </div>
                      ) : (
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
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>
      )}

      {/* Aba de Respostas (Admin/Manager) */}
      {isManagerOrAdmin && activeTab === 'respostas' && (
        <Card className="p-6 mt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Respostas dos Colaboradores</h2>
              <p className="text-sm text-gray-600">
                Visualize as respostas dos colaboradores para a data selecionada
              </p>
            </div>
          </div>

          {/* Alerta de pendentes */}
          <div className="mb-4">
            <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
              <div className="text-sm text-amber-800">
                {(() => {
                  const pending = getPendingCountForSelectedDate()
                  if (pending === -1) {
                    return 'Não há perguntas ativas para responder hoje.'
                  }
                  if (pending === 0) {
                    return 'Todos os colaboradores responderam hoje.'
                  }
                  return `${pending} colaborador${pending > 1 ? 'es' : ''} ainda não respondeu.`
                })()}
              </div>
            </div>
          </div>

          {loadingResponses ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : allResponses.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Nenhuma resposta encontrada para a data selecionada.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allResponses.map((response: any) => (
                <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {response.profiles?.full_name || 'Usuário não encontrado'}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({response.profiles?.email})
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Pergunta:</strong> {response.daily_questions?.question}
                        {response.daily_questions?.question_type === 'multiple_choice' && response.daily_questions?.options && (
                          <div className="mt-1">
                            <span className="text-xs text-gray-500">Opções: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {response.daily_questions.options.map((option: string, index: number) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {option}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Departamento:</strong> {response.daily_questions?.departments?.name}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(response.created_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-700">
                      <strong>Resposta:</strong> {response.response}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Modal de Pendentes */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Colaboradores Pendentes
              </h3>
              <button
                onClick={() => setShowPendingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Os seguintes colaboradores ainda não responderam as perguntas diárias de hoje:
              </p>
            </div>

            <div className="max-h-60 overflow-y-auto mb-4">
              {getPendingEmployees().map((employee) => (
                <div key={employee.id} className="flex items-center space-x-3 py-2 border-b border-gray-100 last:border-b-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {employee.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{employee.full_name}</p>
                    <p className="text-xs text-gray-500">{employee.email}</p>
                    {employee.department_name && (
                      <p className="text-xs text-gray-400">{employee.department_name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowPendingModal(false)}
              >
                Fechar
              </Button>
              <Button
                onClick={() => {
                  setShowPendingModal(false)
                  setActiveTab('respostas')
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Ver Respostas
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

