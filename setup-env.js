// Script para criar o arquivo .env.local
const fs = require('fs');
const path = require('path');

const envContent = `# IMPORTANTE: Substitua estes valores pelos seus dados do Supabase
# Você pode encontrá-los em: https://supabase.com/dashboard/project/_/settings/api

# Valores temporários para desenvolvimento local
# VOCÊ PRECISA substituir por suas credenciais reais do Supabase!
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key
SUPABASE_SERVICE_ROLE_KEY=placeholder-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env.local criado com sucesso!');
  console.log('⚠️  IMPORTANTE: Substitua os valores placeholder pelas suas credenciais do Supabase');
  console.log('📌 Acesse: https://supabase.com/dashboard/project/_/settings/api');
} else {
  console.log('ℹ️  Arquivo .env.local já existe');
}






