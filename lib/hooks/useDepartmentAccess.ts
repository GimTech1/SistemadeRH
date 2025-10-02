'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DepartmentAccess {
  canViewSalary: boolean
  allowedDepartments: string[]
  userDepartment: string | null
  loading: boolean
}

const DEPARTMENT_IDS = {
  ADMINISTRATIVO: 'b127dd11-4b56-4d1f-9999-fa9341034b0e',
  COMERCIAL_INCORPORADORA: 'e2d60485-fdfa-4230-ba1f-c1a786eeb5c5',
  MARKETING: 'ee060d02-a0a4-44a1-9dc5-6d1a8c0fee02',
  LIMPEZA: 'baefd673-5dcf-4c55-abce-2e13e7af351b',
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
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setAccess(prev => ({ ...prev, loading: false }))
        return
      }

      let employee = null
      let employeeError = null

      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', user.email || '')
        .single()

      if (empData) {
        employee = empData as any
      } else {
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

      if (employeeError || !employee) {
        setAccess(prev => ({ ...prev, loading: false }))
        return
      }

      let userDepartmentId = (employee as any).department_id || (employee as any).department
      let userDepartmentName = (employee as any).department_name || (employee as any).department

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
         }
      }

      let canViewSalary = false
      let allowedDepartments: string[] = []

      if (userDepartmentId === DEPARTMENT_IDS.ADMINISTRATIVO) {
        canViewSalary = true
        allowedDepartments = [
          DEPARTMENT_IDS.ADMINISTRATIVO,
          DEPARTMENT_IDS.COMERCIAL_INCORPORADORA,
          DEPARTMENT_IDS.MARKETING,
          DEPARTMENT_IDS.LIMPEZA
        ]
      } else if (userDepartmentId) {
        canViewSalary = true
        allowedDepartments = ['ALL']
      } else {
        canViewSalary = false
        allowedDepartments = []
      }

      setAccess({
        canViewSalary,
        allowedDepartments,
        userDepartment: userDepartmentName,
        loading: false
      })

    } catch (error) {
      setAccess(prev => ({ ...prev, loading: false }))
    }
  }

  const canViewEmployeeSalary = (employeeDepartmentId: string): boolean => {
    if (!access.canViewSalary) {
      return false
    }
    
    if (access.allowedDepartments.includes('ALL')) {
      return true
    }
    
    return access.allowedDepartments.includes(employeeDepartmentId)
  }

  return {
    ...access,
    canViewEmployeeSalary,
    DEPARTMENT_IDS
  }
}
