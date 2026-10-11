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
};
