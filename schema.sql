-- ==============================================================================
-- 📌 IFPE Olinda Hub - Script de Criação do Banco de Dados (Supabase / PostgreSQL)
-- ==============================================================================
-- Instruções:
-- 1. Acesse o painel do Supabase (https://supabase.com/dashboard).
-- 2. No menu lateral, clique em "SQL Editor".
-- 3. Clique em "+ New query", cole todo este código e clique em "Run" (Executar).
-- ==============================================================================

-- 1. Habilitar extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela de Usuários (Estudantes do IFPE Olinda)
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

-- Garantir colunas bio e de verificação de e-mail caso a tabela já tenha sido criada anteriormente
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT FALSE;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS token_verificacao TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS token_verificacao_expira TIMESTAMPTZ;

-- 3. Tabela de Publicações (Posts)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    autor_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo TEXT,
    conteudo TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('geral', 'duvidas', 'conselhos', 'avisos', 'projetos')),
    likes_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Comentários / Respostas
CREATE TABLE IF NOT EXISTS public.comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    autor_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    conteudo TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela de Curtidas (para controle de votos únicos por usuário)
CREATE TABLE IF NOT EXISTS public.curtidas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_post_usuario_curtida UNIQUE (post_id, usuario_id)
);

-- 6. Índices para Otimização de Consultas
CREATE INDEX IF NOT EXISTS idx_posts_categoria ON public.posts(categoria);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_autor_id ON public.posts(autor_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_post_id ON public.comentarios(post_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_created_at ON public.comentarios(created_at ASC);

-- 7. Configuração de RLS (Row Level Security)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curtidas ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para uso via backend Express com chave de API (anon ou service role)
DROP POLICY IF EXISTS "Permitir leitura pública de usuarios" ON public.usuarios;
CREATE POLICY "Permitir leitura pública de usuarios" ON public.usuarios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir inserção de usuarios" ON public.usuarios;
CREATE POLICY "Permitir inserção de usuarios" ON public.usuarios FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura pública de posts" ON public.posts;
CREATE POLICY "Permitir leitura pública de posts" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir criação e edição de posts" ON public.posts;
CREATE POLICY "Permitir criação e edição de posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura pública de comentarios" ON public.comentarios;
CREATE POLICY "Permitir leitura pública de comentarios" ON public.comentarios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir criação de comentarios" ON public.comentarios;
CREATE POLICY "Permitir criação de comentarios" ON public.comentarios FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir operações em curtidas" ON public.curtidas;
CREATE POLICY "Permitir operações em curtidas" ON public.curtidas FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 🚀 DADOS INICIAIS DE DEMONSTRAÇÃO (SEED)
-- Usuários iniciais com senha padrão criptografada bcrypt (senha: "123456")
-- ==============================================================================

INSERT INTO public.usuarios (id, nome, email, curso, senha, email_verificado)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111', 
        'Mariana Silva', 
        'mariana.silva@discente.ifpe.edu.br', 
        'Computação Gráfica', 
        '$2b$10$uXb1Ti5giaAV6KO5w4QVzOS0QxiM/XAu1dL31RtmqWUHSHv8xPDWm',
        true
    ),
    (
        '22222222-2222-2222-2222-222222222222', 
        'Lucas Albuquerque', 
        'lucas.albuquerque@discente.ifpe.edu.br', 
        'Técnico em Computação Gráfica', 
        '$2b$10$uXb1Ti5giaAV6KO5w4QVzOS0QxiM/XAu1dL31RtmqWUHSHv8xPDWm',
        true
    ),
    (
        '33333333-3333-3333-3333-333333333333', 
        'Camila Duarte', 
        'camila.duarte@discente.ifpe.edu.br', 
        'Artes Visuais', 
        '$2b$10$uXb1Ti5giaAV6KO5w4QVzOS0QxiM/XAu1dL31RtmqWUHSHv8xPDWm',
        true
    )
ON CONFLICT (email) DO UPDATE SET curso = EXCLUDED.curso;

-- Posts de Demonstração
INSERT INTO public.posts (id, autor_id, titulo, conteudo, categoria, likes_count, created_at)
VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '22222222-2222-2222-2222-222222222222',
        'Inscrições abertas para o Hackathon Porto Digital 2026!',
        'Fala pessoal do campus Olinda! Estão abertas as inscrições para o Hackathon no Bairro do Recife. Quem tiver interesse em participar (precisamos de devs front/back e designers UI/UX), mandem mensagem aqui!',
        'projetos',
        14,
        NOW() - INTERVAL '2 hours'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '11111111-1111-1111-1111-111111111111',
        'Alguém sabe os horários de monitoria de Algoritmos?',
        'Oi gente, estou com dúvidas na lista de ponteiros e estruturas em C. Sabem se o monitor do Lab 3 está atendendo nas terças à tarde?',
        'duvidas',
        5,
        NOW() - INTERVAL '5 hours'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        '33333333-3333-3333-3333-333333333333',
        'Semana de Inovação e Tecnologia no Campus na próxima sexta',
        'Avisando a toda a comunidade discente que teremos a mostra anual de projetos de extensão e tecnologia no pátio central a partir das 15h. Não deixem de prestigiar!',
        'avisos',
        22,
        NOW() - INTERVAL '1 day'
    ),
    (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        '22222222-2222-2222-2222-222222222222',
        'Dica para quem está começando no estágio acadêmico',
        'Uma dica de ouro que me ajudou muito no 3º período: organizem o Git e o LinkedIn desde já. As empresas de Recife e Olinda olham muito os projetos práticos de extensão do IFPE.',
        'conselhos',
        18,
        NOW() - INTERVAL '2 days'
    )
ON CONFLICT DO NOTHING;

-- Comentários de Demonstração
INSERT INTO public.comentarios (post_id, autor_id, conteudo, created_at)
VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        'Tenho muito interesse! Faço CG e tenho experiência com prototipação no Figma e UI design.',
        NOW() - INTERVAL '1 hour'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '22222222-2222-2222-2222-222222222222',
        'Sim, a monitoria é das 14h às 17h nas terças e quintas no laboratório de informática!',
        NOW() - INTERVAL '3 hours'
    )
ON CONFLICT DO NOTHING;
