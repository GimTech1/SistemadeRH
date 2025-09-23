# RH Performance - Sistema de Avaliação de Desempenho

Sistema completo de RH para avaliação de desempenho baseado na metodologia CHA (Conhecimentos, Habilidades e Atitudes), desenvolvido com Next.js, React e Supabase.

## Características Principais

- **Avaliação CHA Completa**: Sistema de avaliação baseado em Conhecimentos, Habilidades e Atitudes
- **Múltiplos Níveis de Acesso**: Admin, Manager e Employee com permissões específicas
- **Feedback Externo**: Coleta de avaliações de clientes, fornecedores e colegas
- **Dashboard Interativo**: Visualização de métricas e tendências de desempenho
- **Design Responsivo**: Interface otimizada para desktop e mobile
- **Tema Dark Azul**: Interface moderna e elegante com tema escuro

## Funcionalidades

### Para Administradores
- Gerenciar todos os colaboradores e departamentos
- Criar e configurar ciclos de avaliação
- Visualizar relatórios completos de desempenho
- Configurar habilidades CHA por departamento
- Acessar todas as avaliações e feedbacks

### Para Gestores
- Avaliar membros da equipe
- Acompanhar metas e objetivos
- Visualizar dashboards de desempenho da equipe
- Solicitar feedback externo
- Gerar relatórios de desempenho

### Para Colaboradores
- Visualizar próprias avaliações
- Acompanhar metas pessoais
- Receber e visualizar feedbacks
- Acessar histórico de desempenho

## Tecnologias Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Estilização**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth)
- **UI Components**: Radix UI, Lucide Icons
- **Formulários**: React Hook Form + Zod
- **Gráficos**: Recharts

## Instalação

### Pré-requisitos

- Node.js 18+ 
- NPM ou Yarn
- Conta no Supabase

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/rh-performance.git
cd rh-performance
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Supabase**

   a. Crie um novo projeto no [Supabase](https://supabase.com)
   
   b. Execute o schema SQL no editor SQL do Supabase:
   ```sql
   -- Copie e execute o conteúdo do arquivo supabase/schema.sql
   ```

4. **Configure as variáveis de ambiente**

   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Execute o projeto**
```bash
npm run dev
```

Acesse http://localhost:3000

## Configuração Inicial

### Criando o Primeiro Usuário Admin

1. Acesse `/register` para criar uma conta
2. No Supabase Dashboard, vá para a tabela `profiles`
3. Edite o usuário criado e altere o campo `role` para `admin`

### Estrutura de Permissões

- **Admin**: Acesso total ao sistema
- **Manager**: Gerencia equipes e avaliações
- **Employee**: Acesso às próprias informações

## Responsividade

O sistema é totalmente responsivo e otimizado para:
- Desktop (1920x1080 e superiores)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## Personalização

### Cores do Tema

As cores podem ser personalizadas em `tailwind.config.ts`:
- Primary: Tons de azul
- Dark: Tons de cinza escuro
- Accent: Cores de destaque

## Metodologia CHA

### Conhecimentos
- Conhecimento Técnico
- Conhecimento do Negócio
- Conhecimento Regulatório

### Habilidades
- Comunicação
- Resolução de Problemas
- Gestão do Tempo

### Atitudes
- Proatividade
- Trabalho em Equipe
- Comprometimento

## Deploy

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Conecte o repositório no Vercel
3. Configure as variáveis de ambiente
4. Deploy automático

### Outras Plataformas

O projeto pode ser deployado em qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## Licença

Este projeto está sob licença MIT.

## Suporte

Para suporte, envie um email para suporte@rhperformance.com

## Atualizações Futuras

- [ ] Integração com sistemas de folha de pagamento
- [ ] App mobile nativo
- [ ] Relatórios em PDF
- [ ] Integração com calendário
- [ ] Notificações por email
- [ ] Multi-idioma
- [ ] Backup automático

---

Desenvolvido para otimizar a gestão de pessoas