'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (data.user) {
        toast.success('Login realizado com sucesso')
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex">
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#171717',
            color: '#e5e5e5',
            border: '1px solid #262626',
          },
        }}
      />
      
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <img 
              src="/logo-brasão-branco.png" 
              alt="Logo" 
              className="h-20 w-auto object-contain mx-auto mb-4"
            />
            <h1 className="text-2xl font-semibold text-neutral-50">Sistema de RH</h1>
            <p className="text-sm text-neutral-400 mt-2">
              Gestão de Desempenho e Pessoas
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="seu@email.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                />
                <span className="ml-2 text-sm text-neutral-400">Manter conectado</span>
              </label>
              <Link 
                href="/forgot-password" 
                className="text-sm text-primary-500 hover:text-primary-400"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-neutral-400">
              Não tem uma conta?{' '}
              <Link href="/register" className="text-primary-500 hover:text-primary-400 font-medium">
                Cadastre-se
              </Link>
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel - Info */}
      <div className="hidden lg:flex flex-1 bg-neutral-900 items-center justify-center px-8">
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold text-neutral-50 mb-4">
            Gerencie sua equipe com eficiência
          </h2>
          <p className="text-neutral-400 mb-8">
            Avalie o desempenho dos colaboradores através da metodologia CHA - 
            Conhecimentos, Habilidades e Atitudes.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-600/20 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-primary-500"></div>
              </div>
              <p className="ml-3 text-sm text-neutral-300">
                Sistema completo de avaliação de desempenho
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-600/20 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-primary-500"></div>
              </div>
              <p className="ml-3 text-sm text-neutral-300">
                Dashboards e relatórios detalhados
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-600/20 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-primary-500"></div>
              </div>
              <p className="ml-3 text-sm text-neutral-300">
                Feedback 360° e metas individualizadas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}