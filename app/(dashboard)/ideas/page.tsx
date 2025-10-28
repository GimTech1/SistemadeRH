'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'

type Idea = {
  id: string
  title: string
  description: string | null
  is_anonymous: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  is_owner?: boolean
  author_name?: string | null
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

  const loadIdeas = async () => {
    setLoading(true)
    try {
      const resp = await fetch('/api/ideas')
      if (!resp.ok) throw new Error('Falha ao carregar ideias')
      const data = await resp.json()
      setIdeas(data.ideas || [])
    } catch (e) {
      toast.error('Erro ao carregar ideias')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIdeas()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Informe um título')
      return
    }
    setSubmitting(true)
    try {
      const resp = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, is_anonymous: isAnonymous }),
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err.error || 'Erro ao criar ideia')
      }
      toast.success('Ideia enviada!')
      setTitle('')
      setDescription('')
      setIsAnonymous(false)
      await loadIdeas()
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao criar ideia')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Compartilhe uma ideia</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Melhorar o onboarding" />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              className="w-full border rounded-md p-2 text-sm min-h-[120px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva sua ideia com detalhes"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="anonymous"
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="anonymous">Enviar como anônima</Label>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>{submitting ? 'Enviando...' : 'Enviar ideia'}</Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Ideias enviadas</h2>
        {loading ? (
          <div className="text-sm text-gray-500">Carregando...</div>
        ) : ideas.length === 0 ? (
          <div className="text-sm text-gray-500">Nenhuma ideia ainda.</div>
        ) : (
          <ul className="space-y-3">
            {ideas.map((idea) => (
              <li key={idea.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{idea.title}</h3>
                  <div className="text-right">
                    {idea.is_anonymous ? (
                      <span className="text-xs text-gray-500">Anônima</span>
                    ) : (
                      <span className="text-xs text-gray-600">por {idea.author_name || 'Usuário'}</span>
                    )}
                  </div>
                </div>
                {idea.description && (
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{idea.description}</p>
                )}
                <div className="text-xs text-gray-500 mt-3">Enviada em {new Date(idea.created_at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}


