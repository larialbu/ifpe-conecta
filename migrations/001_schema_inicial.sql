-- ==============================================================================
-- 📌 Migration 001: Schema Inicial do IFPE Chega Junto
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabela de Usuários
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

-- 2. Tabela de Publicações (Posts)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    autor_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo TEXT,
    conteudo TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('geral', 'duvidas', 'conselhos', 'avisos', 'projetos')),
    likes_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Comentários / Respostas
CREATE TABLE IF NOT EXISTS public.comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    autor_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    conteudo TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Curtidas (Upvotes únicos)
CREATE TABLE IF NOT EXISTS public.curtidas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_post_usuario_curtida UNIQUE (post_id, usuario_id)
);

-- 5. Índices para Otimização
CREATE INDEX IF NOT EXISTS idx_posts_categoria ON public.posts(categoria);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_autor_id ON public.posts(autor_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_post_id ON public.comentarios(post_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_created_at ON public.comentarios(created_at ASC);

-- 6. Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curtidas ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
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

