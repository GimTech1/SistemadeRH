'use client'

import { Save, Shield, Bell, User, Database } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-roboto font-medium text-rich-black-900 tracking-tight">Configurações</h1>
          <p className="text-sm font-roboto font-light text-oxford-blue-600 mt-1">Ajuste preferências do sistema e definições da conta</p>
        </div>
        <div>
          <button
            className="px-6 py-3 bg-yinmn-blue-600 hover:bg-yinmn-blue-700 text-white rounded-xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md inline-flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Salvar alterações
          </button>
        </div>
      </div>

      {/* Seções */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Conta */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-platinum-200">
          <div className="p-6 border-b border-platinum-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-[#778DA9]" />
              </div>
              <div>
                <h3 className="text-lg font-roboto font-medium text-rich-black-900">Conta</h3>
                <p className="text-sm font-roboto font-light text-oxford-blue-500">Informações básicas do usuário</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">Nome completo</label>
                <input className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-xl text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent font-roboto" placeholder="Seu nome" />
              </div>
              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">Cargo</label>
                <input className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-xl text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent font-roboto" placeholder="Seu cargo" />
              </div>
            </div>
          </div>
        </div>

        {/* Segurança */}
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200">
          <div className="p-6 border-b border-platinum-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#778DA9]" />
              </div>
              <div>
                <h3 className="text-lg font-roboto font-medium text-rich-black-900">Segurança</h3>
                <p className="text-sm font-roboto font-light text-oxford-blue-500">Controle de acesso e proteção</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-roboto font-medium text-rich-black-900">Autenticação em duas etapas</p>
                <p className="text-xs font-roboto font-light text-oxford-blue-500">Recomendado para administradores</p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-platinum-300 peer-focus:outline-none rounded-full peer peer-checked:bg-yinmn-blue-600 transition-colors relative">
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5" />
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Notificações e Dados */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200">
          <div className="p-6 border-b border-platinum-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#778DA9]" />
              </div>
              <div>
                <h3 className="text-lg font-roboto font-medium text-rich-black-900">Notificações</h3>
                <p className="text-sm font-roboto font-light text-oxford-blue-500">Preferências de alerta</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-roboto font-medium text-rich-black-900">Emails de atividades</span>
              <input type="checkbox" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-roboto font-medium text-rich-black-900">Push do navegador</span>
              <input type="checkbox" />
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-platinum-200">
          <div className="p-6 border-b border-platinum-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
                <Database className="w-5 h-5 text-[#778DA9]" />
              </div>
              <div>
                <h3 className="text-lg font-roboto font-medium text-rich-black-900">Dados</h3>
                <p className="text-sm font-roboto font-light text-oxford-blue-500">Exportações e backups</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-roboto font-medium text-rich-black-900">Exportar dados</span>
              <button className="px-4 py-2 bg-white border border-platinum-300 rounded-lg text-sm font-roboto hover:bg-platinum-50 transition-colors">Baixar CSV</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-roboto font-medium text-rich-black-900">Backup</span>
              <button className="px-4 py-2 bg-white border border-platinum-300 rounded-lg text-sm font-roboto hover:bg-platinum-50 transition-colors">Criar backup</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


