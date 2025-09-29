# Correção de Políticas RLS para evaluation_cycles

## Problema
Erro 403 (Forbidden) ao tentar criar ciclos de avaliação devido a políticas RLS inadequadas.

## Solução

### 1. Execute no SQL Editor do Supabase:

```sql
-- Habilitar RLS
ALTER TABLE evaluation_cycles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view evaluation cycles" ON evaluation_cycles;
DROP POLICY IF EXISTS "Users can insert evaluation cycles" ON evaluation_cycles;
DROP POLICY IF EXISTS "Users can update evaluation cycles" ON evaluation_cycles;
DROP POLICY IF EXISTS "Users can delete evaluation cycles" ON evaluation_cycles;

-- Política para visualizar ciclos (todos os usuários autenticados)
CREATE POLICY "Users can view evaluation cycles" ON evaluation_cycles
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para inserir ciclos (apenas admin e gerente)
CREATE POLICY "Admin and managers can insert evaluation cycles" ON evaluation_cycles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'gerente')
        )
    );

-- Política para atualizar ciclos (apenas admin e gerente)
CREATE POLICY "Admin and managers can update evaluation cycles" ON evaluation_cycles
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'gerente')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'gerente')
        )
    );

-- Política para deletar ciclos (apenas admin)
CREATE POLICY "Only admin can delete evaluation cycles" ON evaluation_cycles
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
```

### 2. Verificar se funcionou:

```sql
-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'evaluation_cycles';
```

### 3. Teste manual:

```sql
-- Teste de inserção (execute como admin/gerente)
INSERT INTO evaluation_cycles (name, description, start_date, end_date, is_active, created_by)
VALUES ('Teste', 'Ciclo de teste', '2024-01-01', '2024-12-31', true, auth.uid());
```

## Alternativa Temporária (se necessário)

Se as políticas não funcionarem imediatamente, você pode temporariamente desabilitar RLS:

```sql
-- ATENÇÃO: Apenas para teste - NÃO use em produção
ALTER TABLE evaluation_cycles DISABLE ROW LEVEL SECURITY;
```

**Lembre-se de reabilitar RLS após o teste e configurar as políticas corretamente.**
