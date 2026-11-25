-- ==============================================================================
-- 📌 IFPE Chega Junto - Atualização dos Cursos no Banco de Dados (Supabase)
-- ==============================================================================
-- Cursos oficiais permitidos:
-- 1. Artes Visuais
-- 2. Computação Gráfica Integrado
-- 3. Computação Gráfica Subsequente
-- 4. Produção em Multimídia
-- ==============================================================================

-- 1. Atualizar cursos dos usuários de demonstração
UPDATE public.usuarios 
SET curso = 'Computação Gráfica Integrado' 
WHERE email = 'mariana.silva@discente.ifpe.edu.br';

UPDATE public.usuarios 
SET curso = 'Computação Gráfica Subsequente' 
WHERE email = 'lucas.albuquerque@discente.ifpe.edu.br';

UPDATE public.usuarios 
SET curso = 'Artes Visuais' 
WHERE email = 'camila.duarte@discente.ifpe.edu.br';

-- 2. Atualizar qualquer usuário que ainda possua curso antigo / incorreto
UPDATE public.usuarios 
SET curso = 'Computação Gráfica Integrado' 
WHERE curso = 'Computação Gráfica';

UPDATE public.usuarios 
SET curso = 'Computação Gráfica Subsequente' 
WHERE curso = 'Técnico em Computação Gráfica';

UPDATE public.usuarios 
SET curso = 'Computação Gráfica Integrado' 
WHERE curso NOT IN ('Artes Visuais', 'Computação Gráfica Integrado', 'Computação Gráfica Subsequente', 'Produção em Multimídia');

-- 3. (Opcional) Adicionar constraint de validação para garantir apenas esses 4 cursos no banco
ALTER TABLE public.usuarios 
DROP CONSTRAINT IF EXISTS check_cursos_ifpe_olinda;

ALTER TABLE public.usuarios 
ADD CONSTRAINT check_cursos_ifpe_olinda 
CHECK (curso IN ('Artes Visuais', 'Computação Gráfica Integrado', 'Computação Gráfica Subsequente', 'Produção em Multimídia'));
