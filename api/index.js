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
    message: 'IFPE Olinda Hub API Vercel Serverless funcionando com sucesso!',
    timestamp: new Date().toISOString()
  });
});

// Rotas de autenticação (suporta tanto com quanto sem prefixo /api)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

// Rotas de publicações (suporta tanto com quanto sem prefixo /api)
app.use('/api/posts', postRoutes);
app.use('/posts', postRoutes);

// Tratamento de rotas de API não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado na API do IFPE Olinda Hub.' });
});

// Tratamento global de erros
app.use((err, req, res, next) => {
  console.error('Erro na API:', err);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

module.exports = app;
