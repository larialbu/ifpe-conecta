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

// 1. Cadastro com Validação de Duplicidade no Supabase e Envio de E-mail de Ativação
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

    // Gerar token de verificação com validade de 24 horas
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

      // Se já foi pré-cadastrado mas ainda não confirmou, atualiza e reenvia
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
        message: 'Sua conta já havia sido pré-cadastrada! Reenviamos o link de confirmação para o seu e-mail institucional.',
        email: emailTratado,
        email_enviado: true,
      });
    }

    // Inserir novo usuário como NÃO verificado
    const { data: novoUsuario, error: insertError } = await supabase
      .from('usuarios')
      .insert([
        {
          nome: nome.trim(),
          email: emailTratado,
          curso: curso.trim(),
          senha: senhaHash,
          email_verificado: false,
          token_verificacao: tokenVerificacao,
          token_verificacao_expira: tokenExpira,
        },
      ])
      .select('id, nome, email, curso, email_verificado, created_at')
      .single();

    if (insertError) {
      console.error('Erro ao cadastrar no Supabase:', insertError);
      return res.status(500).json({ error: 'Erro ao cadastrar usuário no banco de dados.' });
    }

    // Disparar e-mail com link de ativação
    await sendVerificationEmail({
      to: emailTratado,
      nome: nome.trim(),
      confirmationUrl,
    });

    return res.status(201).json({
      message: 'Conta criada com sucesso! Enviamos um link de confirmação para o seu e-mail institucional.',
      email: emailTratado,
      email_enviado: true,
    });
  } catch (error) {
    console.error('Erro no controller de registro:', error);
    return res.status(500).json({ error: 'Erro interno ao processar cadastro.' });
  }
}

// 2. Login com Bloqueio de Contas Não Verificadas no Supabase
async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const emailTratado = email.trim().toLowerCase();

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', emailTratado)
      .maybeSingle();

    if (error || !usuario) {
      return res.status(401).json({ error: 'E-mail institucional ou senha incorretos.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'E-mail institucional ou senha incorretos.' });
    }

    // Validação de e-mail verificado: Se não clicou no link, NÃO pode acessar!
    if (!usuario.email_verificado) {
      return res.status(403).json({
        error: 'Sua conta ainda não foi confirmada. Acesse o link enviado para o seu e-mail institucional para ativar o seu acesso.',
        nao_verificado: true,
        email: emailTratado,
      });
    }

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, curso: usuario.curso },
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
        created_at: usuario.created_at,
      },
      token,
    });
  } catch (error) {
    console.error('Erro no controller de login:', error);
    return res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
}

// 3. Confirmar E-mail através do Token clicado no link
async function confirmarEmail(req, res) {
  try {
    const token = req.body?.token || req.query?.token;

    if (!token) {
      return res.status(400).json({ error: 'Token de confirmação não informado.' });
    }

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('token_verificacao', token)
      .maybeSingle();

    if (error || !usuario) {
      return res.status(400).json({
        error: 'Link de confirmação inválido ou já utilizado. Tente fazer login ou solicite um novo link.',
      });
    }

    if (usuario.token_verificacao_expira && new Date(usuario.token_verificacao_expira) < new Date()) {
      return res.status(400).json({
        error: 'O link de confirmação expirou (validade de 24 horas). Solicite um novo link na tela de login.',
      });
    }

    // Marcar como verificado e limpar o token de uso único
    const { data: usuarioAtualizado, error: updateError } = await supabase
      .from('usuarios')
      .update({
        email_verificado: true,
        token_verificacao: null,
        token_verificacao_expira: null,
      })
      .eq('id', usuario.id)
      .select('id, nome, email, curso, bio, created_at')
      .single();

    if (updateError) {
      console.error('Erro ao validar token no Supabase:', updateError);
      return res.status(500).json({ error: 'Erro ao confirmar a conta no banco de dados.' });
    }

    // Autenticar e gerar sessão imediatamente
    const sessionToken = jwt.sign(
      {
        id: usuarioAtualizado.id,
        nome: usuarioAtualizado.nome,
        email: usuarioAtualizado.email,
        curso: usuarioAtualizado.curso,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Conta ativada com sucesso! Bem-vindo(a) ao IFPE Olinda Hub.',
      usuario: usuarioAtualizado,
      token: sessionToken,
    });
  } catch (error) {
    console.error('Erro ao confirmar e-mail:', error);
    return res.status(500).json({ error: 'Erro interno ao validar link de confirmação.' });
  }
}

// 4. Reenviar Link de Confirmação
async function reenviarConfirmacao(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'O e-mail institucional é obrigatório.' });
    }

    const emailTratado = email.trim().toLowerCase();
    const tokenVerificacao = crypto.randomBytes(32).toString('hex');
    const tokenExpira = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const origin = getAppOrigin(req);
    const confirmationUrl = `${origin}/?token_confirmacao=${tokenVerificacao}`;

    const { data: usuario, error: errBusca } = await supabase
      .from('usuarios')
      .select('id, nome, email, email_verificado')
      .eq('email', emailTratado)
      .maybeSingle();

    if (errBusca || !usuario) {
      return res.status(404).json({ error: 'Nenhuma conta encontrada com este e-mail institucional.' });
    }

    if (usuario.email_verificado) {
      return res.status(400).json({
        error: 'Esta conta já foi ativada anteriormente! Você já pode entrar com sua senha.',
      });
    }

    const { error: updateError } = await supabase
      .from('usuarios')
      .update({
        token_verificacao: tokenVerificacao,
        token_verificacao_expira: tokenExpira,
      })
      .eq('id', usuario.id);

    if (updateError) {
      return res.status(500).json({ error: 'Erro ao gerar novo link no banco de dados.' });
    }

    await sendVerificationEmail({
      to: emailTratado,
      nome: usuario.nome,
      confirmationUrl,
    });

    return res.json({
      message: 'Novo link de confirmação enviado para seu e-mail institucional!',
      email: emailTratado,
      email_enviado: true,
    });
  } catch (error) {
    console.error('Erro ao reenviar confirmação:', error);
    return res.status(500).json({ error: 'Erro ao reenviar e-mail de confirmação.' });
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

    const updateData = {
      nome: nome.trim(),
      curso: curso.trim(),
    };

    if (bio !== undefined) {
      updateData.bio = bio ? bio.trim() : null;
    }

    if (senhaHashNova) {
      updateData.senha = senhaHashNova;
    }

    const { data: usuarioAtualizado, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', usuarioId)
      .select('id, nome, email, curso, bio, created_at')
      .single();

    if (error) {
      console.error('Erro ao atualizar perfil no Supabase:', error);
      return res.status(500).json({ error: 'Erro ao salvar alterações no banco de dados.' });
    }

    const token = jwt.sign(
      {
        id: usuarioAtualizado.id,
        nome: usuarioAtualizado.nome,
        email: usuarioAtualizado.email,
        curso: usuarioAtualizado.curso,
        bio: usuarioAtualizado.bio,
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
    console.error('Erro ao atualizar perfil:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar perfil.' });
  }
}

module.exports = {
  register,
  login,
  confirmarEmail,
  reenviarConfirmacao,
  me,
  atualizarPerfil,
};
