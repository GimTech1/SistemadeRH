'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Star, Send, User, Mail, MessageSquare, Shield, CheckCircle } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { motion } from 'framer-motion'

function FeedbackForm() {
  const searchParams = useSearchParams()
  const employee = searchParams.get('employee') || ''
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedback: '',
    score: 0,
    isAnonymous: false,
  })
  const [hoveredStar, setHoveredStar] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const employeeNames: Record<string, string> = {
    'joao-silva': 'João Silva',
    'maria-santos': 'Maria Santos',
    'pedro-costa': 'Pedro Costa',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.score === 0) {
      toast.error('Por favor, selecione uma nota')
      return
    }
    
    if (!formData.feedback.trim()) {
      toast.error('Por favor, escreva seu feedback')
      return
    }
    
    if (!formData.isAnonymous && !formData.name) {
      toast.error('Por favor, informe seu nome ou marque como anônimo')
      return
    }
    
    setLoading(true)
    
    try {
      // Simular envio para o servidor
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSubmitted(true)
      toast.success('Feedback enviado com sucesso!')
    } catch (error) {
      toast.error('Erro ao enviar feedback')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-primary-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md border-green-500/20 bg-dark-900/80 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Obrigado pelo seu feedback!</h2>
              <p className="text-gray-400">
                Sua avaliação é muito importante para nós e ajudará no desenvolvimento de nossos colaboradores.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-primary-950 p-4">
      <Toaster position="top-right" />
      
      <div className="max-w-2xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gradient mb-2">Avaliação de Desempenho</h1>
            <p className="text-gray-400">Sua opinião é fundamental para nosso crescimento</p>
          </div>

          <Card className="border-dark-800 bg-dark-900/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Avalie nosso colaborador</CardTitle>
              <CardDescription>
                {employee && employeeNames[employee] ? (
                  <>Você está avaliando: <span className="text-primary-400 font-semibold">{employeeNames[employee]}</span></>
                ) : (
                  'Compartilhe sua experiência de forma honesta e construtiva'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Anonymous Option */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-dark-800/50 border border-dark-700">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500"
                  />
                  <label htmlFor="isAnonymous" className="flex items-center gap-2 cursor-pointer">
                    <Shield className="h-4 w-4 text-purple-400" />
                    <span className="text-sm">Enviar feedback anonimamente</span>
                  </label>
                </div>

                {/* Personal Info */}
                {!formData.isAnonymous && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="name">Seu Nome</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="João Silva"
                          value={formData.name}
                          onChange={handleChange}
                          className="pl-10"
                          required={!formData.isAnonymous}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email (opcional)</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Rating */}
                <div className="space-y-2">
                  <Label>Nota Geral</Label>
                  <div className="flex items-center justify-center gap-2 p-6 rounded-lg bg-dark-800/30">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, score: star }))}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            star <= (hoveredStar || formData.score)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-primary-400">
                      {formData.score > 0 ? formData.score : '-'}/10
                    </span>
                  </div>
                </div>

                {/* Feedback Text */}
                <div className="space-y-2">
                  <Label htmlFor="feedback">Seu Feedback</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <textarea
                      id="feedback"
                      name="feedback"
                      placeholder="Compartilhe sua experiência com este colaborador. Seja específico sobre pontos positivos e áreas de melhoria..."
                      value={formData.feedback}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full pl-10 pr-4 py-3 bg-dark-900/50 border border-dark-700 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 text-gray-200 placeholder-gray-500 resize-none"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Mínimo de 20 caracteres. Seja construtivo e específico.
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Avaliação
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <div className="mt-8 p-4 rounded-lg bg-primary-500/10 border border-primary-500/20">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-semibold mb-1">Política de Privacidade</p>
                <p className="text-gray-400">
                  Suas informações são tratadas com total confidencialidade. 
                  Feedbacks anônimos não armazenam dados pessoais. 
                  Utilizamos estas avaliações exclusivamente para desenvolvimento profissional.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function ExternalFeedbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-primary-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    }>
      <FeedbackForm />
    </Suspense>
  )
}






