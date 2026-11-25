-- ==============================================================================
-- 📌 Migration 003: Atualização de Cursos para o Novo Padrão Oficial
-- ==============================================================================
-- Cursos Oficiais IFPE Campus Olinda:
-- 1. Artes Visuais
-- 2. Computação Gráfica Integrado
-- 3. Computação Gráfica Subsequente
-- 4. Produção em Multimídia
-- ==============================================================================

-- 1. Atualizar usuários com nomenclaturas antigas
UPDATE public.usuarios 
SET curso = 'Computação Gráfica Integrado' 
WHERE curso = 'Computação Gráfica';

UPDATE public.usuarios 
SET curso = 'Computação Gráfica Subsequente' 
WHERE curso = 'Técnico em Computação Gráfica';

-- 2. Normalizar qualquer curso diferente dos 4 oficiais para o padrão
UPDATE public.usuarios 
SET curso = 'Computação Gráfica Integrado' 
WHERE curso NOT IN ('Artes Visuais', 'Computação Gráfica Integrado', 'Computação Gráfica Subsequente', 'Produção em Multimídia');

-- 3. Atualizar contas de demonstração padrão
UPDATE public.usuarios 
SET curso = 'Computação Gráfica Integrado' 
WHERE email = 'mariana.silva@discente.ifpe.edu.br';

UPDATE public.usuarios 
SET curso = 'Computação Gráfica Subsequente' 
WHERE email = 'lucas.albuquerque@discente.ifpe.edu.br';

UPDATE public.usuarios 
SET curso = 'Artes Visuais' 
WHERE email = 'camila.duarte@discente.ifpe.edu.br';

-- 4. Criar ou renovar a restrição no banco para os 4 cursos oficiais
ALTER TABLE public.usuarios 
DROP CONSTRAINT IF EXISTS check_cursos_ifpe_olinda;

ALTER TABLE public.usuarios 
ADD CONSTRAINT check_cursos_ifpe_olinda 
CHECK (curso IN ('Artes Visuais', 'Computação Gráfica Integrado', 'Computação Gráfica Subsequente', 'Produção em Multimídia'));

