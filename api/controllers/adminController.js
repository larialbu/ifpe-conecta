const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { supabase } = require('../config/supabase');
const { sendBroadcastEmail } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_ifpe_olinda_Conecta_jwt_key_2026';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@ifpe.edu.br').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

/**
 * Autenticação do Administrador
 * - Valida se o usuário existe no banco com tipo === 'admin'.
 * - Se for usuário comum (tipo === 'usuario'), bloqueia o acesso informando que ele só pode entrar no sistema principal.
 * - Suporta fallback para as credenciais do .env caso o admin ainda não tenha conta direta no banco.
 */
async function adminLogin(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const emailTratado = email.trim().toLowerCase();

    // 1. Verificar se o usuário existe no banco de dados
    if (supabase) {
      const { data: usuario, error: errBusca } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', emailTratado)
        .maybeSingle();

      if (usuario) {
        // Validação da senha criptografada no banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
          return res.status(401).json({ error: 'Senha incorreta para o painel administrativo.' });
        }

        const tipoUsuario = usuario.tipo || 'usuario';

        // ⚠️ BLOQUEIO DE USUÁRIO COMUM NO PAINEL ADMIN:
        if (tipoUsuario !== 'admin') {
          return res.status(403).json({
            error: 'Acesso negado. Usuários normais só têm permissão de acesso ao sistema principal. Apenas administradores podem acessar este painel.',
          });
        }

        // ✅ É admin no banco! Gera token com role e tipo 'admin'
        const token = jwt.sign(
          {
            id: usuario.id,
            email: usuario.email,
            nome: usuario.nome,
            curso: usuario.curso,
            tipo: 'admin',
            role: 'admin',
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        const adminPayload = {
          id: usuario.id,
          email: usuario.email,
          nome: usuario.nome,
          curso: usuario.curso || 'Produção em Multimídia',
          bio: usuario.bio || '',
          tipo: 'admin',
          role: 'admin',
        };

        return res.json({
          message: 'Login de administrador realizado com sucesso.',
          token,
          admin: adminPayload,
          usuario: adminPayload,
        });
      }
    }

    // 2. Fallback com credenciais de administrador configuradas em variáveis de ambiente (.env)
    if (emailTratado === ADMIN_EMAIL && senha === ADMIN_PASSWORD) {
      const token = jwt.sign(
        {
          email: emailTratado,
          nome: 'Administrador IFPE',
          tipo: 'admin',
          role: 'admin',
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const adminPayload = {
        id: '00000000-0000-0000-0000-000000000001',
        email: emailTratado,
        nome: 'Administrador IFPE',
        curso: 'Produção em Multimídia',
        bio: 'Coordenação e Administração Geral',
        tipo: 'admin',
        role: 'admin',
      };

      return res.json({
        message: 'Login administrativo (.env) realizado com sucesso.',
        token,
        admin: adminPayload,
        usuario: adminPayload,
      });
    }

    return res.status(401).json({ error: 'E-mail ou senha incorretos para o painel de administrador.' });
  } catch (err) {
    console.error('Erro no login do admin:', err);
    return res.status(500).json({ error: 'Erro interno ao realizar autenticação de admin.' });
  }
}

/**
 * Estatísticas e métricas do sistema
 */
async function getStats(req, res) {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Cliente Supabase não está configurado.' });
    }

    // 1. Obter usuários com contagem por curso e por tipo
    let { data: usuarios, error: errUsuarios } = await supabase
      .from('usuarios')
      .select('id, nome, curso, tipo, created_at');

    // Fallback gracioso se a coluna tipo ainda não foi criada no banco
    if (errUsuarios && errUsuarios.message && errUsuarios.message.includes('tipo')) {
      const fallback = await supabase
        .from('usuarios')
        .select('id, nome, curso, created_at');
      usuarios = fallback.data;
      errUsuarios = fallback.error;
    }

    if (errUsuarios) {
      throw errUsuarios;
    }

    const totalUsuarios = usuarios ? usuarios.length : 0;
    let totalAdmins = 0;
    let totalUsuariosComuns = 0;

    // Agrupamento por curso e tipo
    const usuariosPorCurso = {};
    (usuarios || []).forEach(u => {
      const c = u.curso || 'Não informado';
      usuariosPorCurso[c] = (usuariosPorCurso[c] || 0) + 1;

      if (u.tipo === 'admin') {
        totalAdmins++;
      } else {
        totalUsuariosComuns++;
      }
    });

    // 2. Obter total de postagens
    const { count: totalPosts, error: errPosts } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true });

    // 3. Obter total de comentários
    const { count: totalComentarios, error: errComentarios } = await supabase
      .from('comentarios')
      .select('id', { count: 'exact', head: true });

    // 4. Obter total de curtidas
    const { count: totalCurtidas, error: errCurtidas } = await supabase
      .from('curtidas')
      .select('id', { count: 'exact', head: true });

    // Status do serviço de e-mail (se configurado com Gmail ou SMTP)
    const emailConfigurado = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
    const emailRemetente = process.env.SMTP_USER || 'Não configurado';

    return res.json({
      totalUsuarios,
      totalAdmins,
      totalUsuariosComuns,
      totalPosts: totalPosts || 0,
      totalComentarios: totalComentarios || 0,
      totalCurtidas: totalCurtidas || 0,
      usuariosPorCurso,
      emailService: {
        configurado: emailConfigurado,
        remetente: emailRemetente,
      },
    });
  } catch (err) {
    console.error('Erro ao buscar estatísticas do admin:', err);
    return res.status(500).json({ error: 'Erro ao carregar estatísticas do sistema.' });
  }
}

/**
 * Lista todos os usuários cadastrados
 */
async function listarUsuarios(req, res) {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Cliente Supabase não está configurado.' });
    }

    let { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, curso, bio, tipo, email_verificado, created_at')
      .order('created_at', { ascending: false });

    // Fallback gracioso caso alguma coluna nova ainda não tenha sido criada no banco
    if (error && error.message) {
      const fallback = await supabase
        .from('usuarios')
        .select('id, nome, email, curso, bio, created_at')
        .order('created_at', { ascending: false });
      usuarios = (fallback.data || []).map((u) => ({ ...u, tipo: 'usuario', email_verificado: true }));
      error = fallback.error;
    }

    if (error) {
      console.error('Erro retornado pelo Supabase em listarUsuarios:', error);
      throw error;
    }

    return res.json({ usuarios: usuarios || [] });
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    return res.status(500).json({ error: err.message || 'Erro ao listar usuários cadastrados.' });
  }
}

/**
 * Remove um usuário pelo ID (com exclusão em cascata)
 */
async function removerUsuario(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'ID do usuário não informado.' });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Cliente Supabase não configurado.' });
    }

    // Buscar informações do usuário antes de remover
    const { data: usuario, error: errBusca } = await supabase
      .from('usuarios')
      .select('id, nome, email')
      .eq('id', id)
      .maybeSingle();

    if (errBusca) {
      throw errBusca;
    }

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Excluir usuário (ON DELETE CASCADE no banco remove posts, comentários e curtidas)
    const { error: errDelete } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (errDelete) {
      throw errDelete;
    }

    console.log(`[ADMIN] Usuário removido com sucesso: ${usuario.nome} (${usuario.email})`);

    return res.json({
      success: true,
      message: `Usuário "${usuario.nome}" foi removido com sucesso do sistema.`,
      usuarioRemovido: usuario,
    });
  } catch (err) {
    console.error('Erro ao remover usuário:', err);
    return res.status(500).json({ error: 'Erro ao excluir usuário do banco de dados.' });
  }
}

/**
 * Atualiza todos os campos de um usuário cadastrado
 * Permite ao admin editar: nome, email, curso, bio, tipo, email_verificado e senha (opcional)
 */
async function atualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { nome, email, curso, bio, tipo, email_verificado, senha } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID do usuário não informado.' });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Cliente Supabase não configurado.' });
    }

    // 1. Verificar se o usuário existe
    const { data: usuarioExistente, error: errBusca } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (errBusca) {
      throw errBusca;
    }

    if (!usuarioExistente) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // 2. Montar objeto com campos a serem atualizados
    const camposAtualizacao = {};

    if (nome !== undefined) {
      if (!nome.trim()) {
        return res.status(400).json({ error: 'O nome não pode ficar em branco.' });
      }
      camposAtualizacao.nome = nome.trim();
    }

    if (email !== undefined) {
      const emailTratado = email.trim().toLowerCase();
      if (!emailTratado.endsWith('@discente.ifpe.edu.br') && !emailTratado.endsWith('@ifpe.edu.br')) {
        return res.status(400).json({
          error: 'O e-mail institucional precisa pertencer ao domínio @discente.ifpe.edu.br ou @ifpe.edu.br.',
        });
      }

      // Se o e-mail foi alterado, verificar se já não pertence a outro usuário
      if (emailTratado !== usuarioExistente.email) {
        const { data: outroUsuario, error: errEmail } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', emailTratado)
          .neq('id', id)
          .maybeSingle();

        if (errEmail) throw errEmail;
        if (outroUsuario) {
          return res.status(409).json({ error: 'Este e-mail já está sendo utilizado por outro usuário.' });
        }
      }
      camposAtualizacao.email = emailTratado;
    }

    if (curso !== undefined) {
      camposAtualizacao.curso = curso.trim();
    }

    if (bio !== undefined) {
      camposAtualizacao.bio = bio ? bio.trim() : '';
    }

    if (tipo !== undefined) {
      if (tipo !== 'usuario' && tipo !== 'admin') {
        return res.status(400).json({ error: 'Tipo inválido. Deve ser "usuario" ou "admin".' });
      }
      camposAtualizacao.tipo = tipo;
    }

    if (email_verificado !== undefined) {
      const verificadoBool = Boolean(email_verificado);
      camposAtualizacao.email_verificado = verificadoBool;
      if (verificadoBool) {
        camposAtualizacao.token_verificacao = null;
        camposAtualizacao.token_verificacao_expira = null;
      }
    }

    if (senha && senha.trim()) {
      if (senha.trim().length < 6) {
        return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
      }
      const senhaHash = await bcrypt.hash(senha.trim(), 10);
      camposAtualizacao.senha = senhaHash;
    }

    // 3. Atualizar no banco Supabase
    const { data: usuarioAtualizado, error: errUpdate } = await supabase
      .from('usuarios')
      .update(camposAtualizacao)
      .eq('id', id)
      .select('id, nome, email, curso, bio, tipo, email_verificado, created_at')
      .single();

    if (errUpdate) {
      console.error('Erro ao atualizar usuário pelo admin:', errUpdate);
      throw errUpdate;
    }

    console.log(`[ADMIN] Usuário atualizado com sucesso: ${usuarioAtualizado.nome} (${usuarioAtualizado.email})`);

    return res.json({
      success: true,
      message: `Dados do usuário "${usuarioAtualizado.nome}" atualizados com sucesso.`,
      usuario: usuarioAtualizado,
    });
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    return res.status(500).json({ error: err.message || 'Erro ao atualizar dados do usuário.' });
  }
}

/**
 * Disparo em massa de e-mails para estudantes
 */
async function dispararEmail(req, res) {
  try {
    const { assunto, mensagem, filtroCurso, destinatariosIds } = req.body;

    if (!assunto || !mensagem) {
      return res.status(400).json({ error: 'Assunto e mensagem são obrigatórios para o envio.' });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Cliente Supabase não configurado.' });
    }

    let query = supabase.from('usuarios').select('id, nome, email, curso');

    // Filtrar por IDs específicos se fornecido
    if (Array.isArray(destinatariosIds) && destinatariosIds.length > 0) {
      query = query.in('id', destinatariosIds);
    } else if (filtroCurso && filtroCurso !== 'todos') {
      // Filtrar por curso
      query = query.eq('curso', filtroCurso);
    }

    const { data: destinatarios, error: errDestinatarios } = await query;

    if (errDestinatarios) {
      throw errDestinatarios;
    }

    if (!destinatarios || destinatarios.length === 0) {
      return res.status(404).json({ error: 'Nenhum usuário encontrado para os critérios de envio selecionados.' });
    }

    // Enviar para a lista de destinatários
    const resultados = [];
    for (const user of destinatarios) {
      const envio = await sendBroadcastEmail({
        to: user.email,
        subject: assunto,
        message: mensagem,
        destinatarioNome: user.nome,
      });
      resultados.push(envio);
    }

    const totalSucesso = resultados.filter(r => r.success).length;
    const totalFalhas = resultados.length - totalSucesso;

    return res.json({
      success: true,
      message: `Disparo concluído: ${totalSucesso} e-mail(s) enviado(s) com sucesso.`,
      totalDestinatarios: destinatarios.length,
      totalSucesso,
      totalFalhas,
      resultados,
    });
  } catch (err) {
    console.error('Erro ao disparar e-mails:', err);
    return res.status(500).json({ error: 'Erro ao processar disparo de e-mails.' });
  }
}

module.exports = {
  adminLogin,
  getStats,
  listarUsuarios,
  atualizarUsuario,
  removerUsuario,
  dispararEmail,
};

