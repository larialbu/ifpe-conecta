/**
 * ==============================================================================
 * 📌 IFPE Chega Junto - Sistema Automatizado de Migrations
 * ==============================================================================
 * Executa automaticamente ao iniciar o servidor ou manualmente via:
 *   npm run migrate
 *   npm run migrate:status
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const { supabase } = require('../config/supabase');

const CURSOS_OFICIAIS = [
  'Artes Visuais',
  'Computação Gráfica Integrado',
  'Computação Gráfica Subsequente',
  'Produção em Multimídia',
];

const USUARIOS_DEMO = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    nome: 'Mariana Silva',
    email: 'mariana.silva@discente.ifpe.edu.br',
    curso: 'Computação Gráfica Integrado',
    bio: 'Estudante do curso técnico integrado, apaixonada por modelagem 3D, animação e ilustração digital.',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    nome: 'Lucas Albuquerque',
    email: 'lucas.albuquerque@discente.ifpe.edu.br',
    curso: 'Computação Gráfica Subsequente',
    bio: 'Focado em design de interfaces UI/UX, desenvolvimento de jogos e projetos de extensão.',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    nome: 'Camila Duarte',
    email: 'camila.duarte@discente.ifpe.edu.br',
    curso: 'Artes Visuais',
    bio: 'Pesquisadora em poéticas visuais, gravura, design editorial e exposições culturais.',
  },
];

const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');
const CACHE_FILE = path.join(__dirname, '.migrations_cache.json');

/**
 * Lê os arquivos .sql disponíveis na pasta migrations
 */
function obterArquivosSql() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql') && !f.startsWith('000_'))
    .sort();
}

/**
 * Carrega o cache local de migrações executadas
 */
function carregarCacheLocal() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }
  } catch (err) {
    // ignora erro de leitura
  }
  return { executadas: [], ultimaExecucao: null };
}

/**
 * Salva o cache local
 */
function salvarCacheLocal(cache) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (err) {
    // ignora erro de escrita
  }
}

/**
 * Executa as migrações e atualizações para o novo padrão
 */
async function executarMigrations(options = { silencioso: false }) {
  const log = (...args) => {
    if (!options.silencioso) console.log(...args);
  };

  log('\n📦 [MIGRATION RUNNER] Verificando e atualizando banco para o Novo Padrão...');

  const cache = carregarCacheLocal();
  const arquivosSql = obterArquivosSql();
  let alteracoesRealizadas = 0;

  // 1. Tentar execução de SQL direta caso DATABASE_URL exista
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (databaseUrl) {
    try {
      const { Client } = require('pg');
      const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
      await client.connect();

      log('🔌 [POSTGRES] Conectado via PostgreSQL para aplicar DDL...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS public._migrations (
          id SERIAL PRIMARY KEY,
          nome TEXT UNIQUE NOT NULL,
          executado_em TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      `);

      const res = await client.query('SELECT nome FROM public._migrations');
      const aplicadas = new Set(res.rows.map((r) => r.nome));

      for (const arquivo of arquivosSql) {
        if (!aplicadas.has(arquivo)) {
          const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, arquivo), 'utf-8');
          log(`  ▶️ Executando migração SQL: ${arquivo}...`);
          await client.query(sql);
          await client.query('INSERT INTO public._migrations (nome) VALUES ($1)', [arquivo]);
          log(`  ✅ Migração ${arquivo} aplicada com sucesso!`);
          alteracoesRealizadas++;
        }
      }

      await client.end();
    } catch (err) {
      log('ℹ️ [POSTGRES INFO] Conexão direta SQL não utilizada:', err.message);
    }
  }

  // 2. Se temos cliente Supabase, sincronizar dados para o novo padrão
  if (supabase) {
    try {
      log('🔄 [SUPABASE DATA] Normalizando registros de usuários para os novos cursos...');

      // A) Migrar 'Computação Gráfica' para 'Computação Gráfica Integrado'
      const { data: antigos1 } = await supabase
        .from('usuarios')
        .select('id, nome, email, curso')
        .eq('curso', 'Computação Gráfica');

      if (antigos1 && antigos1.length > 0) {
        log(`  🔄 Atualizando ${antigos1.length} usuário(s) de 'Computação Gráfica' para 'Computação Gráfica Integrado'...`);
        await supabase
          .from('usuarios')
          .update({ curso: 'Computação Gráfica Integrado' })
          .eq('curso', 'Computação Gráfica');
        alteracoesRealizadas += antigos1.length;
      }

      // B) Migrar 'Técnico em Computação Gráfica' para 'Computação Gráfica Subsequente'
      const { data: antigos2 } = await supabase
        .from('usuarios')
        .select('id, nome, email, curso')
        .eq('curso', 'Técnico em Computação Gráfica');

      if (antigos2 && antigos2.length > 0) {
        log(`  🔄 Atualizando ${antigos2.length} usuário(s) de 'Técnico em Computação Gráfica' para 'Computação Gráfica Subsequente'...`);
        await supabase
          .from('usuarios')
          .update({ curso: 'Computação Gráfica Subsequente' })
          .eq('curso', 'Técnico em Computação Gráfica');
        alteracoesRealizadas += antigos2.length;
      }

      // C) Garantir que os usuários de demonstração estejam atualizados com tipo = 'usuario'
      const hashSenhaPadrao = await bcrypt.hash('123456', 10);

      for (const demo of USUARIOS_DEMO) {
        const { data: userExiste } = await supabase
          .from('usuarios')
          .select('id, email, curso, bio, tipo')
          .eq('email', demo.email)
          .single();

        if (userExiste) {
          // Atualiza curso, bio e tipo se divergirem
          if (userExiste.curso !== demo.curso || (!userExiste.bio && demo.bio) || userExiste.tipo !== 'usuario') {
            await supabase
              .from('usuarios')
              .update({
                curso: demo.curso,
                bio: userExiste.bio || demo.bio,
                tipo: 'usuario',
              })
              .eq('email', demo.email);
            log(`  ✅ Conta de demonstração atualizada: ${demo.nome} (${demo.curso}) [tipo: usuario]`);
            alteracoesRealizadas++;
          }
        } else {
          // Cria caso o banco esteja novo/vazio
          await supabase.from('usuarios').insert([
            {
              id: demo.id,
              nome: demo.nome,
              email: demo.email,
              curso: demo.curso,
              bio: demo.bio,
              tipo: 'usuario',
              senha: hashSenhaPadrao,
            },
          ]);
          log(`  ✨ Conta de demonstração criada: ${demo.nome} (${demo.curso}) [tipo: usuario]`);
          alteracoesRealizadas++;
        }
      }

      // D) Garantir conta de administrador no banco (tipo = 'admin')
      const adminEmail = (process.env.ADMIN_EMAIL || 'admin@ifpe.edu.br').trim().toLowerCase();
      const adminSenha = process.env.ADMIN_PASSWORD || 'admin123';
      const hashSenhaAdmin = await bcrypt.hash(adminSenha, 10);

      const { data: adminExiste } = await supabase
        .from('usuarios')
        .select('id, email, tipo')
        .eq('email', adminEmail)
        .maybeSingle();

      if (adminExiste) {
        if (adminExiste.tipo !== 'admin') {
          await supabase
            .from('usuarios')
            .update({ tipo: 'admin' })
            .eq('email', adminEmail);
          log(`  🛡️ Permissão de Administrador concedida no banco para: ${adminEmail}`);
          alteracoesRealizadas++;
        }
      } else {
        await supabase.from('usuarios').insert([
          {
            nome: 'Administrador IFPE',
            email: adminEmail,
            curso: 'Produção em Multimídia',
            bio: 'Coordenação e Administração Oficial da plataforma IFPE Chega Junto.',
            tipo: 'admin',
            senha: hashSenhaAdmin,
          },
        ]);
        log(`  🛡️ Conta de Administrador oficial criada no banco: ${adminEmail} (tipo: admin)`);
        alteracoesRealizadas++;
      }

      // Atualiza cache local
      cache.executadas = arquivosSql;
      cache.ultimaExecucao = new Date().toISOString();
      cache.novoPadraoCursos = CURSOS_OFICIAIS;
      salvarCacheLocal(cache);

      log(`🎉 [MIGRATION RUNNER] Concluído! O banco de dados está atualizado no Novo Padrão.`);
      log(`   🎓 Cursos Oficiais: ${CURSOS_OFICIAIS.join(' • ')}`);
      return { success: true, alteracoes: alteracoesRealizadas, cache };
    } catch (err) {
      log('⚠️ [MIGRATION RUNNER] Nota durante execução:', err.message);
      return { success: false, error: err.message };
    }
  } else {
    log('⚠️ [MIGRATION RUNNER] Supabase não conectado. Configure SUPABASE_URL e SUPABASE_KEY no .env.');
    return { success: false, error: 'Credenciais Supabase ausentes' };
  }
}

/**
 * Exibe o status atual das migrações
 */
function exibirStatus() {
  const cache = carregarCacheLocal();
  const arquivos = obterArquivosSql();

  console.log('\n📊 ======================================================');
  console.log('📌 STATUS DAS MIGRAÇÕES - IFPE CHEGA JUNTO');
  console.log('======================================================');
  console.log(`📁 Diretório de Migrações: ${MIGRATIONS_DIR}`);
  console.log(`🕒 Última sincronização: ${cache.ultimaExecucao || 'Nunca executado localmente'}`);
  console.log('\nArquivos de Migração Disponíveis:');
  arquivos.forEach((arq, index) => {
    const status = cache.executadas?.includes(arq) ? '✅ [APLICADA]' : '⏳ [PENDENTE/DISPONÍVEL]';
    console.log(`  ${index + 1}. ${status} ${arq}`);
  });
  console.log('\n🎓 Cursos Oficiais no Novo Padrão:');
  CURSOS_OFICIAIS.forEach((c) => console.log(`  • ${c}`));
  console.log('======================================================\n');
}

// Se chamado diretamente no terminal via `node api/migrations/runner.js`
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--status') || args.includes('-s')) {
    exibirStatus();
  } else {
    executarMigrations().then(() => process.exit(0));
  }
}

module.exports = {
  executarMigrations,
  exibirStatus,
  CURSOS_OFICIAIS,
};

