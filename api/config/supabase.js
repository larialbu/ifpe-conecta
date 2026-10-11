const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('exemplo-supabase') || supabaseKey.includes('exemplo-chave')) {
  console.warn('\n⚠️ [SUPABASE ATENÇÃO] Variáveis SUPABASE_URL ou SUPABASE_KEY não configuradas no .env');
  console.warn('👉 Para persistir dados no Supabase, configure o arquivo .env com as credenciais do seu projeto.\n');
}

try {
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
} catch (error) {
  console.error('Erro ao inicializar cliente Supabase:', error.message);
}

module.exports = { supabase };
