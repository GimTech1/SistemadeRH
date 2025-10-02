'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sessionValid, setSessionValid] = useState<boolean | null>(null)
  const [passwordUpdated, setPasswordUpdated] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSessionValid(!!session)
      } catch (error) {
        setSessionValid(false)
      }
    }
    
    checkSession()
  }, [supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }
    
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }
    
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) {
        toast.error(error.message)
        return
      }
      
      setPasswordUpdated(true)
      toast.success('Senha atualizada com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar senha')
    } finally {
      setLoading(false)
    }
  }

  if (sessionValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-oxford-blue-600" />
          <span className="text-sm font-roboto font-light text-oxford-blue-600">Verificando link...</span>
        </div>
      </div>
    )
  }

  if (sessionValid === false) {
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
        
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12" style={{ backgroundColor: '#f8fafc' }}>
          <div className="w-full max-w-md">
            
            <div className="mb-6 lg:mb-8 text-center">
              <img 
                src="/logo-brasão-preto.png" 
                alt="Logo" 
                className="h-16 sm:h-20 w-auto object-contain mx-auto mb-4 lg:mb-6"
              />
              <h1 className="text-lg sm:text-xl lg:text-2xl font-roboto font-light text-rich-black-600 tracking-wide leading-tight">
                Link Inválido
              </h1>
            </div>        
            
            <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 sm:p-8 text-center">
              <div className="mb-6">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-roboto font-medium text-rich-black-900 mb-2">
                  Link Expirado ou Inválido
                </h2>
                <p className="text-sm font-roboto font-light text-oxford-blue-600">
                  Este link de recuperação não é válido ou já expirou.
                </p>
              </div>
              
              <div className="space-y-4">
                <p className="text-xs sm:text-sm font-roboto font-light text-oxford-blue-600">
                  • O link pode ter expirado (válido por 1 hora)<br/>
                  • Você pode ter usado o link anteriormente<br/>
                  • Solicite um novo link de recuperação
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/forgot-password"
                    className="flex-1 text-oxford-blue-600 px-4 py-2 rounded-lg font-roboto font-medium transition-colors hover:bg-oxford-blue-50"
                  >
                    Solicitar novo link
                  </Link>
                  
                  <Link
                    href="/login"
                    className="flex-1 text-white px-4 py-2 rounded-lg font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
                    style={{ backgroundColor: '#1B263B' }}
                  >
                    Voltar ao login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 lg:py-12" style={{ backgroundColor: '#1B263B' }}>
          <div className="text-center w-full">
            <img 
              src="/logo-full-horizontal-branco.png" 
              alt="Logo" 
              className="h-20 sm:h-24 lg:h-32 w-auto object-contain mx-auto mb-4 lg:mb-8 max-w-xs sm:max-w-sm"
            />
          </div>
        </div>
      </div>
    )
  }

  if (passwordUpdated) {
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
        
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12" style={{ backgroundColor: '#f8fafc' }}>
          <div className="w-full max-w-md">
            
            <div className="mb-6 lg:mb-8 text-center">
              <img 
                src="/logo-brasão-preto.png" 
                alt="Logo" 
                className="h-16 sm:h-20 w-auto object-contain mx-auto mb-4 lg:mb-6"
              />
              <h1 className="text-lg sm:text-xl lg:text-2xl font-roboto font-light text-rich-black-600 tracking-wide leading-tight">
                Senha Atualizada
              </h1>
            </div>        
            
            <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 sm:p-8 text-center">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-roboto font-medium text-rich-black-900 mb-2">
                  Sucesso!
                </h2>
                <p className="text-sm font-roboto font-light text-oxford-blue-600">
                  Sua senha foi atualizada com sucesso.
                </p>
              </div>
              
              <div className="space-y-4">
                <p className="text-xs sm:text-sm font-roboto font-light text-oxford-blue-600">
                  Agora você pode fazer login com sua nova senha.
                </p>
                
                <Link
                  href="/login"
                  className="w-full text-white px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center text-base"
                  style={{ backgroundColor: '#1B263B' }}
                >
                  Fazer Login
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 lg:py-12" style={{ backgroundColor: '#1B263B' }}>
          <div className="text-center w-full">
            <img 
              src="/logo-full-horizontal-branco.png" 
              alt="Logo" 
              className="h-20 sm:h-24 lg:h-32 w-auto object-contain mx-auto mb-4 lg:mb-8 max-w-xs sm:max-w-sm"
            />
          </div>
        </div>
      </div>
    )
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
      
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12" style={{ backgroundColor: '#f8fafc' }}>
        <div className="w-full max-w-md">
          
          <div className="mb-6 lg:mb-8 text-center">
            <img 
              src="/logo-brasão-preto.png" 
              alt="Logo" 
              className="h-16 sm:h-20 w-auto object-contain mx-auto mb-4 lg:mb-6"
            />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-roboto font-light text-rich-black-600 tracking-wide leading-tight">
              Nova Senha
            </h1>
            <p className="text-xs sm:text-sm font-roboto font-light text-oxford-blue-600 mt-2">
              Digite sua nova senha
            </p>
          </div>        
          
          <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Nova Senha
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
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-oxford-blue-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent font-roboto font-light text-base"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-oxford-blue-400 hover:text-yinmn-blue-600 transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
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
                    Atualizando...
                  </span>
                ) : (
                  'Atualizar Senha'
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <Link 
                href="/login" 
                className="inline-flex items-center text-sm font-roboto font-medium text-yinmn-blue-600 hover:text-yinmn-blue-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar ao login
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 lg:py-12" style={{ backgroundColor: '#1B263B' }}>
        <div className="text-center w-full">
          <img 
            src="/logo-full-horizontal-branco.png" 
            alt="Logo" 
            className="h-20 sm:h-24 lg:h-32 w-auto object-contain mx-auto mb-4 lg:mb-8 max-w-xs sm:max-w-sm"
          />
        </div>
      </div>
    </div>
  )
}
