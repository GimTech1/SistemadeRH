-- Script para configurar o Supabase Storage para documentos de funcionários
-- Execute este script no Supabase SQL Editor

-- 1. Criar bucket para documentos de funcionários
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-documents', 'employee-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Criar política para permitir upload de arquivos
CREATE POLICY "Permitir upload de documentos de funcionários" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'employee-documents');

-- 3. Criar política para permitir visualização de arquivos
CREATE POLICY "Permitir visualização de documentos de funcionários" ON storage.objects
FOR SELECT USING (bucket_id = 'employee-documents');

-- 4. Criar política para permitir atualização de arquivos
CREATE POLICY "Permitir atualização de documentos de funcionários" ON storage.objects
FOR UPDATE USING (bucket_id = 'employee-documents');

-- 5. Criar política para permitir exclusão de arquivos
CREATE POLICY "Permitir exclusão de documentos de funcionários" ON storage.objects
FOR DELETE USING (bucket_id = 'employee-documents');

-- 6. Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE id = 'employee-documents';
