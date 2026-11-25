const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Healthcheck
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    message: 'IFPE Chega Junto API Vercel Serverless funcionando com sucesso!',
    timestamp: new Date().toISOString()
  });
});

// Migrations - Status e Execução
app.get(['/api/migrations', '/migrations'], (req, res) => {
  const { CURSOS_OFICIAIS } = require('./migrations/runner');
  res.json({
    status: 'ok',
    mensagem: 'Sistema de migrations configurado no novo padrão.',
    padrao_cursos: CURSOS_OFICIAIS,
    instrucoes: 'Para forçar a execução, envie POST para /api/migrations/executar ou use npm run migrate'
  });
});

app.post(['/api/migrations/executar', '/migrations/executar'], async (req, res) => {
  try {
    const { executarMigrations } = require('./migrations/runner');
    const resultado = await executarMigrations({ silencioso: true });
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rotas de autenticação (suporta tanto com quanto sem prefixo /api)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

// Rotas de publicações (suporta tanto com quanto sem prefixo /api)
app.use('/api/posts', postRoutes);
app.use('/posts', postRoutes);

// Tratamento de rotas de API não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado na API do IFPE Chega Junto.' });
});

// Tratamento global de erros
app.use((err, req, res, next) => {
  console.error('Erro na API:', err);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

module.exports = app;
