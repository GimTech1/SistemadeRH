'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Calendar, 
  User, 
  Building,
  Tag,
  Eye,
  EyeOff
} from 'lucide-react'
import ProcessApprovalStatus from './ProcessApprovalStatus'

interface ProcessViewerProps {
  process: {
    id: string
    title: string
    description: string | null
    category: string
    status: 'draft' | 'published' | 'archived'
    created_by: string
    department_id: string | null
    is_public: boolean
    flow_data: any
    created_at: string
    updated_at: string
    departments?: { name: string } | null
    profiles?: { full_name: string } | null
  }
  onBack: () => void
  canEdit?: boolean
  onEdit?: () => void
}

export default function ProcessViewer({ 
  process, 
  onBack, 
  canEdit = false, 
  onEdit 
}: ProcessViewerProps) {
  const [showFlow, setShowFlow] = useState(true)
  const [zoom, setZoom] = useState(1)

  const getNodeShape = (node: any) => {
    const { x, y, width, height, color, label, type } = node
    
    switch (type) {
      case 'start':
        return (
          <circle
            cx={x + width/2}
            cy={y + height/2}
            r={width/2}
            fill={color}
            stroke="#000"
            strokeWidth="2"
          />
        )
      case 'end':
        return (
          <circle
            cx={x + width/2}
            cy={y + height/2}
            r={width/2}
            fill={color}
            stroke="#000"
            strokeWidth="2"
          />
        )
      case 'decision':
        const points = [
          `${x + width/2},${y}`,
          `${x + width},${y + height/2}`,
          `${x + width/2},${y + height}`,
          `${x},${y + height/2}`
        ].join(' ')
        return (
          <polygon
            points={points}
            fill={color}
            stroke="#000"
            strokeWidth="2"
          />
        )
      default:
        return (
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={color}
            stroke="#000"
            strokeWidth="2"
            rx="5"
          />
        )
    }
  }

  const getConnectionPath = (connection: any) => {
    const fromNode = process.flow_data?.nodes?.find((n: any) => n.id === connection.from)
    const toNode = process.flow_data?.nodes?.find((n: any) => n.id === connection.to)
    
    if (!fromNode || !toNode) return ''
    
    const fromX = fromNode.x + fromNode.width / 2
    const fromY = fromNode.y + fromNode.height / 2
    const toX = toNode.x + toNode.width / 2
    const toY = toNode.y + toNode.height / 2
    
    return `M ${fromX} ${fromY} L ${toX} ${toY}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publicado'
      case 'draft':
        return 'Rascunho'
      case 'archived':
        return 'Arquivado'
      default:
        return status
    }
  }

  const exportProcess = () => {
    const data = {
      title: process.title,
      description: process.description,
      category: process.category,
      flow_data: process.flow_data,
      exported_at: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${process.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareProcess = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: process.title,
          text: process.description || '',
          url: window.location.href
        })
      } catch (error) {
        console.log('Erro ao compartilhar:', error)
      }
    } else {
      // Fallback para copiar URL
      navigator.clipboard.writeText(window.location.href)
      alert('Link copiado para a área de transferência!')
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div>
            <h1 className="text-xl font-bold text-gray-900">{process.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Tag className="w-4 h-4 mr-1" />
                {process.category}
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(process.created_at).toLocaleDateString('pt-BR')}
              </span>
              {process.departments && (
                <span className="flex items-center">
                  <Building className="w-4 h-4 mr-1" />
                  {process.departments.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(process.status)}`}>
            {getStatusLabel(process.status)}
          </span>
          
          {process.is_public ? (
            <span className="flex items-center text-green-600 text-sm">
              <Eye className="w-4 h-4 mr-1" />
              Público
            </span>
          ) : (
            <span className="flex items-center text-gray-600 text-sm">
              <EyeOff className="w-4 h-4 mr-1" />
              Privado
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-4">
          <Button
            variant={showFlow ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowFlow(true)}
          >
            Fluxo
          </Button>
          <Button
            variant={!showFlow ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowFlow(false)}
          >
            Detalhes
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            >
              -
            </Button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            >
              +
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={exportProcess}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>

          <Button variant="outline" size="sm" onClick={shareProcess}>
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>

          {canEdit && onEdit && (
            <Button size="sm" onClick={onEdit}>
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {showFlow ? (
          <div className="h-full overflow-auto bg-gray-50">
            {process.flow_data?.nodes && process.flow_data.nodes.length > 0 ? (
              <div className="p-8">
                <svg
                  className="w-full h-full min-h-[600px]"
                  style={{ 
                    background: '#f8fafc',
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left'
                  }}
                >
                  {/* Grid */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Arrow marker */}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
                    </marker>
                  </defs>
                  
                  {/* Connections */}
                  {process.flow_data.connections?.map((connection: any) => (
                    <g key={connection.id}>
                      <path
                        d={getConnectionPath(connection)}
                        stroke="#374151"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />
                    </g>
                  ))}
                  
                  {/* Nodes */}
                  {process.flow_data.nodes.map((node: any) => (
                    <g key={node.id}>
                      {getNodeShape(node)}
                      <text
                        x={node.x + node.width / 2}
                        y={node.y + node.height / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="12"
                        fontWeight="bold"
                        className="select-none"
                      >
                        {node.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum fluxo definido
                  </h3>
                  <p className="text-gray-500">
                    Este processo ainda não possui um fluxo visual definido.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Informações Gerais */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Informações do Processo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Título</label>
                  <p className="text-gray-900">{process.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Categoria</label>
                  <p className="text-gray-900">{process.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-gray-900">{getStatusLabel(process.status)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Visibilidade</label>
                  <p className="text-gray-900">{process.is_public ? 'Público' : 'Privado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Criado por</label>
                  <p className="text-gray-900">{process.profiles?.full_name || 'Usuário'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Departamento</label>
                  <p className="text-gray-900">{process.departments?.name || 'Não especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Criação</label>
                  <p className="text-gray-900">{new Date(process.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Última Atualização</label>
                  <p className="text-gray-900">{new Date(process.updated_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </Card>

            {/* Descrição */}
            {process.description && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Descrição</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{process.description}</p>
              </Card>
            )}

            {/* Status de Aprovação */}
            {process.flow_data && (
              <ProcessApprovalStatus
                processId={process.id}
                flowData={process.flow_data}
                canApprove={canEdit}
              />
            )}

            {/* Metadados do Fluxo */}
            {process.flow_data?.metadata && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Informações do Fluxo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Versão</label>
                    <p className="text-gray-900">{process.flow_data.metadata.version || '1.0'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Número de Nós</label>
                    <p className="text-gray-900">{process.flow_data.nodes?.length || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Número de Conexões</label>
                    <p className="text-gray-900">{process.flow_data.connections?.length || 0}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
