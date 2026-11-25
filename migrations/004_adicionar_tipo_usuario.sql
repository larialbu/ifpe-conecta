-- ==============================================================================
-- 📌 Migração 004: Adicionar tipo de usuário (admin e usuario)
-- ==============================================================================
-- O admin tem permissão para acessar tanto o sistema principal quanto o /admin,
-- enquanto o usuário normal (discente) acessa apenas o sistema principal.
-- ==============================================================================

-- 1. Adicionar coluna 'tipo' com valor padrão 'usuario'
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'usuario';

-- 2. Garantir que registros existentes tenham valor 'usuario' caso estejam NULL
UPDATE public.usuarios 
SET tipo = 'usuario' 
WHERE tipo IS NULL;

-- 3. Adicionar constraint para validar apenas 'usuario' ou 'admin'
ALTER TABLE public.usuarios 
DROP CONSTRAINT IF EXISTS check_tipo_usuario;

ALTER TABLE public.usuarios 
ADD CONSTRAINT check_tipo_usuario 
CHECK (tipo IN ('usuario', 'admin'));

-- 4. Definir e-mails administrativos oficiais como 'admin'
UPDATE public.usuarios 
SET tipo = 'admin' 
WHERE email ILIKE 'admin@ifpe.edu.br';

