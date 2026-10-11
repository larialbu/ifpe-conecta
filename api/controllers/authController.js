const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// 1. Cadastro Direto no Banco (sem confirmação de e-mail)
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

    // 1.1 Verificar no banco se a conta já existe
    const { data: usuarioExistente, error: errBusca } = await supabase
      .from('usuarios')
      .select('id, email')
      .eq('email', emailTratado)
      .maybeSingle();

    if (errBusca) {
      console.error('Erro ao consultar usuário existente:', errBusca);
      return res.status(500).json({ error: 'Erro ao validar e-mail no banco de dados.' });
    }

    if (usuarioExistente) {
      return res.status(409).json({
        error: 'Já existe uma conta cadastrada com este e-mail. Por favor, acesse a tela de login.',
      });
    }

    // 1.2 Inserir novo usuário diretamente no Supabase como ativo
    const { data: novoUsuario, error: insertError } = await supabase
      .from('usuarios')
      .insert([
        {
          nome: nome.trim(),
          email: emailTratado,
          curso: curso.trim(),
          senha: senhaHash,
          email_verificado: true,
        },
      ])
      .select('id, nome, email, curso, created_at')
      .single();

    if (insertError) {
      console.error('Erro ao cadastrar no Supabase:', insertError);
      return res.status(500).json({ error: 'Erro ao cadastrar usuário no banco de dados.' });
    }

    // 1.3 Gerar token de autenticação imediato para entrar direto
    const token = jwt.sign(
      { id: novoUsuario.id, nome: novoUsuario.nome, email: novoUsuario.email, curso: novoUsuario.curso },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Conta criada com sucesso! Bem-vindo(a) ao IFPE Olinda Conecta.',
      usuario: novoUsuario,
      token,
    });
  } catch (error) {
    console.error('Erro no controller de registro:', error);
    return res.status(500).json({ error: 'Erro interno ao processar cadastro.' });
  }
}

// 2. Login Direto (sem bloqueio de confirmação de e-mail)
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

// 3. Perfil do Usuário Autenticado
async function me(req, res) {
  try {
    return res.json({ usuario: req.user });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao obter dados do usuário.' });
  }
}

// 4. Atualizar Perfil no Supabase
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
  me,
  atualizarPerfil,
};
