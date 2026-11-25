const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('ifpe_Conecta_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function getAdminAuthHeaders() {
  // Dá preferência ao token administrativo explícito, ou usa o token discente se o usuário logado for admin
  const token = localStorage.getItem('ifpe_admin_token') || localStorage.getItem('ifpe_Conecta_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Autenticação
  async login(email, senha) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao realizar login.');
    return data;
  },

  async registro(nome, email, curso, senha) {
    const res = await fetch(`${API_BASE_URL}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, curso, senha }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar conta.');
    return data;
  },

  async confirmarEmail(token) {
    const res = await fetch(`${API_BASE_URL}/auth/confirmar-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao validar confirmação de e-mail.');
    return data;
  },

  async reenviarConfirmacao(email) {
    const res = await fetch(`${API_BASE_URL}/auth/reenviar-confirmacao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao reenviar e-mail de confirmação.');
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao autenticar usuário.');
    return data;
  },

  async atualizarPerfil(dados) {
    const res = await fetch(`${API_BASE_URL}/auth/perfil`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(dados),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar dados do perfil.');
    return data;
  },

  async getPerfilPublico(usuarioId) {
    const res = await fetch(`${API_BASE_URL}/auth/usuario/${usuarioId}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao obter dados do estudante.');
    return data.usuario;
  },

  // Publicações
  async getPosts(categoria = 'geral', busca = '') {
    const params = new URLSearchParams();
    if (categoria && categoria !== 'geral') {
      params.append('categoria', categoria);
    }
    if (busca && busca.trim()) {
      params.append('busca', busca.trim());
    }

    const url = `${API_BASE_URL}/posts?${params.toString()}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao buscar publicações.');
    return data.posts || [];
  },

  async createPost({ titulo, conteudo, categoria }) {
    const res = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ titulo, conteudo, categoria }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao publicar.');
    return data.post;
  },

  async likePost(postId) {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao curtir publicação.');
    return data;
  },

  async addComentario(postId, conteudo) {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}/comentarios`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ conteudo }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao enviar resposta.');
    return data.comentario;
  },

  async getComentarios(postId) {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}/comentarios`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao carregar comentários.');
    return data.comentarios || [];
  },

  // Área Administrativa
  async adminLogin(email, senha) {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Falha no login de administrador.');
    if (data.token) {
      localStorage.setItem('ifpe_admin_token', data.token);
      localStorage.setItem('ifpe_Conecta_token', data.token);
    }
    const userPayload = data.admin || data.usuario;
    if (userPayload) {
      localStorage.setItem('ifpe_Conecta_user', JSON.stringify(userPayload));
    }
    return data;
  },

  adminLogout() {
    localStorage.removeItem('ifpe_admin_token');
    localStorage.removeItem('ifpe_Conecta_token');
    localStorage.removeItem('ifpe_Conecta_user');
  },

  async adminGetStats() {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getAdminAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao obter estatísticas.');
    return data;
  },

  async adminListarUsuarios() {
    const res = await fetch(`${API_BASE_URL}/admin/usuarios`, {
      headers: getAdminAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao listar usuários.');
    return data.usuarios || [];
  },

  async adminRemoverUsuario(usuarioId) {
    const res = await fetch(`${API_BASE_URL}/admin/usuarios/${usuarioId}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao remover usuário.');
    return data;
  },

  async adminDispararEmail({ assunto, mensagem, filtroCurso, destinatariosIds }) {
    const res = await fetch(`${API_BASE_URL}/admin/disparar-email`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ assunto, mensagem, filtroCurso, destinatariosIds }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao realizar disparo de e-mails.');
    return data;
  },
};
