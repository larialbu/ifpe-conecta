const app = require('./api/index');
const { executarMigrations } = require('./api/migrations/runner');

const PORT = process.env.PORT || 5001;

async function bootstrap() {
  // Sincroniza e migra o banco de dados para o novo padrão automaticamente
  try {
    await executarMigrations({ silencioso: false });
  } catch (err) {
    console.warn('⚠️ [MIGRATIONS] Nota ao sincronizar banco na inicialização:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 [LOCAL DEV] Servidor IFPE Chega Junto ativo!`);
    console.log(`📡 URL API Local: http://localhost:${PORT}/api`);
    console.log(`⚡ Na Vercel, este backend roda como Serverless Function.`);
    console.log(`======================================================\n`);
  });
}

bootstrap();
