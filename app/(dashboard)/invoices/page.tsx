'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye,
  Trash2,
  User,
  Send
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

interface InvoiceFile {
  id: string
  file_name: string
  file_size: number
  file_type: string
  file_url: string
  created_at: string
  status: 'pending' | 'approved' | 'rejected'
  payment_status?: 'pending' | 'paid'
  paid_at?: string | null
  description?: string | null
  recipient_id?: string | null
  recipient?: {
    full_name: string
  }
  sender?: {
    full_name: string
    position: string | null
  }
}

interface Recipient {
  id: string
  name: string
}

export default function InvoicesPage() {
  const [files, setFiles] = useState<InvoiceFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent')
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase: SupabaseClient<Database> = createClient()

  const recipients: Recipient[] = [
    { id: process.env.NEXT_PUBLIC_JOSE_ID || 'b8f68ba9-891c-4ca1-b765-43fee671928f', name: 'José Fernando Cunha' },
    { id: process.env.NEXT_PUBLIC_BIANCA_ID || '0d0bf6c3-bda8-47a2-864b-425575d13194', name: 'Bianca dos Santos Leandro' }
  ]

  const joseId = process.env.NEXT_PUBLIC_JOSE_ID || 'b8f68ba9-891c-4ca1-b765-43fee671928f'
  const biancaId = process.env.NEXT_PUBLIC_BIANCA_ID || '0d0bf6c3-bda8-47a2-864b-425575d13194'
  const newAllowedId = process.env.NEXT_PUBLIC_NEW_ALLOWED_ID || '02088194-3439-411d-bdfb-05a255d8be24'
  const isSpecialUser = [joseId, biancaId, newAllowedId].includes(currentUserId)

  useEffect(() => {
    loadCurrentUser()
    loadInvoices()
  }, [])

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    } catch (error) {
      console.error('Erro ao carregar usuário atual:', error)
    }
  }

  const loadInvoices = async () => {
    try {
      if (activeTab === 'sent') {
        const response = await fetch('/api/invoices')
        if (!response.ok) throw new Error('Erro ao carregar notas fiscais')
        
        const { invoices } = await response.json()
        setFiles(invoices || [])
      } else {
        const response = await fetch('/api/invoices/received')
        if (!response.ok) {
          if (response.status === 403) {
            toast.error('Você não tem permissão para acessar notas fiscais recebidas')
            return
          }
          throw new Error('Erro ao carregar notas fiscais recebidas')
        }
        
        const { invoices } = await response.json()
        setFiles(invoices || [])
      }
    } catch (error) {
      console.error('Erro ao carregar notas fiscais:', error)
    }
  }

  useEffect(() => {
    loadInvoices()
  }, [activeTab])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = async (fileList: FileList) => {
    if (!selectedRecipient) {
      toast.error('Por favor, selecione um destinatário')
      return
    }

    const validFiles = Array.from(fileList).filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      const maxSize = 10 * 1024 * 1024 // 10MB
      
      if (!validTypes.includes(file.type)) {
        toast.error(`Arquivo ${file.name} não é um formato válido. Use PDF, JPG ou PNG.`)
        return false
      }
      
      if (file.size > maxSize) {
        toast.error(`Arquivo ${file.name} é muito grande. Tamanho máximo: 10MB.`)
        return false
      }
      
      return true
    })

    if (validFiles.length === 0) return

    setUploading(true)

    try {
      for (const file of validFiles) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('recipient_id', selectedRecipient)
        formData.append('description', description)

        const response = await fetch('/api/invoices', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erro ao enviar arquivo')
        }
      }

      toast.success(`${validFiles.length} arquivo(s) enviado(s) com sucesso!`)
      setSelectedRecipient('')
      setDescription('')
      loadInvoices()
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar arquivos. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch(`/api/invoices/${fileId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao deletar arquivo')
      }

      toast.success('Arquivo deletado com sucesso!')
      loadInvoices()
    } catch (error) {
      console.error('Erro ao deletar:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao deletar arquivo. Tente novamente.')
    }
  }

  const handleStatusUpdate = async (fileId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/invoices/received/${fileId}`, {
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
      loadInvoices()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar status')
    }
  }

  const handlePaymentUpdate = async (fileId: string, payment_status: 'pending' | 'paid') => {
    try {
      setUpdatingPaymentId(fileId)
      const response = await fetch(`/api/invoices/received/${fileId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payment_status }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar pagamento')
      }

      toast.success(payment_status === 'paid' ? 'Pagamento marcado como efetuado.' : 'Pagamento definido como pendente.')
      loadInvoices()
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar pagamento')
    } finally {
      setUpdatingPaymentId('')
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
        return <FileText className="w-4 h-4 text-yellow-500" />
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

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-roboto font-medium text-rich-black-900 tracking-wide">
            {activeTab === 'sent' ? 'Envie e gerencie suas notas fiscais' : 'Gerencie as notas fiscais recebidas'}
          </h1>
        </div>
      </div>

      {isSpecialUser && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Send className="w-4 h-4 inline mr-2" />
              Enviadas
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'received'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Recebidas
            </button>
          </nav>
        </div>
      )}

      {activeTab === 'sent' && (
        <Card className="p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex flex-col">
              <Label htmlFor="recipient" className="text-sm font-medium text-gray-700">
                Destinatário *
              </Label>
              <select
                id="recipient"
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value)}
                className="mt-1 block w-full h-[50px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
                required
              >
                <option value="">Selecione um destinatário</option>
                {recipients.map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>
                    {recipient.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex flex-col">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Descrição (opcional)
              </Label>
              <Input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Nota fiscal de janeiro/2024"
                className="mt-1 w-full h-[50px] rounded-md"
              />
            </div>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Arraste e solte seus arquivos aqui
            </h3>
            <p className="text-gray-600 mb-4">
              ou clique para selecionar arquivos
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Formatos aceitos: PDF, JPG, PNG (máximo 10MB por arquivo)
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !selectedRecipient}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              {uploading ? 'Enviando...' : 'Selecionar Arquivos'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </div>
        </Card>
      )}

      {files.length > 0 && (
        <Card className="p-4 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {activeTab === 'sent' ? 'Suas Notas Fiscais' : 'Notas Fiscais Recebidas'} ({files.length})
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start space-x-3 flex-1">
                    {getStatusIcon(file.status)}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{file.file_name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.file_size)} • {getStatusText(file.status)}
                        {file.status === 'approved' && (
                          <span className="ml-1">• {file.payment_status === 'paid' ? 'Pagamento efetuado' : 'Pagamento pendente'}</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">
                        {activeTab === 'sent' 
                          ? `Para: ${file.recipient?.full_name || 'N/A'} • Enviado em ${new Date(file.created_at).toLocaleDateString('pt-BR')}`
                          : `De: ${file.sender?.full_name || 'N/A'} • Enviado em ${new Date(file.created_at).toLocaleDateString('pt-BR')}`
                        }
                      </p>
                      {file.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {file.description}
                        </p>
                      )}
                    </div>
                  </div>
                   <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2">
                     <Button
                       variant="secondary"
                       size="sm"
                       onClick={() => window.open(file.file_url, '_blank')}
                       className="w-full sm:w-auto sm:flex-none"
                     >
                       <Eye className="w-4 h-4 mr-1" />
                       Visualizar
                     </Button>
                     <Button
                       variant="secondary"
                       size="sm"
                       onClick={() => window.open(file.file_url, '_blank')}
                       className="w-full sm:w-auto sm:flex-none"
                     >
                       <Download className="w-4 h-4 mr-1" />
                       Download
                     </Button>
                     {activeTab === 'sent' ? (
                       <Button
                         variant="secondary"
                         size="sm"
                         onClick={() => handleDelete(file.id)}
                         className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto sm:flex-none"
                       >
                         <Trash2 className="w-4 h-4" />
                         Deletar
                       </Button>
                     ) : (
                       <>
                         {file.status === 'pending' && (
                           <>
                             <Button
                               variant="secondary"
                               size="sm"
                               onClick={() => handleStatusUpdate(file.id, 'approved')}
                               className="text-green-600 hover:text-green-700 hover:bg-green-50 w-full sm:w-auto sm:flex-none"
                             >
                               <CheckCircle className="w-4 h-4 mr-1" />
                               Aprovar
                             </Button>
                             <Button
                               variant="secondary"
                               size="sm"
                               onClick={() => handleStatusUpdate(file.id, 'rejected')}
                               className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto sm:flex-none"
                             >
                               <X className="w-4 h-4 mr-1" />
                               Rejeitar
                             </Button>
                           </>
                         )}
                         {file.status === 'approved' && (
                           file.payment_status !== 'paid' ? (
                             <Button
                               variant="secondary"
                               size="sm"
                               onClick={() => handlePaymentUpdate(file.id, 'paid')}
                               disabled={updatingPaymentId === file.id}
                               className="text-green-600 hover:text-green-700 hover:bg-green-50 w-full sm:w-auto sm:flex-none"
                             >
                               <CheckCircle className="w-4 h-4 mr-1" />
                               {updatingPaymentId === file.id ? 'Marcando como pago...' : 'Marcar como pago'}
                             </Button>
                           ) : (
                             <Button
                               variant="secondary"
                               size="sm"
                               onClick={() => handlePaymentUpdate(file.id, 'pending')}
                               disabled={updatingPaymentId === file.id}
                               className="text-gray-700 hover:text-gray-800 hover:bg-gray-100 w-full sm:w-auto sm:flex-none"
                             >
                               {updatingPaymentId === file.id ? 'Atualizando...' : 'Definir como pendente'}
                             </Button>
                           )
                         )}
                       </>
                     )}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {files.length === 0 && !uploading && (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'sent' ? 'Nenhuma nota fiscal enviada' : 'Nenhuma nota fiscal recebida'}
          </h3>
          <p className="text-gray-600">
            {activeTab === 'sent' 
              ? 'Envie sua primeira nota fiscal usando a área de upload acima.'
              : 'As notas fiscais enviadas para você aparecerão aqui.'
            }
          </p>
        </Card>
      )}
      
      {/* Espaçamento no final da página para mobile */}
      <div className="h-8 sm:h-12"></div>
    </div>
  )
}
