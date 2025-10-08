'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'

type OrgNode = {
  id: string
  name: string
  title?: string
  children?: OrgNode[]
}

type EmployeeItem = {
  id: string
  full_name: string
  position: string | null
}

function OrgCard({
  node,
  assigned,
  onDropEmployee,
  onUnassign,
  onAddChild,
  onRemoveNode,
  onMoveNodeDrop,
  onEditNode,
  isEditing,
  setEditing,
}: {
  node: OrgNode
  assigned?: EmployeeItem | EmployeeItem[] | null
  onDropEmployee: (nodeId: string, employeeId: string) => void
  onUnassign: (nodeId: string, employeeId?: string) => void
  onAddChild: (parentId: string) => void
  onRemoveNode: (nodeId: string) => void
  onMoveNodeDrop: (targetId: string, sourceId: string) => void
  onEditNode: (nodeId: string, fields: Partial<Pick<OrgNode, 'name' | 'title'>>) => void
  isEditing: boolean
  setEditing: (nodeId: string, editing: boolean) => void
}) {
  const [dragOver, setDragOver] = useState(false)
  const allowMulti = node.id === 'ceo'

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }
  const handleDragLeave = () => setDragOver(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const nodeId = e.dataTransfer.getData('text/x-org-node-id')
    if (nodeId) {
      if (nodeId !== node.id) onMoveNodeDrop(node.id, nodeId)
      return
    }
    const empId = e.dataTransfer.getData('text/x-employee-id') || e.dataTransfer.getData('text/plain')
    if (empId) onDropEmployee(node.id, empId)
  }

  return (
    <div className="inline-flex flex-col items-center">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={
          `rounded-xl bg-white shadow p-4 border min-w-[240px] transition-colors ` +
          (dragOver ? 'border-yinmn-blue-500 bg-blue-50' : 'border-gray-200')
        }
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/x-org-node-id', node.id)
          e.dataTransfer.effectAllowed = 'move'
        }}
      >
        {isEditing ? (
          <div className="space-y-2">
            <input
              value={node.title || ''}
              onChange={(e) => onEditNode(node.id, { title: e.target.value })}
              placeholder="Cargo"
              className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500"
            />
            <input
              value={node.name}
              onChange={(e) => onEditNode(node.id, { name: e.target.value })}
              placeholder="Nome do setor"
              className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500"
            />
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-500">{node.title || '—'}</div>
            <div className="text-base font-semibold text-gray-900">{node.name}</div>
          </>
        )}

        {allowMulti ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[0,1].map((slot) => {
              const list = Array.isArray(assigned) ? assigned : (assigned ? [assigned] : [])
              const emp = list[slot]
              return (
                <div key={slot} className={`rounded-lg border ${emp ? 'border-gray-200 bg-gray-50' : 'border-dashed border-gray-300'} p-3`}>
                  {emp ? (
                    <>
                      <div className="text-sm font-medium text-gray-900">{emp.full_name}</div>
                      <div className="text-xs text-gray-600">{emp.position || 'Sem cargo'}</div>
                      <button
                        onClick={() => onUnassign(node.id, emp.id)}
                        className="mt-2 text-xs text-red-600 hover:underline"
                      >
                        Remover
                      </button>
                    </>
                  ) : (
                    <div className="text-xs text-gray-500">Solte aqui</div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          assigned ? (
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="text-sm font-medium text-gray-900">{(assigned as EmployeeItem).full_name}</div>
              <div className="text-xs text-gray-600">{(assigned as EmployeeItem).position || 'Sem cargo'}</div>
              <button
                onClick={() => onUnassign(node.id)}
                className="mt-2 text-xs text-red-600 hover:underline"
              >
                Remover
              </button>
            </div>
          ) : (
            <div className="mt-3 text-xs text-gray-500">Arraste um colaborador para este card</div>
          )
        )}

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setEditing(node.id, !isEditing)}
            className="text-xs rounded-md px-2 py-1 border border-gray-300 hover:bg-gray-100"
            title="Editar nome/cargo"
          >
            {isEditing ? 'Concluir' : 'Editar'}
          </button>
          <button
            onClick={() => onAddChild(node.id)}
            className="text-xs rounded-md px-2 py-1 border border-gray-300 hover:bg-gray-100"
            title="Adicionar subnível"
          >
            Adicionar
          </button>
          <button
            onClick={() => onRemoveNode(node.id)}
            className="text-xs rounded-md px-2 py-1 border border-red-300 text-red-700 hover:bg-red-50"
            title="Remover este nó"
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  )
}

function OrgTree({
  node,
  assignments,
  onDropEmployee,
  onUnassign,
  onAddChild,
  onRemoveNode,
  onMoveNodeDrop,
  onEditNode,
  editingMap,
  setEditing,
}: {
  node: OrgNode
  assignments: Record<string, EmployeeItem | EmployeeItem[] | undefined>
  onDropEmployee: (nodeId: string, employeeId: string) => void
  onUnassign: (nodeId: string, employeeId?: string) => void
  onAddChild: (parentId: string) => void
  onRemoveNode: (nodeId: string) => void
  onMoveNodeDrop: (targetId: string, sourceId: string) => void
  onEditNode: (nodeId: string, fields: Partial<Pick<OrgNode, 'name' | 'title'>>) => void
  editingMap: Record<string, boolean>
  setEditing: (nodeId: string, editing: boolean) => void
}) {
  const hasChildren = (node.children?.length || 0) > 0
  return (
    <div className="flex flex-col items-center relative">
      <OrgCard
        node={node}
        assigned={assignments[node.id] || null}
        onDropEmployee={onDropEmployee}
        onUnassign={onUnassign}
        onAddChild={onAddChild}
        onRemoveNode={onRemoveNode}
        onMoveNodeDrop={onMoveNodeDrop}
        onEditNode={onEditNode}
        isEditing={!!editingMap[node.id]}
        setEditing={setEditing}
      />
      {hasChildren && (
        <>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex items-center justify-center gap-6 relative">
            {/* Linha horizontal conectando os filhos - apenas entre os cards */}
            {node.children!.length > 1 && (
              <div className="absolute top-0 h-px bg-gray-300" style={{
                left: `${100 / (node.children!.length * 2)}%`,
                right: `${100 / (node.children!.length * 2)}%`
              }} />
            )}
            {node.children!.map((child, index) => (
              <div key={child.id} className="flex flex-col items-center relative">
                {/* Linha vertical do filho */}
                <div className="h-6 w-px bg-gray-300" />
                <OrgTree
                  node={child}
                  assignments={assignments}
                  onDropEmployee={onDropEmployee}
                  onUnassign={onUnassign}
                  onAddChild={onAddChild}
                  onRemoveNode={onRemoveNode}
                  onMoveNodeDrop={onMoveNodeDrop}
                  onEditNode={onEditNode}
                  editingMap={editingMap}
                  setEditing={setEditing}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function OrganogramaPage() {
  const supabase = createClient()
  const [employees, setEmployees] = useState<EmployeeItem[]>([])
  const [search, setSearch] = useState('')
  const [assignments, setAssignments] = useState<Record<string, EmployeeItem | EmployeeItem[] | undefined>>({})
  const [tree, setTree] = useState<OrgNode>(() => ({
    id: 'ceo',
    name: 'Diretoria Geral',
    title: 'CEO',
    children: [
      {
        id: 'rh',
        name: 'Recursos Humanos',
        title: 'Gerência de RH',
        children: [
          { id: 'rh1', name: 'Recrutamento e Seleção', title: 'Coordenador(a)' },
          { id: 'rh2', name: 'Treinamento e Desenvolvimento', title: 'Coordenador(a)' },
        ],
      },
      {
        id: 'ti',
        name: 'Tecnologia da Informação',
        title: 'CTO',
        children: [
          { id: 'dev', name: 'Desenvolvimento', title: 'Líder Técnico' },
          { id: 'ops', name: 'Operações/Infra', title: 'Líder de Operações' },
        ],
      },
      {
        id: 'fin',
        name: 'Financeiro',
        title: 'CFO',
      },
    ],
  }))
  const [editingMap, setEditingMap] = useState<Record<string, boolean>>({})
  const [userId, setUserId] = useState<string | null>(null)

  const dedupeById = useCallback((list: EmployeeItem[]) => {
    const map = new Map<string, EmployeeItem>()
    for (const e of list) {
      const key = String(e.id)
      if (!map.has(key)) map.set(key, e)
    }
    return Array.from(map.values())
  }, [])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('employees')
        .select('id, full_name, position')
        .order('full_name', { ascending: true })
      const initial = ((data as any) || []) as EmployeeItem[]
      setEmployees(dedupeById(initial))
    }
    load()
  }, [supabase, dedupeById])

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUserId(data.user?.id ?? null)
    }
    fetchUser()
  }, [supabase])

  const generateId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
    return 'node-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
  }

  const cloneNode = (n: OrgNode): OrgNode => ({
    id: n.id,
    name: n.name,
    title: n.title,
    children: n.children ? n.children.map(cloneNode) : undefined,
  })

  const findNode = (n: OrgNode, id: string): OrgNode | null => {
    if (n.id === id) return n
    for (const child of n.children || []) {
      const found = findNode(child, id)
      if (found) return found
    }
    return null
  }

  const isDescendant = (n: OrgNode, ancestorId: string, nodeId: string): boolean => {
    const ancestor = findNode(n, ancestorId)
    if (!ancestor) return false
    const walk = (x: OrgNode): boolean => {
      if (!x.children) return false
      for (const c of x.children) {
        if (c.id === nodeId) return true
        if (walk(c)) return true
      }
      return false
    }
    return walk(ancestor)
  }

  const removeNode = (n: OrgNode, id: string): OrgNode => {
    if (n.id === id) {
      return n
    }
    const next: OrgNode = cloneNode(n)
    const children = next.children || []
    const idx = children.findIndex(c => c.id === id)
    if (idx >= 0) {
      children.splice(idx, 1)
      next.children = children
      return next
    }
    next.children = children.map(c => removeNode(c, id))
    return next
  }

  const extractNode = (n: OrgNode, id: string): { tree: OrgNode, removed?: OrgNode } => {
    if (n.id === id) return { tree: n }
    const copy = cloneNode(n)
    const children = copy.children || []
    const idx = children.findIndex(c => c.id === id)
    if (idx >= 0) {
      const [removed] = children.splice(idx, 1)
      copy.children = children
      return { tree: copy, removed }
    }
    copy.children = children.map(c => extractNode(c, id).tree)
    for (const c of children) {
      const tryFind = findNode(n, id)
      if (tryFind) break
    }
    return { tree: copy }
  }

  const appendChild = (n: OrgNode, parentId: string, child: OrgNode): OrgNode => {
    const copy = cloneNode(n)
    if (copy.id === parentId) {
      copy.children = [...(copy.children || []), child]
      return copy
    }
    copy.children = (copy.children || []).map(c => appendChild(c, parentId, child))
    return copy
  }

  const updateNodeFields = (n: OrgNode, nodeId: string, fields: Partial<Pick<OrgNode, 'name' | 'title'>>): OrgNode => {
    const copy = cloneNode(n)
    if (copy.id === nodeId) {
      copy.name = fields.name !== undefined ? fields.name : copy.name
      copy.title = fields.title !== undefined ? fields.title : copy.title
      return copy
    }
    copy.children = (copy.children || []).map(c => updateNodeFields(c, nodeId, fields))
    return copy
  }

  const handleDropEmployee = useCallback((nodeId: string, employeeId: string) => {
    const emp = employees.find(e => String(e.id) === String(employeeId))
    if (!emp) return
    setAssignments(prev => {
      const existing = prev[nodeId]
      if (nodeId === 'ceo') {
        const list = Array.isArray(existing) ? existing.slice(0, 2) : (existing ? [existing] : [])
        if (list.find(e => String(e.id) === String(emp.id))) return prev
        if (list.length >= 2) return prev
        const nextList = [...list, emp]
        return { ...prev, [nodeId]: nextList }
      }
      return { ...prev, [nodeId]: emp }
    })
    setEmployees(prev => prev.filter(e => String(e.id) !== String(employeeId)))
  }, [employees])

  const handleUnassign = useCallback((nodeId: string, employeeId?: string) => {
    setAssignments(prev => {
      const current = prev[nodeId]
      const next = { ...prev }
      if (nodeId === 'ceo') {
        const list = Array.isArray(current) ? current : (current ? [current] : [])
        let removed: EmployeeItem | undefined
        const remaining = employeeId
          ? list.filter(e => {
              const match = String(e.id) === String(employeeId)
              if (match) removed = e
              return !match
            })
          : []
        if (remaining.length > 0) next[nodeId] = remaining
        else delete next[nodeId]
        if (removed) setEmployees(prevEmployees => dedupeById([...prevEmployees, removed!]).sort((a, b) => a.full_name.localeCompare(b.full_name)))
        return next
      }
      const emp = current as EmployeeItem | undefined
      delete next[nodeId]
      if (emp) setEmployees(prevEmployees => dedupeById([...prevEmployees, emp]).sort((a, b) => a.full_name.localeCompare(b.full_name)))
      return next
    })
  }, [dedupeById])

  const handleAddChild = useCallback((parentId: string) => {
    setTree(prev => {
      const newNode: OrgNode = {
        id: generateId(),
        name: 'Novo nó',
        title: 'Cargo',
        children: [],
      }
      return appendChild(prev, parentId, newNode)
    })
  }, [])

  const handleRemoveNode = useCallback((nodeId: string) => {
    setTree(prev => {
      if (prev.id === nodeId) return prev
      const assigned = assignments[nodeId]
      if (assigned) {
        setAssignments(p => {
          const cp = { ...p }
          delete cp[nodeId]
          return cp
        })
        setEmployees(prevEmployees => {
          const toAdd = Array.isArray(assigned) ? assigned : [assigned]
          const merged = dedupeById([...prevEmployees, ...toAdd])
          return merged.sort((a, b) => a.full_name.localeCompare(b.full_name))
        })
      }
      return removeNode(prev, nodeId)
    })
  }, [assignments, dedupeById])

  const handleMoveNodeDrop = useCallback((targetId: string, sourceId: string) => {
    setTree(prev => {
      if (sourceId === targetId) return prev
      if (isDescendant(prev, sourceId, targetId)) return prev
      const { tree: withoutSource, removed } = extractNode(prev, sourceId)
      if (!removed) return prev
      const reparented = appendChild(withoutSource, targetId, removed)
      return reparented
    })
  }, [])

  const handleEditNode = useCallback((nodeId: string, fields: Partial<Pick<OrgNode, 'name' | 'title'>>) => {
    setTree(prev => updateNodeFields(prev, nodeId, fields))
  }, [])

  const setEditing = useCallback((nodeId: string, editing: boolean) => {
    setEditingMap(prev => ({ ...prev, [nodeId]: editing }))
  }, [])

  const saveOrganograma = useCallback(async () => {
    try {
      const payload = { tree, assignments }
      const key = userId ? `organograma:${userId}` : 'organograma:anon'
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(payload))
      }
      if (userId) {
        await fetch('/api/org_charts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      toast.success('Organograma salvo')
    } catch (e) {
      toast.error('Falha ao salvar organograma')
    }
  }, [tree, assignments, supabase, userId])

  const loadOrganograma = useCallback(async () => {
    try {
      let loaded: any = null
      if (userId) {
        const res = await fetch('/api/org_charts')
        if (res.ok) {
          const json = await res.json()
          loaded = json?.data || null
        }
      }
      if (!loaded && typeof localStorage !== 'undefined') {
        const key = userId ? `organograma:${userId}` : 'organograma:anon'
        const raw = localStorage.getItem(key)
        if (raw) loaded = JSON.parse(raw)
      }
      if (loaded?.tree) setTree(loaded.tree)
      if (loaded?.assignments) setAssignments(loaded.assignments)
      if (loaded) toast.success('Organograma carregado')
    } catch (e) {
    }
  }, [supabase, userId])

  const resetOrganograma = useCallback(() => {
    setAssignments({})
    setTree({
      id: 'ceo',
      name: 'Diretoria Geral',
      title: 'CEO',
      children: [
        {
          id: 'rh',
          name: 'Recursos Humanos',
          title: 'Gerência de RH',
          children: [
            { id: 'rh1', name: 'Recrutamento e Seleção', title: 'Coordenador(a)' },
            { id: 'rh2', name: 'Treinamento e Desenvolvimento', title: 'Coordenador(a)' },
          ],
        },
        {
          id: 'ti',
          name: 'Tecnologia da Informação',
          title: 'CTO',
          children: [
            { id: 'dev', name: 'Desenvolvimento', title: 'Líder Técnico' },
            { id: 'ops', name: 'Operações/Infra', title: 'Líder de Operações' },
          ],
        },
        {
          id: 'fin',
          name: 'Financeiro',
          title: 'CFO',
        },
      ],
    })
    toast.success('Organograma resetado')
  }, [])

  useEffect(() => {
    loadOrganograma()
  }, [userId, loadOrganograma])

  useEffect(() => {
    try {
      const key = userId ? `organograma:${userId}` : 'organograma:anon'
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify({ tree, assignments }))
      }
    } catch {}
  }, [tree, assignments, userId])

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = employees
    if (!q) return base
    return base.filter(e =>
      e.full_name.toLowerCase().includes(q) ||
      (e.position || '').toLowerCase().includes(q)
    )
  }, [employees, search])

  const uniqueFilteredEmployees = useMemo(() => dedupeById(filteredEmployees), [filteredEmployees, dedupeById])

  return (
    <div className="pb-10">
      <div className="mb-6 px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Visão hierárquica da estrutura organizacional</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={loadOrganograma} variant="outline" size="sm">Carregar</Button>
            <Button onClick={resetOrganograma} variant="outline" size="sm">Resetar</Button>
            <Button onClick={saveOrganograma} variant="primary" size="sm">Salvar</Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6 px-4 sm:px-0">
        <div className="flex-1 w-full overflow-x-auto rounded-xl border border-gray-200 bg-white">
          {/* Indicador de scroll para mobile */}
          <div className="md:hidden px-4 py-2 border-b border-gray-200 bg-gray-50 text-center text-xs text-gray-600">
            ← Deslize para navegar pelo organograma →
          </div>
          <div className="w-max min-w-full flex justify-center p-4">
            <OrgTree
              node={tree}
              assignments={assignments}
              onDropEmployee={handleDropEmployee}
              onUnassign={handleUnassign}
              onAddChild={handleAddChild}
              onRemoveNode={handleRemoveNode}
              onMoveNodeDrop={handleMoveNodeDrop}
              onEditNode={handleEditNode}
              editingMap={editingMap}
              setEditing={setEditing}
            />
          </div>
        </div>

        <aside className="w-full md:w-80 flex-shrink-0 px-0 md:px-0">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 md:sticky md:top-6">
            <div className="mb-3">
              <div className="text-base font-semibold text-gray-900">Colaboradores</div>
              <div className="text-xs text-gray-500">Arraste para um card do organograma</div>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou cargo"
              className="w-full mb-3 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500"
            />
            <div className="max-h-[360px] md:max-h-[480px] overflow-auto pr-1">
              {filteredEmployees.length === 0 && (
                <div className="text-sm text-gray-500">Nenhum colaborador disponível</div>
              )}
              <ul className="space-y-2">
                {uniqueFilteredEmployees.map(emp => (
                  <li key={emp.id}>
                    <button
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/x-employee-id', String(emp.id))
                        e.dataTransfer.setData('text/plain', String(emp.id))
                        e.dataTransfer.effectAllowed = 'move'
                      }}
                      className="w-full text-left rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors p-3"
                      title="Arraste para um card"
                    >
                      <div className="text-sm font-medium text-gray-900">{emp.full_name}</div>
                      <div className="text-xs text-gray-600">{emp.position || 'Sem cargo'}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

