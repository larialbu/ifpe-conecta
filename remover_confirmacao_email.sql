-- ==============================================================================
-- 📌 IFPE Olinda Conecta - Migration: Remover Validação de E-mail do Banco
-- ==============================================================================
-- Como executar:
-- 1. Acesse o painel do Supabase (https://supabase.com/dashboard)
-- 2. No menu lateral, clique em "SQL Editor"
-- 3. Clique em "+ New query", cole o comando abaixo e clique em "Run" (Executar)
-- ==============================================================================

ALTER TABLE public.usuarios 
DROP COLUMN IF EXISTS email_verificado,
DROP COLUMN IF EXISTS token_verificacao,
DROP COLUMN IF EXISTS token_verificacao_expira;
