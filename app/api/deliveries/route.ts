import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Dados mockados para demonstração
const mockDeliveries = [
  {
    id: '1',
    title: 'Sistema de Gestão de RH - Fase 1',
    description: 'Implementação do módulo de colaboradores com funcionalidades de cadastro, edição e visualização de perfis.',
    deliveryDate: '2024-01-15',
    status: 'completed',
    responsible: 'João Silva',
    documentation: [
      'Manual do Usuário - Módulo Colaboradores.pdf',
      'Documentação Técnica - API.pdf',
      'Guia de Instalação.pdf'
    ],
    training: {
      provided: true,
      trainedPeople: ['Maria Santos', 'Pedro Costa', 'Ana Oliveira'],
      trainingDate: '2024-01-20'
    },
    updates: [
      {
        date: '2024-01-10',
        description: 'Finalização da implementação do módulo de colaboradores',
        author: 'João Silva'
      },
      {
        date: '2024-01-12',
        description: 'Testes de integração concluídos com sucesso',
        author: 'João Silva'
      }
    ],
    tags: ['RH', 'Sistema', 'Colaboradores'],
    priority: 'high',
    projectType: 'Desenvolvimento',
    client: 'InvestMoney',
    budget: 50000,
    createdAt: '2023-12-01'
  },
  {
    id: '2',
    title: 'Relatório de Performance - Dashboard',
    description: 'Criação de dashboard interativo para visualização de métricas de performance dos colaboradores.',
    deliveryDate: '2024-02-28',
    status: 'in_progress',
    responsible: 'Maria Santos',
    documentation: [
      'Especificação de Requisitos.pdf',
      'Mockups do Dashboard.pdf'
    ],
    training: {
      provided: false,
      trainedPeople: [],
    },
    updates: [
      {
        date: '2024-01-25',
        description: 'Início do desenvolvimento do dashboard',
        author: 'Maria Santos'
      },
      {
        date: '2024-02-01',
        description: 'Implementação dos gráficos principais concluída',
        author: 'Maria Santos'
      }
    ],
    tags: ['Dashboard', 'Relatórios', 'Performance'],
    priority: 'medium',
    projectType: 'Desenvolvimento',
    client: 'InvestMoney',
    budget: 30000,
    createdAt: '2024-01-15'
  },
  {
    id: '3',
    title: 'Migração de Dados - Sistema Legado',
    description: 'Migração de dados do sistema antigo para o novo sistema de RH.',
    deliveryDate: '2024-03-15',
    status: 'pending',
    responsible: 'Pedro Costa',
    documentation: [
      'Plano de Migração.pdf',
      'Scripts de Migração.sql'
    ],
    training: {
      provided: false,
      trainedPeople: [],
    },
    updates: [
      {
        date: '2024-01-30',
        description: 'Análise dos dados do sistema legado iniciada',
        author: 'Pedro Costa'
      }
    ],
    tags: ['Migração', 'Dados', 'Sistema Legado'],
    priority: 'high',
    projectType: 'Migração',
    client: 'InvestMoney',
    budget: 25000,
    createdAt: '2024-01-20'
  },
  {
    id: '4',
    title: 'Integração com Folha de Pagamento',
    description: 'Desenvolvimento de integração entre o sistema de RH e o sistema de folha de pagamento.',
    deliveryDate: '2024-04-30',
    status: 'pending',
    responsible: 'Ana Oliveira',
    documentation: [
      'Especificação da Integração.pdf',
      'Documentação da API Externa.pdf'
    ],
    training: {
      provided: false,
      trainedPeople: [],
    },
    updates: [],
    tags: ['Integração', 'Folha de Pagamento', 'API'],
    priority: 'medium',
    projectType: 'Integração',
    client: 'InvestMoney',
    budget: 40000,
    createdAt: '2024-02-01'
  },
  {
    id: '5',
    title: 'Sistema de Avaliações 360°',
    description: 'Implementação de sistema completo de avaliações 360 graus com feedback multidirecional.',
    deliveryDate: '2024-01-30',
    status: 'completed',
    responsible: 'Carlos Mendes',
    documentation: [
      'Manual do Avaliador.pdf',
      'Manual do Avaliado.pdf',
      'Relatório de Configuração.pdf'
    ],
    training: {
      provided: true,
      trainedPeople: ['Todos os Gerentes', 'Equipe de RH'],
      trainingDate: '2024-02-05'
    },
    updates: [
      {
        date: '2024-01-25',
        description: 'Sistema de avaliações 360° implementado e testado',
        author: 'Carlos Mendes'
      },
      {
        date: '2024-01-28',
        description: 'Treinamento realizado para todos os gerentes',
        author: 'Carlos Mendes'
      }
    ],
    tags: ['Avaliações', '360°', 'Feedback'],
    priority: 'high',
    projectType: 'Desenvolvimento',
    client: 'InvestMoney',
    budget: 60000,
    createdAt: '2023-11-15'
  }
]

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Por enquanto, retornar dados mockados
    // Em uma implementação real, você buscaria os dados do banco de dados
    return NextResponse.json({
      deliveries: mockDeliveries,
      total: mockDeliveries.length
    })

  } catch (error) {
    console.error('Erro ao buscar entregas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validação básica dos dados
    const requiredFields = ['title', 'description', 'deliveryDate', 'responsible', 'projectType']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Campo obrigatório: ${field}` },
          { status: 400 }
        )
      }
    }

    // Em uma implementação real, você salvaria no banco de dados
    const newDelivery = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      status: body.status || 'pending',
      priority: body.priority || 'medium',
      documentation: body.documentation || [],
      training: body.training || { provided: false, trainedPeople: [] },
      updates: body.updates || [],
      tags: body.tags || []
    }

    // Simular adição aos dados mockados
    mockDeliveries.push(newDelivery)

    return NextResponse.json({
      delivery: newDelivery,
      message: 'Entrega criada com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar entrega:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
