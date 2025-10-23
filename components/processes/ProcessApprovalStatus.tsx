'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  User,
  Building
} from 'lucide-react'

interface Approval {
  id: string
  process_id: string
  department_id: string
  manager_id: string
  status: 'pending' | 'approved' | 'rejected'
  comments: string | null
  created_at: string
  approved_at: string | null
  rejected_at: string | null
  profiles: {
    full_name: string
    email: string
  }
  departments: {
    name: string
  }
}

interface ProcessApprovalStatusProps {
  processId: string
  flowData: any
  canApprove?: boolean
  onApprovalChange?: () => void
}

export default function ProcessApprovalStatus({ 
  processId, 
  flowData, 
  canApprove = false,
  onApprovalChange 
}: ProcessApprovalStatusProps) {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)
  const [comments, setComments] = useState('')
  
  const supabase = createClient()

  useEffect(() => {
    loadApprovals()
  }, [processId])

  const loadApprovals = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/processes/approvals?process_id=${processId}`)
      const data = await response.json()
      
      if (response.ok) {
        setApprovals(data.approvals || [])
      } else {
        console.error('Erro ao carregar aprovações:', data.error)
      }
    } catch (error) {
      console.error('Erro ao carregar aprovações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (approvalId: string, status: 'approved' | 'rejected') => {
    try {
      setApproving(approvalId)
      
      const response = await fetch('/api/processes/approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approval_id: approvalId,
          status,
          comments: comments.trim() || null
        })
      })

      const data = await response.json()

      if (response.ok) {
        await loadApprovals()
        onApprovalChange?.()
        setComments('')
      } else {
        console.error('Erro ao processar aprovação:', data.error)
      }
    } catch (error) {
      console.error('Erro ao processar aprovação:', error)
    } finally {
      setApproving(null)
    }
  }

  const getRequiredApprovals = () => {
    if (!flowData?.nodes) return []
    
    const processNodes = flowData.nodes.filter((node: any) => 
      node.type === 'process' && node.department_id
    )
    
    return processNodes.map((node: any) => ({
      department_id: node.department_id,
      department_name: node.department_name,
      node_label: node.label
    }))
  }

  const getApprovalStatus = (departmentId: string) => {
    return approvals.find(approval => approval.department_id === departmentId)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovado'
      case 'rejected':
        return 'Rejeitado'
      case 'pending':
        return 'Pendente'
      default:
        return 'Não solicitado'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </Card>
    )
  }

  const requiredApprovals = getRequiredApprovals()

  if (requiredApprovals.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center text-gray-500">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Este processo não requer aprovações de departamentos</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-lg mb-4">Status de Aprovações</h3>
      
      <div className="space-y-4">
        {requiredApprovals.map((approval: any) => {
          const approvalStatus = getApprovalStatus(approval.department_id)
          const status = approvalStatus?.status || 'not_requested'
          
          return (
            <div key={approval.department_id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="font-medium">{approval.department_name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({approval.node_label})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {getStatusText(status)}
                  </span>
                </div>
              </div>

              {approvalStatus && (
                <div className="text-sm text-gray-600">
                  <div className="flex items-center mb-1">
                    <User className="w-4 h-4 mr-1" />
                    <span>{approvalStatus.profiles.full_name}</span>
                  </div>
                  {approvalStatus.comments && (
                    <p className="text-gray-500 italic">"{approvalStatus.comments}"</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {status === 'approved' && approvalStatus.approved_at && 
                      `Aprovado em ${new Date(approvalStatus.approved_at).toLocaleDateString('pt-BR')}`
                    }
                    {status === 'rejected' && approvalStatus.rejected_at && 
                      `Rejeitado em ${new Date(approvalStatus.rejected_at).toLocaleDateString('pt-BR')}`
                    }
                  </p>
                </div>
              )}

              {canApprove && status === 'pending' && (
                <div className="mt-3 pt-3 border-t">
                  <div className="space-y-2">
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Comentários (opcional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      rows={2}
                    />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApproval(approvalStatus!.id, 'rejected')}
                        disabled={approving === approvalStatus!.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rejeitar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApproval(approvalStatus!.id, 'approved')}
                        disabled={approving === approvalStatus!.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aprovar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
