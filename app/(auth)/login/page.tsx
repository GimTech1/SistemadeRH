'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Mail, Lock, Eye, EyeOff, Users, Award, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react'
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0D1B2A',
            border: '1px solid #E0E1DD',
          },
        }}
      />    
      
      {/* Seção principal - Desktop: esquerda, Mobile: topo */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12" style={{ backgroundColor: '#f8fafc' }}>
        <div className="w-full max-w-md">
          
          <div className="mb-6 lg:mb-8 text-center">
            <img 
              src="/logo-brasão-preto.png" 
              alt="Logo" 
              className="h-16 sm:h-20 w-auto object-contain mx-auto mb-4 lg:mb-6"
            />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-roboto font-light text-rich-black-600 tracking-wide leading-tight">
              Gestão de Desempenho e Pessoas
            </h1>
          </div>        
          
          <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 sm:p-8">
            <form onSubmit={handleLogin} className="space-y-5 lg:space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-oxford-blue-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent font-roboto font-light text-base"
                    placeholder="seu@email.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-oxford-blue-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent font-roboto font-light text-base"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-oxford-blue-400 hover:text-yinmn-blue-600 transition-colors p-1"
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
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 rounded border-platinum-300 bg-white text-yinmn-blue-600 focus:ring-yinmn-blue-500 focus:ring-offset-0"
                  />
                  <span className="ml-2 text-sm font-roboto font-light text-oxford-blue-600">Manter conectado</span>
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm font-roboto font-medium text-yinmn-blue-600 hover:text-yinmn-blue-700 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center text-base"
                style={{ backgroundColor: '#1B263B' }}
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
              <span className="text-sm font-roboto font-light text-oxford-blue-600">
                Não tem uma conta?{' '}
                <Link href="/register" className="font-roboto font-medium text-yinmn-blue-600 hover:text-yinmn-blue-700 transition-colors">
                  Cadastre-se
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Seção secundária - Desktop: direita, Mobile: embaixo */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 lg:py-12" style={{ backgroundColor: '#1B263B' }}>
        <div className="text-center w-full">
          <img 
            src="/logo-full-horizontal-branco.png" 
            alt="InvestMoney Logo" 
            className="h-20 sm:h-24 lg:h-32 w-auto object-contain mx-auto mb-4 lg:mb-8 max-w-xs sm:max-w-sm"
          />
          <div className="hidden sm:block">
            <p className="text-white/80 font-roboto font-light text-sm lg:text-base">
              InvestMoney SA
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}