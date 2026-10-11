# 📌 Prompt de Instrução para Criação do Sistema: IFPE Olinda Conecta (Reddit/Comunidade Simplificada)

---

## 🎯 Objetivo do Projeto
Desenvolver uma aplicação web full stack simples e intuitiva (estilo fórum/Reddit/LinkedIn simplificado) com o objetivo de integrar os estudantes do **IFPE Campus Olinda**. A plataforma permitirá que alunos criem contas, façam login, visualizem e criem publicações separadas por categorias/tópicos (ex: Fórum de Dúvidas, Conselhos, Avisos Gerais e Projetos).

---

## 🛠️ Stack Tecnológica

- **Frontend:** React (Vite) + CSS modular simples.
- **Backend:** Node.js com Express.
- **Banco de Dados:** Supabase (PostgreSQL).
- **Autenticação:** Gerenciada via Supabase Auth ou tokens JWT simples gerados no Express com credenciais no Supabase.

---

## 🎨 Identidade Visual (Cores Oficiais IFPE)

Seguir estritamente o padrão de cores institucionais do IFPE:
- **Verde Principal (IFPE Green):** `#2F855A` / `#16A34A` / `#008242`
- **Vermelho Secundário (Destaques/Ações):** `#DC2626` / `#CC181E`
- **Fundos & Contrastes:** Neutros limpos (Branco `#FFFFFF`, Cinza Claro `#F3F4F6`, Cinza Escuro para textos `#1F2937`).

---

## 📦 Estrutura e Funcionalidades Obrigatórias

### 1. Autenticação e Usuários
- **Criar Conta:** Nome completo, e-mail (obrigatorio estudantil (@discente.ifpe.edu.br)), curso e senha.
- **Login / Logout:** Autenticação simples com persistência de sessão (localStorage ou cookies).

### 2. Layout da Interface (Baseado nas referências Reddit/LinkedIn)
- **Barra de Navegação Superior (Header):**
  - Logotipo/Nome: "IFPE Olinda Conecta".
  - Barra de busca simples (opcional/placeholders).
  - Foto/Nome do usuário logado e botão de Sair (Logout).
- **Barra Lateral Esquerda (Menu de Categorias / Espaços):**
  - Feed Geral (Todas as publicações)
  - ❓ Fórum & Dúvidas
  - 💡 Conselhos & Dicas Acadêmicas
  - 📢 Avisos do Campus
  - 🚀 Projetos & Oportunidades
- **Coluna Central (Principal):**
  - **Card Superior ("Criar Publicação" - Estilo LinkedIn):**
    - Campo de input/botão expansível com texto: *"No que você está pensando?"* ou *"Começar publicação"*.
    - Seleção de categoria (tag/tópico).
    - Campo de texto/conteúdo e botão *"Publicar"*.
  - **Feed de Publicações:**
    - Lista de posts em ordem cronológica reversa (mais recentes primeiro).
    - Cada card de post deve conter:
      - Avatar e nome do autor + curso.
      - Tag/badge da categoria com cor de destaque.
      - Horário/Data da postagem.
      - Conteúdo do texto.
      - Ações simples: Curtir (Upvote / Apoiar) e Contador de Respostas.
- **Barra Lateral Direita (Widgets rápidos):**
  - Card informativo com links úteis do IFPE Olinda.
  - Tópicos mais discutidos da semana.

---

## 🗄️ REQUISITO CRÍTICO: Script SQL para o Supabase

> **Atenção Agente:** É **obrigatório** fornecer o script SQL completo e pronto para ser executado diretamente no **SQL Editor do Supabase**. 

O script SQL deve criar:
1. Tabela `profiles` (se desacoplado de auth.users) ou tabela `usuarios`:
   - `id` (UUID, Primary Key)
   - `nome` (Text)
   - `email` (Text, Unique)
   - `curso` (Text)
   - `created_at` (Timestamp)
2. Tabela `posts` (publicações):
   - `id` (UUID, Primary Key default `gen_random_uuid()`)
   - `autor_id` (FK para o usuário)
   - `titulo` (Text, opcional)
   - `conteudo` (Text)
   - `categoria` (Text: 'duvidas', 'conselhos', 'avisos', 'geral')
   - `likes_count` (Integer, default 0)
   - `created_at` (Timestamp default `now()`)
3. Tabela `comentarios` (respostas/fórum):
   - `id` (UUID, Primary Key default `gen_random_uuid()`)
   - `post_id` (FK para `posts.id` on delete cascade)
   - `autor_id` (FK para o usuário)
   - `conteudo` (Text)
   - `created_at` (Timestamp default `now()`)
4. Políticas de RLS (Row Level Security) permissivas ou instruções para habilitar leitura/escrita básica.

---

## 📂 Organização das Pastas do Projeto

O agente deve gerar o código organizado em uma estrutura simples e desacoplada:

```plaintext
ifpe-Conecta/
├── backend/
│   ├── src/
│   │   ├── config/supabase.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── SidebarCategorias.jsx
│   │   │   ├── PostBox.jsx
│   │   │   └── PostCard.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Cadastro.jsx
│   │   │   └── Feed.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
└── schema.sql (Script para rodar no Supabase)
```

---

## ⚙️ Entregáveis Esperados do Agente

1. **Arquivo `schema.sql`:** Código SQL pronto para colar no painel do Supabase.
2. **Código do Backend (Express):** Rotas de login/registro, listagem de posts por categoria e criação de posts.
3. **Código do Frontend (React):** Telas limpas, responsivas e estilizadas nas cores verde e vermelho do IFPE, com o input de publicação no topo e o feed embaixo.
4. **Instruções de Execução:** Passo a passo com os comandos (`npm install`, `npm run dev`) e as variáveis de ambiente necessárias (`SUPABASE_URL` e `SUPABASE_KEY`).