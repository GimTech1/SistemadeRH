'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, User, Lock, Mail, Building, Eye, EyeOff } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import type { Database } from '@/lib/supabase/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    position: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase: SupabaseClient<Database> = createClient()
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }
    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }
    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            position: formData.position,
          }
        }
      })
      if (authError) {
        toast.error('Erro ao criar conta: ' + authError.message)
        return
      }
      if (authData.user) {
        type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
        const newProfile: ProfileInsert = {
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
          position: formData.position,
          role: 'employee',
        }
        const { error: profileError } = await (supabase.from('profiles') as any)
          .insert([newProfile])
        if (profileError) {
        }
        toast.success('Conta criada com sucesso! Verifique seu email.')
        router.push('/login')
      }
    } catch (error) {
      toast.error('Erro inesperado ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
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
              Criar Conta
            </h1>
            <p className="text-xs sm:text-sm font-roboto font-light text-oxford-blue-600 mt-2">
              Preencha os dados para criar sua conta
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 sm:p-8">
            <form onSubmit={handleRegister} className="space-y-5 lg:space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-oxford-blue-400" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent font-roboto font-light text-base"
                    placeholder="João Silva"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-oxford-blue-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent font-roboto font-light text-base"
                    placeholder="seu@email.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* <div>
                <label htmlFor="position" className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Cargo
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-oxford-blue-400" />
                  <input
                    id="position"
                    name="position"
                    type="text"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent font-roboto font-light text-base"
                    placeholder="Analista de RH"
                    required
                    disabled={loading}
                  />
                </div>
              </div> */}
              
              <div>
                <label htmlFor="password" className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-oxford-blue-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
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
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-oxford-blue-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
                    Criando conta...
                  </span>
                ) : (
                  'Criar Conta'
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <span className="text-sm font-roboto font-light text-oxford-blue-600">
                Já tem uma conta?{' '}
                <Link href="/login" className="font-roboto font-medium text-yinmn-blue-600 hover:text-yinmn-blue-700 transition-colors">
                  Fazer login
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
          </div>
        </div>
      </div>
    </div>
  )
}