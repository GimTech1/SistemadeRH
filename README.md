# RH IM - Sistema de Avaliação de Desempenho

Sistema de RH para avaliação de desempenho baseado na metodologia CHA (Conhecimentos, Habilidades e Atitudes), desenvolvido com Next.js e Supabase.

## Visão Geral

- **Metodologia CHA**: avaliação por Conhecimentos, Habilidades e Atitudes
- **Gestão de Entregas**: sistema completo para registro e acompanhamento de projetos finalizados
- **Papéis**: `admin`, `manager`, `employee`
- **Autenticação**: Supabase Auth com proteção via `middleware`
- **Dashboard**: layout protegido com `Sidebar`, cabeçalho e páginas de gestão
- **API Routes**: CRUD para departamentos, colaboradores, avaliações e entregas
- **UI**: Tailwind CSS, Radix UI, Lucide Icons; feedback com react-hot-toast

## Tecnologias

- Frontend: Next.js 15, React 19, TypeScript
- Estilos: Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth)
- UI: Radix UI, Lucide Icons
- Formulários: React Hook Form + Zod (resolvers)
- Gráficos: Chart.js / Recharts

## Requisitos

- Node.js 18+
- NPM ou Yarn
- Projeto no Supabase (URL e keys)

## Instalação

1. Clone o repositório
```bash
git clone <seu-fork-ou-repo>
cd SistemadeRH-1
```

2. Instale dependências
```bash
npm install
```

3. Configure as variáveis de ambiente em `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=SuaURLDoSupabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=SuaAnonKey
# Opcional, apenas se usar serviços server-to-server
SUPABASE_SERVICE_ROLE_KEY=SuaServiceRoleKey
# URL pública do app (para e-mails/links). Opcional em dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Execute em desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000`.

## Scripts

- `npm run dev`: inicia Next em modo desenvolvimento
- `npm run build`: build de produção
- `npm run start`: inicia servidor de produção (após build)

## Autenticação e Middleware

- O `middleware` usa Supabase SSR para sincronizar cookies e proteger rotas.
- Páginas liberadas: `/login`, `/register`, `/feedback/external` e arquivos estáticos.
- Ao não autenticado acessar áreas protegidas, será redirecionado para `/login`.

## Estrutura de Pastas (resumo)

- `app/(auth)/login` e `app/(auth)/register`: telas públicas de login/cadastro
- `app/(dashboard)/**`: área autenticada com `Sidebar` e cabeçalho
- `app/api/**`: rotas de API (departments, employees, evaluations)
- `lib/supabase/*`: clientes Supabase para browser e server (SSR)
- `components/**`: componentes de layout e UI

## Rotas de API (principais)

### Departamentos
- `GET /api/departments`: lista departamentos
- `POST /api/departments`: cria departamento (requer usuário autenticado e perfil `admin` ou `gerente`)
- `GET /api/departments/:id`: busca departamento por id
- `PUT /api/departments/:id`: atualiza departamento
- `DELETE /api/departments/:id`: remove departamento

### Colaboradores
- `GET /api/employees`: lista colaboradores ativos
- `POST /api/employees`: cria colaborador
- `GET /api/employees/:id`: obtém colaborador por id
- `PUT /api/employees/:id`: atualiza colaborador
- `DELETE /api/employees/:id`: remove colaborador

### Avaliações
- `GET /api/evaluations`: lista avaliações (com joins de ciclo, avaliador e colaborador)
- `POST /api/evaluations`: cria avaliação; aceita `skills` com notas por categoria e calcula médias CHA (overall, conhecimento, habilidade, atitude)

### Entregas
- `GET /api/deliveries`: lista entregas com filtros e paginação
- `POST /api/deliveries`: cria entrega com documentação, treinamento e tags
- `GET /api/deliveries/:id`: obtém entrega específica com todos os dados relacionados
- `PUT /api/deliveries/:id`: atualiza entrega
- `DELETE /api/deliveries/:id`: remove entrega (cascade delete)
- `POST /api/deliveries/upload`: upload de documentos para entrega
- `DELETE /api/deliveries/upload`: remove documento de entrega
- `GET /api/deliveries/download`: gera URL assinada para download de documento

Observação: as rotas utilizam o cliente SSR do Supabase e respeitam as políticas de segurança (RLS) configuradas no banco.

## Sistema de Entregas

O sistema de entregas permite o registro e acompanhamento completo de projetos finalizados:

### Funcionalidades
- **Registro de Entregas**: título, descrição, data, responsável, tipo de projeto, cliente, orçamento
- **Documentação**: upload de arquivos (PDF, Word, Excel, PowerPoint, imagens) com limite de 50MB
- **Treinamento**: registro de pessoas treinadas e data do treinamento
- **Atualizações**: histórico de mudanças com autor e data
- **Tags**: categorização para organização
- **Filtros**: por status, prioridade, tipo de projeto, responsável
- **Visualização**: modo lista e cards
- **Edição**: modificação completa de entregas existentes
- **Exclusão**: remoção com confirmação e cascade delete

### Recursos Técnicos
- **Upload Seguro**: arquivos armazenados no Supabase Storage com URLs assinadas
- **Validação**: tipos de arquivo permitidos e tamanho máximo
- **Deduplicação**: proteção contra criação duplicada de entregas
- **RLS**: políticas de segurança para controle de acesso
- **Responsivo**: interface adaptável para desktop e mobile

## Páginas Principais

- `/login` e `/register`: fluxo de autenticação
- Área autenticada `(dashboard)` com páginas:
  - `/dashboard`: visão geral
  - `/employees`, `/employees/new`, `/employees/[id]`
  - `/departments`, `/departments/[id]`
  - `/evaluations`, `/evaluations/new`, `/evaluations/[id]`, `/evaluations/[id]/edit`
  - `/deliveries`, `/deliveries/[id]`: gestão de entregas de projetos
  - `/feedback`, `/feedback/internal`, `/feedback/external`
  - `/goals`, `/reports`, `/requests`, `/skills`, `/cycles`, `/profile`, `/settings`

## Banco de Dados (Supabase)

- É esperado um schema com tabelas como `profiles`, `departments`, `employees`, `evaluations`, `evaluation_skills`, `cycles` etc.
- **Tabelas de Entregas**: `deliveries`, `delivery_documents`, `delivery_trainings`, `delivery_trained_people`, `delivery_updates`, `delivery_tags`
- **Storage**: Bucket `delivery-documents` para arquivos de documentação
- A tabela `profiles` guarda `role` do usuário. Ao registrar, é criado com `role = 'employee'`. Para promover a `admin`, atualize manualmente no Supabase:
  1. Crie uma conta em `/register`
  2. No Supabase, vá em `public.profiles`
  3. Edite o campo `role` para `admin`

## Variáveis e Deploy

- Para produção (ex.: Vercel): defina as mesmas variáveis do `.env.local` no provedor.
- Garanta que a URL do Supabase e a Anon Key públicas estejam corretas e que as políticas RLS permitam o acesso necessário para o app.

## Utilitários

- `lib/validations.ts`: validação/formatos de CPF, RG e CEP (ViaCEP)
- `lib/utils.ts`: helpers (formatos de data, iniciais, cálculo CHA)

## Tema e UI

- Tailwind configurado em `tailwind.config.ts`
- Fontes: Google Fonts Roboto via `app/layout.tsx`
- Logos/ícones em `public/`

## Roadmap (ideias)

### Sistema Geral
- Exportação/relatórios (PDF)
- Integrações (folha de pagamento, calendário, e-mail)
- Notificações
- Multi-idioma
- Backup

### Sistema de Entregas
- Dashboard de métricas de entregas
- Relatórios de performance por responsável
- Integração com calendário para datas de entrega
- Notificações automáticas de prazos
- Templates de entrega por tipo de projeto
- Aprovação de entregas por gestores
- Comentários e feedback em entregas
- Versionamento de documentos

## Licença

MIT

Desenvolvido por Matheus Moreira
