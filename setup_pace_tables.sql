-- Script SQL para criar as tabelas necessárias para o sistema PACE Check-in Diário
-- Execute este script no Supabase SQL Editor

-- Tabela para perguntas diárias por departamento
CREATE TABLE IF NOT EXISTS daily_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para respostas diárias dos funcionários
CREATE TABLE IF NOT EXISTS daily_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID NOT NULL REFERENCES daily_questions(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    response TEXT NOT NULL,
    response_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(question_id, employee_id, response_date)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_daily_questions_department ON daily_questions(department_id);
CREATE INDEX IF NOT EXISTS idx_daily_questions_active ON daily_questions(is_active);
CREATE INDEX IF NOT EXISTS idx_daily_responses_question ON daily_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_daily_responses_employee ON daily_responses(employee_id);
CREATE INDEX IF NOT EXISTS idx_daily_responses_date ON daily_responses(response_date);

-- RLS (Row Level Security) policies
ALTER TABLE daily_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_responses ENABLE ROW LEVEL SECURITY;

-- Política para daily_questions: Admins e managers podem ver todas, funcionários só do seu departamento
CREATE POLICY "daily_questions_select_policy" ON daily_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (
                p.role IN ('admin','gerente')
                OR (p.department_id IS NOT NULL AND p.department_id = daily_questions.department_id)
            )
        )
    );

-- Política para daily_questions: Apenas admins e managers podem inserir/atualizar/deletar
CREATE POLICY "daily_questions_modify_policy" ON daily_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.role = 'admin' OR p.role = 'gerente')
        )
    );

-- Política para daily_responses: Usuários podem ver suas próprias respostas
CREATE POLICY "daily_responses_select_policy" ON daily_responses
    FOR SELECT USING (
        employee_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.role = 'admin' OR p.role = 'gerente')
        )
    );

-- Política para daily_responses: Usuários podem inserir/atualizar suas próprias respostas
CREATE POLICY "daily_responses_modify_policy" ON daily_responses
    FOR ALL USING (
        employee_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.role = 'admin' OR p.role = 'gerente')
        )
    );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela daily_questions
CREATE TRIGGER update_daily_questions_updated_at 
    BEFORE UPDATE ON daily_questions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir algumas perguntas de exemplo (opcional - descomente se quiser dados de teste)
/*
INSERT INTO daily_questions (department_id, question) VALUES
('b127dd11-4b56-4d1f-9999-fa9341034b0e', 'Como você está se sentindo hoje?'),
('e2d60485-fdfa-4230-ba1f-c1a786eeb5c5', 'Qual foi seu principal foco hoje?'),
('ee060d02-a0a4-44a1-9dc5-6d1a8c0fee02', 'Houve algum desafio que enfrentou hoje?');
*/
