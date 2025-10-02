'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://rh.investmoneysa.com.br/reset-password',
      })
      
      if (error) {
        toast.error(error.message)
        return
      }
      
      setEmailSent(true)
      toast.success('E-mail de recuperação enviado!')
    } catch (error) {
      toast.error('Erro ao enviar e-mail de recuperação')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
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
                E-mail Enviado
              </h1>
            </div>        
            
            <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 sm:p-8 text-center">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-roboto font-medium text-rich-black-900 mb-2">
                  Verifique seu e-mail
                </h2>
                <p className="text-sm font-roboto font-light text-oxford-blue-600">
                  Enviamos um link de recuperação para <strong>{email}</strong>
                </p>
              </div>
              
              <div className="space-y-4">
                <p className="text-xs sm:text-sm font-roboto font-light text-oxford-blue-600">
                  • Verifique sua caixa de entrada<br/>
                  • Se não encontrar, verifique a pasta de spam<br/>
                  • O link expira em 1 hora
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setEmailSent(false)
                      setEmail('')
                    }}
                    className="flex-1 text-oxford-blue-600 px-4 py-2 rounded-lg font-roboto font-medium transition-colors hover:bg-oxford-blue-50"
                  >
                    Enviar novamente
                  </button>
                  
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
              Recuperar Senha
            </h1>
            <p className="text-xs sm:text-sm font-roboto font-light text-oxford-blue-600 mt-2">
              Digite seu e-mail para receber um link de recuperação
            </p>
          </div>        
          
          <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  E-mail
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
              
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center text-base"
                style={{ backgroundColor: '#1B263B' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Enviando...
                  </span>
                ) : (
                  'Enviar Link de Recuperação'
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
