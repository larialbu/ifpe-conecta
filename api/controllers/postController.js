const { supabase } = require('../config/supabase');

// 1. Listar Publicações Diretamente do Supabase
async function listarPosts(req, res) {
  try {
    const { categoria, busca } = req.query;

    let query = supabase
      .from('posts')
      .select(`
        id,
        autor_id,
        titulo,
        conteudo,
        categoria,
        likes_count,
        created_at,
        autor:usuarios (id, nome, curso),
        comentarios (
          id,
          conteudo,
          created_at,
          autor:usuarios (id, nome, curso)
        )
      `)
      .order('created_at', { ascending: false });

    if (categoria && categoria !== 'geral') {
      query = query.eq('categoria', categoria.toLowerCase());
    }

    if (busca && busca.trim()) {
      const termo = busca.trim();
      query = query.or(`conteudo.ilike.%${termo}%,titulo.ilike.%${termo}%`);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Erro ao buscar posts no Supabase:', error);
      return res.status(500).json({ error: 'Erro ao carregar publicações do banco de dados.' });
    }

    const formattedPosts = (posts || []).map((post) => ({
      ...post,
      comentarios_count: post.comentarios ? post.comentarios.length : 0,
    }));

    return res.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Erro ao listar posts:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar posts.' });
  }
}

// 2. Criar Nova Publicação no Supabase
async function criarPost(req, res) {
  try {
    const { titulo, conteudo, categoria } = req.body;
    const autor = req.user;

    if (!conteudo || !conteudo.trim()) {
      return res.status(400).json({ error: 'O conteúdo da publicação não pode estar vazio.' });
    }

    const categoriasValidas = ['geral', 'duvidas', 'conselhos', 'avisos', 'projetos'];
    const categoriaNormalizada = (categoria || 'geral').toLowerCase();

    if (!categoriasValidas.includes(categoriaNormalizada)) {
      return res.status(400).json({ error: 'Categoria inválida informada.' });
    }

    const { data: novoPost, error } = await supabase
      .from('posts')
      .insert([
        {
          autor_id: autor.id,
          titulo: titulo ? titulo.trim() : null,
          conteudo: conteudo.trim(),
          categoria: categoriaNormalizada,
          likes_count: 0,
        },
      ])
      .select(`
        id,
        autor_id,
        titulo,
        conteudo,
        categoria,
        likes_count,
        created_at,
        autor:usuarios (id, nome, curso)
      `)
      .single();

    if (error) {
      console.error('Erro ao criar post no Supabase:', error);
      return res.status(500).json({ error: 'Erro ao salvar publicação no banco de dados.' });
    }

    return res.status(201).json({
      message: 'Publicação criada com sucesso!',
      post: {
        ...novoPost,
        comentarios: [],
        comentarios_count: 0,
      },
    });
  } catch (error) {
    console.error('Erro ao criar post:', error);
    return res.status(500).json({ error: 'Erro interno ao criar publicação.' });
  }
}

// 3. Curtir / Descurtir Publicação no Supabase
async function curtirPost(req, res) {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    const { data: curtidaExistente, error: errCurtida } = await supabase
      .from('curtidas')
      .select('id')
      .eq('post_id', id)
      .eq('usuario_id', usuarioId)
      .maybeSingle();

    if (errCurtida) {
      console.error('Erro ao verificar curtida no Supabase:', errCurtida);
      return res.status(500).json({ error: 'Erro ao consultar curtida.' });
    }

    let novoLikesCount = 0;

    if (curtidaExistente) {
      await supabase
        .from('curtidas')
        .delete()
        .eq('post_id', id)
        .eq('usuario_id', usuarioId);

      const { data: postAtual } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', id)
        .single();

      novoLikesCount = Math.max(0, (postAtual?.likes_count || 1) - 1);

      await supabase
        .from('posts')
        .update({ likes_count: novoLikesCount })
        .eq('id', id);

      return res.json({
        message: 'Voto removido.',
        likes_count: novoLikesCount,
        liked: false,
      });
    } else {
      await supabase
        .from('curtidas')
        .insert([{ post_id: id, usuario_id: usuarioId }]);

      const { data: postAtual } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', id)
        .single();

      novoLikesCount = (postAtual?.likes_count || 0) + 1;

      await supabase
        .from('posts')
        .update({ likes_count: novoLikesCount })
        .eq('id', id);

      return res.json({
        message: 'Publicação apoiada!',
        likes_count: novoLikesCount,
        liked: true,
      });
    }
  } catch (error) {
    console.error('Erro ao curtir post:', error);
    return res.status(500).json({ error: 'Erro interno ao processar voto.' });
  }
}

// 4. Adicionar Comentário no Supabase
async function adicionarComentario(req, res) {
  try {
    const { id } = req.params;
    const { conteudo } = req.body;
    const autor = req.user;

    if (!conteudo || !conteudo.trim()) {
      return res.status(400).json({ error: 'O comentário não pode estar vazio.' });
    }

    const { data: novoComentario, error } = await supabase
      .from('comentarios')
      .insert([
        {
          post_id: id,
          autor_id: autor.id,
          conteudo: conteudo.trim(),
        },
      ])
      .select(`
        id,
        post_id,
        conteudo,
        created_at,
        autor:usuarios (id, nome, curso)
      `)
      .single();

    if (error) {
      console.error('Erro ao comentar no Supabase:', error);
      return res.status(500).json({ error: 'Erro ao salvar comentário no banco de dados.' });
    }

    return res.status(201).json({
      message: 'Comentário publicado com sucesso!',
      comentario: novoComentario,
    });
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    return res.status(500).json({ error: 'Erro interno ao adicionar comentário.' });
  }
}

// 5. Listar Comentários no Supabase
async function listarComentarios(req, res) {
  try {
    const { id } = req.params;

    const { data: comentarios, error } = await supabase
      .from('comentarios')
      .select(`
        id,
        post_id,
        conteudo,
        created_at,
        autor:usuarios (id, nome, curso)
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao listar comentários no Supabase:', error);
      return res.status(500).json({ error: 'Erro ao carregar comentários do banco de dados.' });
    }

    return res.json({ comentarios: comentarios || [] });
  } catch (error) {
    console.error('Erro ao listar comentários:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar comentários.' });
  }
}

module.exports = {
  listarPosts,
  criarPost,
  curtirPost,
  adicionarComentario,
  listarComentarios,
};
