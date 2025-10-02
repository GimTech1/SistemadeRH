'use client'

import { useDepartmentAccess } from '@/lib/hooks/useDepartmentAccess'

interface DepartmentAccessDebugProps {
  employeeDepartmentId?: string
  employeeDepartmentName?: string
}

export function DepartmentAccessDebug({ 
  employeeDepartmentId = '', 
  employeeDepartmentName = '' 
}: DepartmentAccessDebugProps) {
  const { 
    canViewSalary, 
    allowedDepartments, 
    userDepartment, 
    loading, 
    canViewEmployeeSalary,
    DEPARTMENT_IDS 
  } = useDepartmentAccess()

  // Debug: Log dos dados recebidos
  console.log('🔍 DepartmentAccessDebug recebeu:', {
    employeeDepartmentId,
    employeeDepartmentName
  })

  if (loading) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <div className="text-sm text-yellow-800">🔄 Carregando permissões de acesso...</div>
      </div>
    )
  }

  const canViewThisEmployee = canViewEmployeeSalary(employeeDepartmentId)

  return (
    <div className={`border p-4 rounded-lg text-xs space-y-2 ${
      canViewThisEmployee 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <h4 className={`font-semibold ${
        canViewThisEmployee ? 'text-green-800' : 'text-red-800'
      }`}>
        🔐 Controle de Acesso ao Salário
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <strong>Usuário logado:</strong> {userDepartment || '❌ Não identificado'}
        </div>
        
        <div>
          <strong>Funcionário visualizado:</strong> {employeeDepartmentName || '❌ Não identificado'}
        </div>
        
        <div>
          <strong>ID do departamento:</strong> {employeeDepartmentId || '❌ Não identificado'}
        </div>
        
        <div>
          <strong>Permissão geral:</strong> {canViewSalary ? '✅ Liberado' : '❌ Negado'}
        </div>
        
         <div>
           <strong>Tipo de acesso:</strong> 
           <span className={`ml-1 px-2 py-1 rounded text-xs font-semibold ${
             allowedDepartments.includes('ALL') 
               ? 'bg-green-100 text-green-800' 
               : 'bg-orange-100 text-orange-800'
           }`}>
             {allowedDepartments.includes('ALL') 
               ? '🔓 ACESSO TOTAL' 
               : '🔒 ACESSO RESTRITO'}
           </span>
         </div>
         
         <div>
           <strong>Departamentos permitidos:</strong> 
           <div className="text-xs mt-1">
             {allowedDepartments.includes('ALL') 
               ? 'TODOS (exceto Administrativo)' 
               : allowedDepartments.length > 0 
                 ? allowedDepartments.join(', ') 
                 : 'Nenhum'}
           </div>
         </div>
        
        <div className="md:col-span-2">
          <strong>Resultado para este funcionário:</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
            canViewThisEmployee 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {canViewThisEmployee ? '✅ PODE VER SALÁRIO' : '❌ ACESSO RESTRITO'}
          </span>
        </div>
      </div>
      
      <details className="mt-2">
        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
          Ver IDs dos departamentos
        </summary>
        <div className="mt-2 text-gray-600 text-xs">
          <ul className="ml-2 space-y-1">
            <li><strong>Administrativo:</strong> {DEPARTMENT_IDS.ADMINISTRATIVO}</li>
            <li><strong>Comercial:</strong> {DEPARTMENT_IDS.COMERCIAL_INCORPORADORA}</li>
            <li><strong>Marketing:</strong> {DEPARTMENT_IDS.MARKETING}</li>
          </ul>
        </div>
      </details>
    </div>
  )
}
