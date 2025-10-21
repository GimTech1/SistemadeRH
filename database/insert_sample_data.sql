-- Script para inserir dados de exemplo no banco de dados
-- Execute este script no Supabase SQL Editor ou em um cliente PostgreSQL

-- Inserir entregas de exemplo
INSERT INTO public.deliveries (
  id, title, description, delivery_date, status, responsible, 
  project_type, client, budget, priority, created_by, created_at, updated_at
) VALUES 
(
  gen_random_uuid(),
  'Sistema de Gestão de RH',
  'Desenvolvimento completo de sistema de recursos humanos com módulos de folha de pagamento, avaliações e relatórios.',
  '2024-01-15',
  'completed',
  'João Silva',
  'Software',
  'TechCorp Ltda',
  150000.00,
  'high',
  (SELECT id FROM auth.users LIMIT 1),
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'E-commerce Mobile App',
  'Aplicativo mobile para e-commerce com funcionalidades de compra, pagamento e gestão de pedidos.',
  '2024-02-20',
  'in_progress',
  'Maria Santos',
  'Mobile',
  'ShopTech Inc',
  200000.00,
  'medium',
  (SELECT id FROM auth.users LIMIT 1),
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Portal de Vendas B2B',
  'Portal web para vendas B2B com catálogo de produtos, cotações e gestão de clientes corporativos.',
  '2024-03-10',
  'pending',
  'Carlos Oliveira',
  'Web',
  'Business Solutions',
  120000.00,
  'low',
  (SELECT id FROM auth.users LIMIT 1),
  NOW(),
  NOW()
);

-- Inserir documentos de exemplo
INSERT INTO public.delivery_documents (
  id, delivery_id, filename, file_path, file_size, mime_type, uploaded_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM public.deliveries WHERE title = 'Sistema de Gestão de RH' LIMIT 1),
  'Manual do Usuário.pdf',
  '/documents/manual_usuario.pdf',
  2048576,
  'application/pdf',
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM public.deliveries WHERE title = 'Sistema de Gestão de RH' LIMIT 1),
  'Documentação Técnica.docx',
  '/documents/doc_tecnica.docx',
  1536000,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  NOW()
);

-- Inserir treinamentos de exemplo
INSERT INTO public.delivery_trainings (
  id, delivery_id, provided, training_date, notes
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM public.deliveries WHERE title = 'Sistema de Gestão de RH' LIMIT 1),
  true,
  '2024-01-20',
  'Treinamento presencial realizado com a equipe de RH da empresa.'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.deliveries WHERE title = 'E-commerce Mobile App' LIMIT 1),
  false,
  NULL,
  'Treinamento será realizado após conclusão do desenvolvimento.'
);

-- Inserir pessoas treinadas
INSERT INTO public.delivery_trained_people (
  id, training_id, person_name, person_email, department, position
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM public.delivery_trainings WHERE provided = true LIMIT 1),
  'Ana Costa',
  'ana.costa@techcorp.com',
  'Recursos Humanos',
  'Gerente de RH'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.delivery_trainings WHERE provided = true LIMIT 1),
  'Pedro Lima',
  'pedro.lima@techcorp.com',
  'Recursos Humanos',
  'Analista de RH'
);

-- Inserir atualizações de exemplo
INSERT INTO public.delivery_updates (
  id, delivery_id, description, author, update_date, created_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM public.deliveries WHERE title = 'Sistema de Gestão de RH' LIMIT 1),
  'Sistema entregue com sucesso. Todos os módulos funcionando conforme especificado.',
  'João Silva',
  '2024-01-15',
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM public.deliveries WHERE title = 'E-commerce Mobile App' LIMIT 1),
  'Desenvolvimento em andamento. Interface do usuário 80% concluída.',
  'Maria Santos',
  '2024-02-10',
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM public.deliveries WHERE title = 'E-commerce Mobile App' LIMIT 1),
  'Integração com gateway de pagamento implementada com sucesso.',
  'Maria Santos',
  '2024-02-15',
  NOW()
);

-- Inserir tags de exemplo
INSERT INTO public.delivery_tags (
  id, delivery_id, tag_name, color
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM public.deliveries WHERE title = 'Sistema de Gestão de RH' LIMIT 1),
  'Sistema Interno',
  '#3B82F6'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.deliveries WHERE title = 'Sistema de Gestão de RH' LIMIT 1),
  'Alta Prioridade',
  '#EF4444'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.deliveries WHERE title = 'E-commerce Mobile App' LIMIT 1),
  'Mobile',
  '#10B981'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.deliveries WHERE title = 'E-commerce Mobile App' LIMIT 1),
  'E-commerce',
  '#8B5CF6'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.deliveries WHERE title = 'Portal de Vendas B2B' LIMIT 1),
  'B2B',
  '#F59E0B'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.deliveries WHERE title = 'Portal de Vendas B2B' LIMIT 1),
  'Portal Web',
  '#06B6D4'
);

-- Verificar se os dados foram inseridos
SELECT 
  d.title,
  d.status,
  d.responsible,
  d.budget,
  COUNT(dd.id) as documentos,
  COUNT(dt.id) as treinamentos,
  COUNT(du.id) as atualizacoes,
  COUNT(dtag.id) as tags
FROM public.deliveries d
LEFT JOIN public.delivery_documents dd ON d.id = dd.delivery_id
LEFT JOIN public.delivery_trainings dt ON d.id = dt.delivery_id
LEFT JOIN public.delivery_updates du ON d.id = du.delivery_id
LEFT JOIN public.delivery_tags dtag ON d.id = dtag.delivery_id
GROUP BY d.id, d.title, d.status, d.responsible, d.budget
ORDER BY d.created_at DESC;
