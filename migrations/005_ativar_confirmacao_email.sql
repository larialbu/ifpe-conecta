-- ==============================================================================
-- 📌 Migração 005: Ativar confirmação de e-mail obrigatória para novos discentes
-- ==============================================================================
-- Adiciona colunas para controle de ativação de conta por e-mail institucional
-- ==============================================================================

-- 1. Adicionar colunas de confirmação de e-mail na tabela usuarios
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS token_verificacao TEXT,
ADD COLUMN IF NOT EXISTS token_verificacao_expira TIMESTAMPTZ;

-- 2. Garantir que as contas de administrador e contas já existentes fiquem verificadas
UPDATE public.usuarios 
SET email_verificado = TRUE 
WHERE tipo = 'admin' OR email ILIKE 'admin@ifpe.edu.br';

-- Usuários já cadastrados anteriormente permanecem liberados
UPDATE public.usuarios 
SET email_verificado = TRUE 
WHERE email_verificado IS NULL;

