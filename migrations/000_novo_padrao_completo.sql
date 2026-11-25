-- ==============================================================================
-- 📌 IFPE Chega Junto - Script Consolidado: Novo Padrão Completo
-- ==============================================================================
-- Este script é 100% idempotente (pode ser executado várias vezes com segurança).
-- Ele cria todas as tabelas, índices, RLS, remove colunas antigas, atualiza os cursos
-- para o novo padrão e insere os dados de demonstração.
-- ==============================================================================

-- 1. Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela de Controle de Migrações
CREATE TABLE IF NOT EXISTS public._migrations (
    id SERIAL PRIMARY KEY,
    nome TEXT UNIQUE NOT NULL,
    executado_em TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Usuários
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    curso TEXT NOT NULL,
    bio TEXT,
    senha TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT email_estudantil_check CHECK (email ILIKE '%@discente.ifpe.edu.br' OR email ILIKE '%@ifpe.edu.br')
);

-- Garantir coluna bio e remover campos obsoletos de validação
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.usuarios DROP COLUMN IF EXISTS email_verificado;
ALTER TABLE public.usuarios DROP COLUMN IF EXISTS token_verificacao;
ALTER TABLE public.usuarios DROP COLUMN IF EXISTS token_verificacao_expira;

-- 4. Migração e Normalização de Cursos para o Novo Padrão Oficial
UPDATE public.usuarios 
SET curso = 'Computação Gráfica Integrado' 
WHERE curso = 'Computação Gráfica';

UPDATE public.usuarios 
SET curso = 'Computação Gráfica Subsequente' 
WHERE curso = 'Técnico em Computação Gráfica';

UPDATE public.usuarios 
SET curso = 'Computação Gráfica Integrado' 
WHERE curso NOT IN ('Artes Visuais', 'Computação Gráfica Integrado', 'Computação Gráfica Subsequente', 'Produção em Multimídia');

-- Constraint para os 4 Cursos Oficiais
ALTER TABLE public.usuarios DROP CONSTRAINT IF EXISTS check_cursos_ifpe_olinda;
ALTER TABLE public.usuarios ADD CONSTRAINT check_cursos_ifpe_olinda 
CHECK (curso IN ('Artes Visuais', 'Computação Gráfica Integrado', 'Computação Gráfica Subsequente', 'Produção em Multimídia'));

-- 5. Tabela de Publicações (Posts)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    autor_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo TEXT,
    conteudo TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('geral', 'duvidas', 'conselhos', 'avisos', 'projetos')),
    likes_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabela de Comentários / Respostas
CREATE TABLE IF NOT EXISTS public.comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    autor_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    conteudo TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabela de Curtidas (Upvotes únicos)
CREATE TABLE IF NOT EXISTS public.curtidas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_post_usuario_curtida UNIQUE (post_id, usuario_id)
);

-- 8. Índices
CREATE INDEX IF NOT EXISTS idx_posts_categoria ON public.posts(categoria);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_autor_id ON public.posts(autor_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_post_id ON public.comentarios(post_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_created_at ON public.comentarios(created_at ASC);

-- 9. RLS (Row Level Security)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curtidas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura pública de usuarios" ON public.usuarios;
CREATE POLICY "Permitir leitura pública de usuarios" ON public.usuarios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir inserção de usuarios" ON public.usuarios;
CREATE POLICY "Permitir inserção de usuarios" ON public.usuarios FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura pública de posts" ON public.posts;
CREATE POLICY "Permitir leitura pública de posts" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir inserção de posts" ON public.posts;
CREATE POLICY "Permitir inserção de posts" ON public.posts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir update de posts" ON public.posts;
CREATE POLICY "Permitir update de posts" ON public.posts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir leitura pública de comentarios" ON public.comentarios;
CREATE POLICY "Permitir leitura pública de comentarios" ON public.comentarios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir inserção de comentarios" ON public.comentarios;
CREATE POLICY "Permitir inserção de comentarios" ON public.comentarios FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura de curtidas" ON public.curtidas;
CREATE POLICY "Permitir leitura de curtidas" ON public.curtidas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir inserção de curtidas" ON public.curtidas;
CREATE POLICY "Permitir inserção de curtidas" ON public.curtidas FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir delete de curtidas" ON public.curtidas;
CREATE POLICY "Permitir delete de curtidas" ON public.curtidas FOR DELETE USING (true);

-- 10. Inserir / Atualizar Usuários de Demonstração (Senha bcrypt: "123456")
INSERT INTO public.usuarios (id, nome, email, curso, bio, senha)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111', 
        'Mariana Silva', 
        'mariana.silva@discente.ifpe.edu.br', 
        'Computação Gráfica Integrado',
        'Estudante do curso técnico integrado, apaixonada por modelagem 3D, animação e ilustração digital.',
        '$2b$10$uXb1Ti5giaAV6KO5w4QVzOS0QxiM/XAu1dL31RtmqWUHSHv8xPDWm'
    ),
    (
        '22222222-2222-2222-2222-222222222222', 
        'Lucas Albuquerque', 
        'lucas.albuquerque@discente.ifpe.edu.br', 
        'Computação Gráfica Subsequente',
        'Focado em design de interfaces UI/UX, desenvolvimento de jogos e projetos de extensão.',
        '$2b$10$uXb1Ti5giaAV6KO5w4QVzOS0QxiM/XAu1dL31RtmqWUHSHv8xPDWm'
    ),
    (
        '33333333-3333-3333-3333-333333333333', 
        'Camila Duarte', 
        'camila.duarte@discente.ifpe.edu.br', 
        'Artes Visuais',
        'Pesquisadora em poéticas visuais, gravura, design editorial e exposições culturais.',
        '$2b$10$uXb1Ti5giaAV6KO5w4QVzOS0QxiM/XAu1dL31RtmqWUHSHv8xPDWm'
    )
ON CONFLICT (email) DO UPDATE SET 
    curso = EXCLUDED.curso,
    bio = COALESCE(public.usuarios.bio, EXCLUDED.bio);

-- 11. Registrar migrações no log
INSERT INTO public._migrations (nome) 
VALUES 
    ('001_schema_inicial.sql'),
    ('002_remover_confirmacao_email.sql'),
    ('003_atualizar_cursos_novo_padrao.sql')
ON CONFLICT (nome) DO NOTHING;

