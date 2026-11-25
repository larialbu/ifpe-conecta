const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const { sendVerificationEmail } = require('../services/emailService');

function getAppOrigin(req) {
  return (
    req.headers.origin ||
    (req.headers.referer ? req.headers.referer.replace(/\/$/, '') : null) ||
    process.env.APP_URL ||
    'http://localhost:3000'
  );
}

// 1. Cadastro de Estudante com Envio Obrigatório de E-mail de Ativação
async function register(req, res) {
  try {
    const { nome, email, curso, senha } = req.body;

    if (!nome || !email || !curso || !senha) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const emailTratado = email.trim().toLowerCase();
    const isDiscenteEmail = emailTratado.endsWith('@discente.ifpe.edu.br') || emailTratado.endsWith('@ifpe.edu.br');
    if (!isDiscenteEmail) {
      return res.status(400).json({
        error: 'É obrigatório utilizar o e-mail institucional (@discente.ifpe.edu.br).',
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({ error: 'A senha deve conter no mínimo 6 caracteres.' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Gerar token de verificação criptográfico com validade de 24 horas
    const tokenVerificacao = crypto.randomBytes(32).toString('hex');
    const tokenExpira = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const origin = getAppOrigin(req);
    const confirmationUrl = `${origin}/?token_confirmacao=${tokenVerificacao}`;

    // 1.1 Verificar no banco se a conta já existe
    const { data: usuarioExistente, error: errBusca } = await supabase
      .from('usuarios')
      .select('id, email, email_verificado')
      .eq('email', emailTratado)
      .maybeSingle();

    if (errBusca) {
      console.error('Erro ao consultar usuário existente:', errBusca);
      return res.status(500).json({ error: 'Erro ao validar e-mail no banco de dados.' });
    }

    if (usuarioExistente) {
      if (usuarioExistente.email_verificado) {
        return res.status(409).json({
          error: 'Já existe uma conta ativa cadastrada com este e-mail. Por favor, acesse a tela de login.',
        });
      }

      // Se a conta já existe mas o e-mail ainda não foi confirmado, renova o token e reenvia o e-mail
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          nome: nome.trim(),
          curso: curso.trim(),
          senha: senhaHash,
          token_verificacao: tokenVerificacao,
          token_verificacao_expira: tokenExpira,
        })
        .eq('id', usuarioExistente.id);

      if (updateError) {
        console.error('Erro ao atualizar cadastro pendente:', updateError);
        return res.status(500).json({ error: 'Erro ao atualizar dados no banco de dados.' });
      }

      await sendVerificationEmail({
        to: emailTratado,
        nome: nome.trim(),
        confirmationUrl,
      });

      return res.status(200).json({
        message: 'Sua conta já havia sido pré-cadastrada! Reenviamos o link de ativação para o seu e-mail institucional.',
        email: emailTratado,
        aguardandoConfirmacao: true,
      });
    }

    // 1.2 Inserir novo usuário no Supabase com email_verificado = FALSE
    const { data: novoUsuario, error: insertError } = await supabase
      .from('usuarios')
      .insert([
        {
          nome: nome.trim(),
          email: emailTratado,
          curso: curso.trim(),
          senha: senhaHash,
          tipo: 'usuario',
          email_verificado: false,
          token_verificacao: tokenVerificacao,
          token_verificacao_expira: tokenExpira,
        },
      ])
      .select('id, nome, email, curso, tipo, email_verificado, created_at')
      .single();

    if (insertError) {
      console.error('Erro ao cadastrar no Supabase:', insertError);
      return res.status(500).json({ error: 'Erro ao cadastrar usuário no banco de dados.' });
    }

    // 1.3 Despachar o e-mail oficial de ativação com o template do IFPE Chega Junto
    await sendVerificationEmail({
      to: emailTratado,
      nome: nome.trim(),
      confirmationUrl,
    });

    return res.status(201).json({
      message: 'Cadastro realizado com sucesso! Enviamos um link de ativação para o seu e-mail institucional.',
      email: emailTratado,
      aguardandoConfirmacao: true,
      usuario: novoUsuario,
    });
  } catch (error) {
    console.error('Erro no controller de registro:', error);
    return res.status(500).json({ error: 'Erro interno ao processar cadastro.' });
  }
}

// 2. Login com Bloqueio de Contas Não Ativadas
async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const emailTratado = email.trim().toLowerCase();
    const adminEmailEnv = (process.env.ADMIN_EMAIL || 'admin@ifpe.edu.br').trim().toLowerCase();
    const adminSenhaEnv = process.env.ADMIN_PASSWORD || 'admin123';

    let usuario = null;

    if (supabase) {
      const { data: usuarioDb, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', emailTratado)
        .maybeSingle();

      if (usuarioDb) {
        const senhaValida = await bcrypt.compare(senha, usuarioDb.senha);
        if (senhaValida) {
          usuario = usuarioDb;
        }
      }
    }

    // Fallback: Se o admin configurado no .env fizer login no sistema principal
    if (!usuario && emailTratado === adminEmailEnv && senha === adminSenhaEnv) {
      usuario = {
        id: '00000000-0000-0000-0000-000000000001',
        nome: 'Administrador IFPE',
        email: adminEmailEnv,
        curso: 'Produção em Multimídia',
        bio: 'Coordenação e Administração Geral',
        tipo: 'admin',
        email_verificado: true,
        created_at: new Date().toISOString(),
      };
    }

    if (!usuario) {
      return res.status(401).json({ error: 'E-mail institucional ou senha incorretos.' });
    }

    // 🔒 BLOQUEIO: Se o e-mail não tiver sido verificado ainda
    if (usuario.email_verificado === false && usuario.tipo !== 'admin') {
      return res.status(403).json({
        error: 'Sua conta ainda não foi ativada. Enviamos um link de confirmação para o seu e-mail institucional. Por favor, acesse seu e-mail e clique no link para liberar o seu acesso.',
        naoVerificado: true,
        email: usuario.email,
      });
    }

    const tipoUsuario = usuario.tipo || 'usuario';

    const token = jwt.sign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        curso: usuario.curso,
        tipo: tipoUsuario,
        role: tipoUsuario === 'admin' ? 'admin' : 'user',
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login realizado com sucesso!',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        curso: usuario.curso,
        bio: usuario.bio,
        tipo: tipoUsuario,
        email_verificado: usuario.email_verificado !== false,
        created_at: usuario.created_at,
      },
      token,
    });
  } catch (error) {
    console.error('Erro no controller de login:', error);
    return res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
}

// 3. Confirmar E-mail através do Token clicado pelo estudante
async function confirmarEmail(req, res) {
  try {
    const token = req.body?.token || req.query?.token;

    if (!token) {
      return res.status(400).json({ error: 'Token de confirmação não informado.' });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Cliente Supabase não configurado.' });
    }

    // Buscar usuário pelo token de verificação
    const { data: usuario, error: errBusca } = await supabase
      .from('usuarios')
      .select('*')
      .eq('token_verificacao', token)
      .maybeSingle();

    if (errBusca || !usuario) {
      // Se o token já foi consumido, a conta já foi ativada com sucesso
      return res.json({
        jaConfirmado: true,
        message: 'Esta conta já foi confirmada e está liberada! Você já pode acessar a plataforma.',
      });
    }

    // Verificar se o token expirou (validade de 24h)
    if (usuario.token_verificacao_expira && new Date(usuario.token_verificacao_expira) < new Date()) {
      return res.status(400).json({
        error: 'O link de confirmação expirou (validade de 24 horas). Solicite um novo link na tela de login.',
      });
    }

    // Marcar como ativo/liberado no banco de dados e limpar o token usado
    const { data: usuarioAtualizado, error: updateError } = await supabase
      .from('usuarios')
      .update({
        email_verificado: true,
        token_verificacao: null,
        token_verificacao_expira: null,
      })
      .eq('id', usuario.id)
      .select('id, nome, email, curso, bio, tipo, email_verificado, created_at')
      .single();

    if (updateError) {
      console.error('Erro ao ativar conta no Supabase:', updateError);
      return res.status(500).json({ error: 'Erro ao ativar conta no banco de dados.' });
    }

    const tipoUsuario = usuarioAtualizado.tipo || 'usuario';

    // Gerar token de sessão para que o estudante entre logado direto após a confirmação
    const sessionToken = jwt.sign(
      {
        id: usuarioAtualizado.id,
        nome: usuarioAtualizado.nome,
        email: usuarioAtualizado.email,
        curso: usuarioAtualizado.curso,
        tipo: tipoUsuario,
        role: tipoUsuario === 'admin' ? 'admin' : 'user',
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`[CONTA ATIVADA] Estudante confirmado com sucesso: ${usuarioAtualizado.nome} (${usuarioAtualizado.email})`);

    return res.json({
      message: 'Conta ativada com sucesso! Bem-vindo(a) ao IFPE Chega Junto.',
      token: sessionToken,
      usuario: usuarioAtualizado,
    });
  } catch (err) {
    console.error('Erro ao confirmar e-mail:', err);
    return res.status(500).json({ error: 'Erro interno ao processar validação de e-mail.' });
  }
}

// 4. Reenviar Link de Confirmação
async function reenviarConfirmacao(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'E-mail não informado.' });
    }

    const emailTratado = email.trim().toLowerCase();

    const { data: usuario, error: errBusca } = await supabase
      .from('usuarios')
      .select('id, nome, email, email_verificado')
      .eq('email', emailTratado)
      .maybeSingle();

    if (errBusca || !usuario) {
      return res.status(404).json({ error: 'Nenhuma conta encontrada com este e-mail institucional.' });
    }

    if (usuario.email_verificado) {
      return res.status(400).json({ error: 'Esta conta já foi ativada. Você já pode fazer login normalmente.' });
    }

    const tokenVerificacao = crypto.randomBytes(32).toString('hex');
    const tokenExpira = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const origin = getAppOrigin(req);
    const confirmationUrl = `${origin}/?token_confirmacao=${tokenVerificacao}`;

    const { error: updateError } = await supabase
      .from('usuarios')
      .update({
        token_verificacao: tokenVerificacao,
        token_verificacao_expira: tokenExpira,
      })
      .eq('id', usuario.id);

    if (updateError) {
      return res.status(500).json({ error: 'Erro ao gerar novo código de ativação.' });
    }

    await sendVerificationEmail({
      to: emailTratado,
      nome: usuario.nome,
      confirmationUrl,
    });

    return res.json({
      message: 'Novo link de ativação enviado com sucesso para seu e-mail institucional!',
    });
  } catch (err) {
    console.error('Erro ao reenviar confirmação:', err);
    return res.status(500).json({ error: 'Erro ao processar reenvio de confirmação.' });
  }
}

// 5. Perfil do Usuário Autenticado
async function me(req, res) {
  try {
    return res.json({ usuario: req.user });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao obter dados do usuário.' });
  }
}

// 6. Atualizar Perfil no Supabase
async function atualizarPerfil(req, res) {
  try {
    const usuarioId = req.user.id;
    const { nome, curso, bio, novaSenha } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'O nome não pode estar vazio.' });
    }

    if (!curso || !curso.trim()) {
      return res.status(400).json({ error: 'O curso não pode estar vazio.' });
    }

    let senhaHashNova = null;
    if (novaSenha && novaSenha.trim()) {
      if (novaSenha.trim().length < 6) {
        return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
      }
      const salt = await bcrypt.genSalt(10);
      senhaHashNova = await bcrypt.hash(novaSenha.trim(), salt);
    }

    const dadosAtualizacao = {
      nome: nome.trim(),
      curso: curso.trim(),
      bio: bio !== undefined ? (bio ? bio.trim() : null) : undefined,
    };

    if (senhaHashNova) {
      dadosAtualizacao.senha = senhaHashNova;
    }

    const { data: usuarioAtualizado, error } = await supabase
      .from('usuarios')
      .update(dadosAtualizacao)
      .eq('id', usuarioId)
      .select('id, nome, email, curso, bio, tipo, created_at')
      .single();

    if (error) {
      console.error('Erro ao atualizar no Supabase:', error);
      return res.status(500).json({ error: 'Erro ao atualizar dados no banco de dados.' });
    }

    const token = jwt.sign(
      {
        id: usuarioAtualizado.id,
        nome: usuarioAtualizado.nome,
        email: usuarioAtualizado.email,
        curso: usuarioAtualizado.curso,
        tipo: usuarioAtualizado.tipo || 'usuario',
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Perfil atualizado com sucesso!',
      usuario: usuarioAtualizado,
      token,
    });
  } catch (error) {
    console.error('Erro no controller de atualização:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar perfil.' });
  }
}

// 7. Obter Perfil Público de Outro Estudante
async function obterPerfilPublico(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'ID do estudante não informado.' });
    }

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, curso, bio, tipo, created_at')
      .eq('id', id)
      .single();

    if (error || !usuario) {
      return res.status(404).json({ error: 'Estudante não encontrado no sistema.' });
    }

    return res.json({ usuario });
  } catch (error) {
    console.error('Erro ao buscar perfil público:', error);
    return res.status(500).json({ error: 'Erro interno ao consultar perfil do estudante.' });
  }
}

module.exports = {
  register,
  login,
  confirmarEmail,
  reenviarConfirmacao,
  me,
  atualizarPerfil,
  obterPerfilPublico,
};
