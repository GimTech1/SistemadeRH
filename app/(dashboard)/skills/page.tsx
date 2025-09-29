'use client'

import Link from 'next/link'
import { Award, Plus, Search, Users, Settings, ChevronRight } from 'lucide-react'

export default function SkillsPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-roboto font-medium text-rich-black-900 tracking-tight">Habilidades CHA</h1>
          <p className="text-sm font-roboto font-light text-oxford-blue-600 mt-1">Cadastre e organize habilidades de Conhecimentos, Habilidades e Atitudes</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="text-white px-5 py-3 rounded-xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            style={{ backgroundColor: '#1B263B' }}
          >
            <Plus className="h-4 w-4" />
            Nova Habilidade
          </button>
        </div>
      </div>

      {/* Filtros e busca */}
      <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-oxford-blue-400" />
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 bg-white border border-platinum-300 rounded-lg text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                placeholder="Buscar por nome, tipo ou descrição..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de habilidades (estado inicial) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-[#778DA9]" />
                </div>
                <div>
                  <h3 className="font-roboto font-medium text-rich-black-900">Habilidade Exemplo {i}</h3>
                  <p className="text-xs font-roboto font-medium text-oxford-blue-500 uppercase tracking-wider">Conhecimento</p>
                </div>
              </div>
              <Link href="#">
                <button className="h-8 w-8 rounded-full bg-gradient-to-br from-platinum-100 to-platinum-200 border border-platinum-200 flex items-center justify-center text-oxford-blue-600 hover:text-yinmn-blue-600 hover:from-yinmn-blue-50 hover:to-yinmn-blue-100 hover:border-yinmn-blue-200 transition-all duration-300">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
            <p className="text-sm font-roboto font-light text-oxford-blue-600 leading-relaxed">
              Descrição breve da habilidade exemplo. Use esta página para gerenciar o catálogo de habilidades.
            </p>
          </div>
        ))}
      </div>

      {/* Empty state alternativo (comente o grid acima e use este bloco quando não houver dados) */}
      {/*
      <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-16 text-center">
        <div className="h-20 w-20 bg-gradient-to-br from-platinum-100 to-platinum-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
          <Award className="h-10 w-10 text-oxford-blue-400" />
        </div>
        <h3 className="text-xl font-roboto font-light text-rich-black-900 mb-4 tracking-wide">Nenhuma habilidade cadastrada</h3>
        <p className="text-sm text-oxford-blue-600 font-roboto font-light tracking-wide leading-relaxed max-w-md mx-auto">
          Clique em "Nova Habilidade" para começar a montar sua biblioteca de CHA
        </p>
      </div>
      */}
    </div>
  )
}


