'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowRight, 
  Circle, 
  Square, 
  Diamond,
  Type,
  MousePointer
} from 'lucide-react'

interface FlowNode {
  id: string
  type: 'start' | 'process' | 'decision' | 'end'
  x: number
  y: number
  width: number
  height: number
  label: string
  color: string
}

interface FlowConnection {
  id: string
  from: string
  to: string
  label?: string
}

interface ProcessFlowEditorProps {
  initialData?: any
  onSave: (flowData: any) => void
  onCancel: () => void
}

export default function ProcessFlowEditor({ 
  initialData, 
  onSave, 
  onCancel 
}: ProcessFlowEditorProps) {
  const [nodes, setNodes] = useState<FlowNode[]>([])
  const [connections, setConnections] = useState<FlowConnection[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [selectedTool, setSelectedTool] = useState<'select' | 'process' | 'decision' | 'end'>('select')
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState<string | null>(null)
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [nodeLabel, setNodeLabel] = useState('')
  
  const svgRef = useRef<SVGSVGElement>(null)
  const [svgOffset, setSvgOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (initialData?.nodes) {
      setNodes(initialData.nodes)
    }
    if (initialData?.connections) {
      setConnections(initialData.connections)
    }
  }, [initialData])

  const addNode = (type: 'start' | 'process' | 'decision' | 'end', x: number, y: number) => {
    const newNode: FlowNode = {
      id: `node_${Date.now()}`,
      type,
      x: x - 50, // Center the node
      y: y - 25,
      width: type === 'decision' ? 100 : 80,
      height: type === 'decision' ? 60 : 40,
      label: type === 'start' ? 'Início' : 
             type === 'end' ? 'Fim' : 
             type === 'decision' ? 'Decisão' : 'Processo',
      color: type === 'start' ? '#10b981' : 
             type === 'end' ? '#ef4444' : 
             type === 'decision' ? '#f59e0b' : '#3b82f6'
    }
    
    setNodes(prev => [...prev, newNode])
    setEditingNode(newNode.id)
    setNodeLabel(newNode.label)
  }

  const updateNode = (nodeId: string, updates: Partial<FlowNode>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ))
  }

  const deleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId))
    setConnections(prev => prev.filter(conn => 
      conn.from !== nodeId && conn.to !== nodeId
    ))
    setSelectedNode(null)
  }

  const startConnection = (nodeId: string) => {
    if (selectedTool === 'select') {
      setIsConnecting(true)
      setConnectionStart(nodeId)
    }
  }

  const endConnection = (nodeId: string) => {
    if (isConnecting && connectionStart && connectionStart !== nodeId) {
      const newConnection: FlowConnection = {
        id: `conn_${Date.now()}`,
        from: connectionStart,
        to: nodeId
      }
      setConnections(prev => [...prev, newConnection])
    }
    setIsConnecting(false)
    setConnectionStart(null)
  }

  const deleteConnection = (connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId))
  }

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (selectedTool !== 'select') {
      const rect = svgRef.current?.getBoundingClientRect()
      if (rect) {
        const x = e.clientX - rect.left - svgOffset.x
        const y = e.clientY - rect.top - svgOffset.y
        addNode(selectedTool as any, x, y)
        setSelectedTool('select')
      }
    } else if (isConnecting) {
      // Cancelar conexão se clicar fora dos nós
      setIsConnecting(false)
      setConnectionStart(null)
    }
  }

  const handleNodeClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedNode(nodeId)
    
    if (selectedTool === 'select') {
      if (isConnecting && connectionStart && connectionStart !== nodeId) {
        // Finalizar conexão
        endConnection(nodeId)
      } else if (!isConnecting) {
        // Iniciar nova conexão
        startConnection(nodeId)
      }
    }
  }

  const handleNodeDoubleClick = (nodeId: string) => {
    setEditingNode(nodeId)
    const node = nodes.find(n => n.id === nodeId)
    if (node) {
      setNodeLabel(node.label)
    }
  }

  const saveNodeLabel = () => {
    if (editingNode && nodeLabel.trim()) {
      updateNode(editingNode, { label: nodeLabel.trim() })
    }
    setEditingNode(null)
    setNodeLabel('')
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedNode && selectedTool === 'select') {
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedNode) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      
      updateNode(selectedNode, {
        x: nodes.find(n => n.id === selectedNode)!.x + deltaX,
        y: nodes.find(n => n.id === selectedNode)!.y + deltaY
      })
      
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const getNodeShape = (node: FlowNode) => {
    const { x, y, width, height, color, label } = node
    
    switch (node.type) {
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

  const getConnectionPath = (connection: FlowConnection) => {
    const fromNode = nodes.find(n => n.id === connection.from)
    const toNode = nodes.find(n => n.id === connection.to)
    
    if (!fromNode || !toNode) return ''
    
    const fromX = fromNode.x + fromNode.width / 2
    const fromY = fromNode.y + fromNode.height / 2
    const toX = toNode.x + toNode.width / 2
    const toY = toNode.y + toNode.height / 2
    
    return `M ${fromX} ${fromY} L ${toX} ${toY}`
  }

  const handleSave = () => {
    const flowData = {
      nodes,
      connections,
      metadata: {
        created_at: new Date().toISOString(),
        version: '1.0'
      }
    }
    onSave(flowData)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center space-x-2 p-4 border-b">
        <div className="flex items-center space-x-1">
          <Button
            variant={selectedTool === 'select' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedTool('select')}
          >
            <MousePointer className="w-4 h-4" />
          </Button>
          <Button
            variant={selectedTool === 'process' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedTool('process')}
          >
            <Square className="w-4 h-4" />
          </Button>
          <Button
            variant={selectedTool === 'decision' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedTool('decision')}
          >
            <Diamond className="w-4 h-4" />
          </Button>
          <Button
            variant={selectedTool === 'end' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedTool('end')}
          >
            <Circle className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex-1" />
        
        {isConnecting && (
          <div className="flex items-center text-sm text-green-600 mr-4">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Conectando nós... Clique em outro nó para finalizar
          </div>
        )}
        
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button size="sm" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full cursor-crosshair"
          onClick={handleSvgClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ background: '#f8fafc' }}
        >
          {/* Grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Connections */}
          {connections.map(connection => (
            <g key={connection.id}>
              <path
                d={getConnectionPath(connection)}
                stroke="#374151"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead)"
              />
              <circle
                r="4"
                fill="#374151"
                style={{
                  transform: `translate(${getConnectionPath(connection).split(' ')[3]}px, ${getConnectionPath(connection).split(' ')[4]}px)`
                }}
                onClick={() => deleteConnection(connection.id)}
                className="cursor-pointer"
              />
            </g>
          ))}
          
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
          
          {/* Nodes */}
          {nodes.map(node => (
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
                className="pointer-events-none select-none"
              >
                {node.label}
              </text>
              <rect
                x={node.x - 2}
                y={node.y - 2}
                width={node.width + 4}
                height={node.height + 4}
                fill="transparent"
                stroke={
                  selectedNode === node.id 
                    ? '#3b82f6' 
                    : connectionStart === node.id 
                      ? '#10b981' 
                      : 'transparent'
                }
                strokeWidth="2"
                className="cursor-pointer"
                onClick={(e) => handleNodeClick(node.id, e)}
                onDoubleClick={() => handleNodeDoubleClick(node.id)}
                onMouseDown={(e) => {
                  if (selectedTool === 'select' && !isConnecting) {
                    setIsDragging(true)
                    setDragStart({ x: e.clientX, y: e.clientY })
                  }
                }}
                onMouseUp={() => {
                  if (isDragging) {
                    setIsDragging(false)
                  }
                }}
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Node Label Editor */}
      {editingNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl border max-w-md w-full mx-4">
            <h3 className="font-medium mb-4 text-lg">Editar Rótulo do Nó</h3>
            <input
              type="text"
              value={nodeLabel}
              onChange={(e) => setNodeLabel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Digite o nome do nó"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveNodeLabel()
                if (e.key === 'Escape') {
                  setEditingNode(null)
                  setNodeLabel('')
                }
              }}
            />
            <div className="flex justify-end space-x-2">
              <Button size="sm" variant="outline" onClick={() => {
                setEditingNode(null)
                setNodeLabel('')
              }}>
                Cancelar
              </Button>
              <Button size="sm" onClick={saveNodeLabel}>
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border text-sm text-gray-600">
        <p><strong>Instruções:</strong></p>
        <p>• Selecione uma ferramenta e clique no canvas para adicionar nós</p>
        <p>• Clique e arraste para mover nós</p>
        <p>• Clique em um nó (fica verde) e depois em outro para conectar</p>
        <p>• Duplo-clique em um nó para editar o rótulo</p>
        <p>• Clique em uma conexão para removê-la</p>
        <p>• Clique fora dos nós para cancelar conexão</p>
      </div>
    </div>
  )
}
