const app = require('./api/index');

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 [LOCAL DEV] Servidor IFPE Olinda Hub ativo!`);
  console.log(`📡 URL API Local: http://localhost:${PORT}/api`);
  console.log(`⚡ Na Vercel, este backend roda como Serverless Function.`);
  console.log(`======================================================\n`);
});
