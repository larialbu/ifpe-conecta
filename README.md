# 🎓 IFPE Olinda Hub — Monorepo Full Stack para Vercel

Plataforma de integração e fórum estudantil do **IFPE Campus Olinda** desenvolvida como **Monorepo Full Stack** (React + Express Serverless + Supabase), projetada especificamente para deploy simplificado em um único projeto na **Vercel**.

---

## ⚡ Por que esta arquitetura é perfeita para a Vercel?

- 📦 **Monorepo Único:** Frontend (React/Vite) e Backend (Express) residem no mesmo repositório e compartilham o mesmo `package.json`.
- ⚡ **Vercel Serverless Functions:** As rotas do backend em `/api` são executadas automaticamente como Serverless Functions na Vercel.
- 🚫 **Zero Problemas de CORS:** Em produção, o frontend e a API rodam no mesmo domínio (`/api/*`), eliminando bloqueios de CORS e necessidade de configurar múltiplos domínios.
- 💻 **Ambiente Local Simples:** Com um único comando (`npm run dev`), tanto o backend local quanto o frontend iniciam simultaneamente com proxy automático no Vite.

---

## 🌟 Funcionalidades em Destaque

- 🌙 **Modo Noturno (Dark Mode):** Alternância com um clique no header ou nas telas de login/cadastro, com transição suave e persistência em `localStorage`.
- 👤 **Meu Perfil & Edição de Dados:** Modal completo para atualização de nome, curso no IFPE Olinda, minibiografia acadêmica e alteração de senha segura.
- 🏛️ **Identidade Visual IFPE:** Cores institucionais (Verde `#16A34A` e Vermelho `#DC2626`) adaptadas para os temas claro e escuro.
- 🔐 **Autenticação Discente:** Validação estrita de e-mail institucional (`@discente.ifpe.edu.br`) com tokens JWT.
- 💬 **Fórum estilo Reddit/LinkedIn:** Publicações categorizadas, upvotes (apoios) e comentários em tempo real.

---

## 📂 Estrutura do Monorepo

```plaintext
GABI/
├── api/                       # 🟢 BACKEND (Vercel Serverless / Express)
│   ├── index.js               # Handler principal exportado para a Vercel
│   ├── config/supabase.js     # Conexão com o Supabase
│   ├── controllers/
│   │   ├── authController.js  # Cadastro discente e Login com JWT
│   │   └── postController.js  # Feed, filtros, upvotes e comentários
│   ├── middleware/authMiddleware.js # Proteção de rotas com JWT
│   └── routes/                # Rotas da API (/auth e /posts)
├── src/                       # 🔵 FRONTEND (React + Vite)
│   ├── components/
│   │   ├── Navbar.jsx         # Header com busca em tempo real e perfil
│   │   ├── SidebarCategorias.jsx # Menu com espaços do campus
│   │   ├── PostBox.jsx        # Criação de post estilo LinkedIn
│   │   ├── PostCard.jsx       # Card de postagem com upvotes e comentários
│   │   └── WidgetsSidebar.jsx # Links rápidos do IFPE e tópicos em alta
│   ├── pages/
│   │   ├── Login.jsx          # Login com botões de 1 clique para demonstração
│   │   ├── Cadastro.jsx       # Registro com validação @discente.ifpe.edu.br
│   │   └── Feed.jsx           # Layout 3 colunas (Reddit/LinkedIn)
│   ├── context/AuthContext.jsx
│   ├── services/api.js        # Chamadas para /api
│   ├── App.jsx
│   ├── index.css              # Cores oficiais do IFPE (Verde e Vermelho)
│   └── main.jsx
├── index.html
├── vite.config.js             # Configurado com proxy para /api localmente
├── vercel.json                # Roteamento SPA e API da Vercel
├── server.local.js            # Servidor para desenvolvimento local
├── package.json               # Dependências unificadas do monorepo
├── schema.sql                 # Script SQL para o Supabase
└── .env.example
```

---

## 🚀 Como Fazer o Deploy na Vercel (Passo a Passo)

1. **Suba este repositório para o seu GitHub:**
   ```bash
   git init
   git add .
   git commit -m "feat: ifpe olinda hub monorepo full stack"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```

2. **Importe na Vercel:**
   - Acesse [vercel.com](https://vercel.com/) e clique em **Add New... > Project**.
   - Conecte sua conta do GitHub e selecione o repositório.
   - A Vercel detectará automaticamente o framework como **Vite**.
   - **Build Command:** `vite build`
   - **Output Directory:** `dist`

3. **Configure as Variáveis de Ambiente na Vercel:**
   No momento de importar (ou em *Settings > Environment Variables*), adicione:
   - `SUPABASE_URL`: sua URL do projeto Supabase (ex: `https://xxxx.supabase.co`)
   - `SUPABASE_KEY`: sua chave `anon` ou `service_role` do Supabase
   - `JWT_SECRET`: uma frase secreta (ex: `super_secret_ifpe_olinda_hub_jwt_key_2026`)

4. **Clique em Deploy!**
   - Pronto! O frontend e o backend serão publicados juntos na mesma URL gerada pela Vercel.

---

## 🗄️ Executando o Script no Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard).
2. Vá em **SQL Editor** no menu lateral esquerdo.
3. Clique em **+ New query**, copie todo o código de [`schema.sql`](./schema.sql) e clique em **Run**.
4. O script cria as tabelas `usuarios`, `posts`, `comentarios`, `curtidas`, políticas RLS e já insere dados de demonstração com alunos reais do IFPE Campus Olinda!

---

## 💻 Como Rodar Localmente na Sua Máquina

1. Instale as dependências (caso não tenha instalado):
   ```bash
   npm install
   ```

2. Inicie tudo com um único comando:
   ```bash
   npm run dev
   ```
   > Esse comando inicia simultaneamente:
   > - O backend local em `http://localhost:5001`
   > - O frontend Vite em `http://localhost:3000` (com proxy automático de `/api` para `http://localhost:5001`)

3. Abra o navegador em:
   👉 **http://localhost:3000**

---

## 🔑 Contas de Demonstração Rápidas

Para facilitar a apresentação ou testes, você pode usar estas contas já cadastradas (senha: `123456`):

| Estudante | E-mail | Curso | Senha |
|---|---|---|---|
| **Mariana Silva** | `mariana.silva@discente.ifpe.edu.br` | ADS | `123456` |
| **Lucas Albuquerque** | `lucas.albuquerque@discente.ifpe.edu.br` | ADS | `123456` |
| **Camila Duarte** | `camila.duarte@discente.ifpe.edu.br` | ADS | `123456` |

*(A tela de login conta com botões rápidos para preenchimento com 1 clique).*
