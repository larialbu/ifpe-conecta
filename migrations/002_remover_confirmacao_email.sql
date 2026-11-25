-- ==============================================================================
-- 📌 Migration 002: Remover Validação de E-mail Obrigatória
-- ==============================================================================

ALTER TABLE public.usuarios 
DROP COLUMN IF EXISTS email_verificado,
DROP COLUMN IF EXISTS token_verificacao,
DROP COLUMN IF EXISTS token_verificacao_expira;

-- Garantir existência da coluna de bio acadêmica
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS bio TEXT;

