'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye,
  User,
  Clock,
  Check,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

interface ReceivedInvoice {
  id: string
  file_name: string
  file_size: number
  file_type: string
  file_url: string
  created_at: string
  status: 'pending' | 'approved' | 'rejected'
  description?: string | null
  sender?: {
    full_name: string
    position: string | null
  }
}

export default function ReceivedInvoicesPage() {
  const [invoices, setInvoices] = useState<ReceivedInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const supabase: SupabaseClient<Database> = createClient()

  useEffect(() => {
    loadReceivedInvoices()
  }, [])

  const loadReceivedInvoices = async () => {
    try {
      const response = await fetch('/api/invoices/received')
      if (!response.ok) {
        if (response.status === 403) {
          toast.error('Você não tem permissão para acessar esta página')
          return
        }
        throw new Error('Erro ao carregar notas fiscais')
      }
      
      const { invoices } = await response.json()
      setInvoices(invoices || [])
    } catch (error) {
      console.error('Erro ao carregar notas fiscais recebidas:', error)
      toast.error('Erro ao carregar notas fiscais')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (invoiceId: string, status: 'approved' | 'rejected') => {
    setUpdating(invoiceId)
    
    try {
      const response = await fetch(`/api/invoices/received/${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar status')
      }

      toast.success(`Nota fiscal ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso!`)
      loadReceivedInvoices()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar status')
    } finally {
      setUpdating(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovada'
      case 'rejected':
        return 'Rejeitada'
      default:
        return 'Pendente'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notas Fiscais Recebidas</h1>
          <p className="text-gray-600">Gerencie as notas fiscais enviadas para você</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <User className="w-4 h-4" />
          <span>Área restrita</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {invoices.filter(inv => inv.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Aprovadas</p>
              <p className="text-2xl font-bold text-green-600">
                {invoices.filter(inv => inv.status === 'approved').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Rejeitadas</p>
              <p className="text-2xl font-bold text-red-600">
                {invoices.filter(inv => inv.status === 'rejected').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Invoices List */}
      {invoices.length > 0 ? (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Notas Fiscais ({invoices.length})
          </h3>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(invoice.status)}
                  <div>
                    <p className="font-medium text-gray-900">{invoice.file_name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(invoice.file_size)} • De: {invoice.sender?.full_name || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {invoice.sender?.position && `${invoice.sender.position} • `}
                      Enviado em {new Date(invoice.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    {invoice.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {invoice.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                    {getStatusText(invoice.status)}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(invoice.file_url, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Visualizar
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(invoice.file_url, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  {invoice.status === 'pending' && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStatusUpdate(invoice.id, 'approved')}
                        disabled={updating === invoice.id}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        {updating === invoice.id ? 'Aprovando...' : 'Aprovar'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStatusUpdate(invoice.id, 'rejected')}
                        disabled={updating === invoice.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        {updating === invoice.id ? 'Rejeitando...' : 'Rejeitar'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma nota fiscal recebida
          </h3>
          <p className="text-gray-600">
            As notas fiscais enviadas para você aparecerão aqui.
          </p>
        </Card>
      )}
    </div>
  )
}
