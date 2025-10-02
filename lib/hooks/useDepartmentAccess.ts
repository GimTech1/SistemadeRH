'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DepartmentAccess {
  canViewSalary: boolean
  allowedDepartments: string[]
  userDepartment: string | null
  loading: boolean
}

// IDs dos departamentos conforme especificado
const DEPARTMENT_IDS = {
  ADMINISTRATIVO: 'b127dd11-4b56-4d1f-9999-fa9341034b0e',
  COMERCIAL_INCORPORADORA: 'e2d60485-fdfa-4230-ba1f-c1a786eeb5c5',
  MARKETING: 'e2d60485-fdfa-4230-ba1f-c1a786eeb5c5' // Mesmo ID do Comercial
}

export function useDepartmentAccess() {
  const [access, setAccess] = useState<DepartmentAccess>({
    canViewSalary: false,
    allowedDepartments: [],
    userDepartment: null,
    loading: true
  })

  useEffect(() => {
    checkDepartmentAccess()
  }, [])

  const checkDepartmentAccess = async () => {
    try {
      const supabase = createClient()
      
      // Obter o usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      console.log('🔍 Verificando usuário:', { user: user?.email, error: userError })
      
      if (userError || !user) {
        console.log('❌ Erro ao obter usuário ou usuário não encontrado')
        setAccess(prev => ({ ...prev, loading: false }))
        return
      }

      // Buscar dados do funcionário logado - tentar diferentes campos
      let employee = null
      let employeeError = null

      // Primeiro tentar na tabela employees
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', user.email || '')
        .single()

      if (empData) {
        employee = empData as any
      } else {
        // Se não encontrou em employees, tentar na tabela users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email || '')
          .single()
        
        if (userData) {
          employee = userData as any
        } else {
          employeeError = userError
        }
      }

      console.log('🔍 Dados do funcionário:', { employee, error: employeeError })

      if (employeeError || !employee) {
        console.log('❌ Erro ao buscar funcionário ou funcionário não encontrado')
        setAccess(prev => ({ ...prev, loading: false }))
        return
      }

      // Verificar se department_id existe, senão usar department como ID
      let userDepartmentId = (employee as any).department_id || (employee as any).department
      let userDepartmentName = (employee as any).department_name || (employee as any).department

      // Se department é um ID (UUID), buscar o nome na tabela departments
      if (userDepartmentId && userDepartmentId.length > 20 && !userDepartmentName) {
        try {
          const { data: deptData } = await supabase
            .from('departments')
            .select('name')
            .eq('id', userDepartmentId)
            .single()
          
          if (deptData) {
            userDepartmentName = (deptData as any)?.name || ''
          }
        } catch (deptError) {
          console.log('⚠️ Erro ao buscar nome do departamento:', deptError)
        }
      }

      console.log('🔍 Departamento do usuário:', { 
        userDepartmentId, 
        userDepartmentName,
        allEmployeeFields: Object.keys(employee)
      })

      // Definir regras de acesso baseadas no departamento
      let canViewSalary = false
      let allowedDepartments: string[] = []

      if (userDepartmentId === DEPARTMENT_IDS.ADMINISTRATIVO) {
        // APENAS Administrativo tem restrição: só pode ver próprio, Comercial e Marketing
        canViewSalary = true
        allowedDepartments = [
          DEPARTMENT_IDS.ADMINISTRATIVO,
          DEPARTMENT_IDS.COMERCIAL_INCORPORADORA,
          DEPARTMENT_IDS.MARKETING
        ]
        console.log('✅ Usuário do departamento Administrativo - acesso RESTRITO a departamentos específicos')
      } else if (userDepartmentId) {
        // Outros departamentos podem ver salários de TODOS (sem restrição)
        canViewSalary = true
        allowedDepartments = ['ALL'] // Acesso total para outros departamentos
        console.log('✅ Usuário de outro departamento - acesso LIBERADO para todos os departamentos')
      } else {
        // Se não conseguiu identificar o departamento, negar acesso por segurança
        canViewSalary = false
        allowedDepartments = []
        console.log('⚠️ Departamento não identificado - acesso negado por segurança')
      }

      console.log('🎯 Resultado final do acesso:', {
        canViewSalary,
        allowedDepartments,
        userDepartment: userDepartmentName
      })

      setAccess({
        canViewSalary,
        allowedDepartments,
        userDepartment: userDepartmentName,
        loading: false
      })

    } catch (error) {
      console.error('❌ Erro ao verificar acesso por departamento:', error)
      setAccess(prev => ({ ...prev, loading: false }))
    }
  }

  const canViewEmployeeSalary = (employeeDepartmentId: string): boolean => {
    console.log('🔍 canViewEmployeeSalary chamado com:', {
      employeeDepartmentId,
      canViewSalary: access.canViewSalary,
      allowedDepartments: access.allowedDepartments,
      userDepartment: access.userDepartment
    })
    
    if (!access.canViewSalary) {
      console.log('❌ Acesso negado: usuário não pode visualizar salários')
      return false
    }
    
    // Se o usuário tem acesso total (outros departamentos), sempre permitir
    if (access.allowedDepartments.includes('ALL')) {
      console.log('✅ Acesso total - pode ver salário de qualquer departamento')
      return true
    }
    
    // Para Administrativo, verificar se o departamento está na lista permitida
    const canView = access.allowedDepartments.includes(employeeDepartmentId)
    console.log(`🎯 Resultado: ${canView ? 'PODE VER' : 'NÃO PODE VER'} salário`)
    return canView
  }

  return {
    ...access,
    canViewEmployeeSalary,
    DEPARTMENT_IDS
  }
}
