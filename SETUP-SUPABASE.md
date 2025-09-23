# 🚀 Configuração do Supabase - Passo a Passo

## 1️⃣ Criar Conta no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em "Start your project" (é grátis!)
3. Faça login com GitHub ou crie uma conta

## 2️⃣ Criar Novo Projeto

1. Clique em "New Project"
2. Preencha:
   - **Project name**: `rh-performance` (ou outro nome)
   - **Database Password**: Crie uma senha forte (guarde ela!)
   - **Region**: Escolha a mais próxima (São Paulo - Brazil)
3. Clique em "Create new project"
4. Aguarde alguns minutos para o projeto ser criado

## 3️⃣ Configurar o Banco de Dados

1. No menu lateral, clique em **SQL Editor**
2. Clique em **New query**
3. Copie TODO o conteúdo do arquivo `supabase/schema.sql`
4. Cole no editor SQL
5. Clique em **Run** (ou pressione Ctrl+Enter)
6. Aguarde a mensagem "Success. No rows returned"

## 4️⃣ Obter as Credenciais

1. No menu lateral, clique em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Você verá duas informações importantes:
   - **Project URL**: algo como `https://xyzcompany.supabase.co`
   - **anon public**: uma chave longa começando com `eyJ...`

## 5️⃣ Configurar o Arquivo .env.local

1. No projeto, edite o arquivo `.env.local` (se não existir, crie ele)
2. Substitua os valores placeholder:

```env
NEXT_PUBLIC_SUPABASE_URL=cole_aqui_seu_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=cole_aqui_sua_anon_key
```

Exemplo:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 6️⃣ Reiniciar o Servidor

1. Pare o servidor (Ctrl+C no terminal)
2. Execute novamente:
```bash
npm run dev
```

## 7️⃣ Criar Primeiro Usuário Admin

1. Acesse http://localhost:3000
2. Clique em "Cadastre-se"
3. Crie sua conta
4. Volte ao Supabase Dashboard
5. No menu lateral, clique em **Table Editor**
6. Selecione a tabela `profiles`
7. Encontre seu usuário
8. Clique no ícone de edição (lápis)
9. Mude o campo `role` de `employee` para `admin`
10. Clique em **Save**

## ✅ Pronto!

Agora você pode fazer login com suas credenciais e terá acesso total ao sistema como administrador!

## 🆘 Problemas Comuns

### "Invalid API Key"
- Verifique se copiou a chave correta (anon/public)
- Certifique-se de que não há espaços extras

### "Database error"
- Verifique se executou o schema.sql completo
- Tente executar novamente o SQL

### "Authentication failed"
- Verifique se habilitou a autenticação por email no Supabase
- Dashboard → Authentication → Providers → Email deve estar ativado

## 📧 Configurar Email (Opcional)

Para receber emails de confirmação:
1. Supabase Dashboard → Authentication → Email Templates
2. Configure os templates conforme necessário
3. Em produção, configure um serviço SMTP próprio






