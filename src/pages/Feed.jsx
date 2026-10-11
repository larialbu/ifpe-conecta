import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Navbar } from '../components/Navbar';
import { SidebarCategorias } from '../components/SidebarCategorias';
import { PostBox } from '../components/PostBox';
import { PostCard } from '../components/PostCard';
import { WidgetsSidebar } from '../components/WidgetsSidebar';
import {
  RefreshCw,
  MessageSquareDashed,
  Filter,
  Compass,
  HelpCircle,
  Lightbulb,
  Megaphone,
  Rocket
} from 'lucide-react';
import { PerfilModal } from '../components/PerfilModal';

const CATEGORIAS_MOBILE = [
  { id: 'geral', label: 'Geral', icon: Compass, color: '#16a34a' },
  { id: 'duvidas', label: 'Dúvidas', icon: HelpCircle, color: '#0284c7' },
  { id: 'conselhos', label: 'Conselhos', icon: Lightbulb, color: '#d97706' },
  { id: 'avisos', label: 'Avisos', icon: Megaphone, color: '#dc2626' },
  { id: 'projetos', label: 'Projetos', icon: Rocket, color: '#7c3aed' },
];

export function Feed() {
  const [posts, setPosts] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState('geral');
  const [termoBusca, setTermoBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [perfilModalAberto, setPerfilModalAberto] = useState(false);

  // Carregar publicações
  const carregarPosts = useCallback(async (categoria, busca) => {
    try {
      setCarregando(true);
      setErro('');
      const data = await api.getPosts(categoria, busca);
      setPosts(data);
    } catch (err) {
      console.error('Erro ao buscar posts:', err);
      setErro(err.message || 'Erro ao carregar o feed.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarPosts(categoriaAtiva, termoBusca);
  }, [categoriaAtiva, termoBusca, carregarPosts]);

  // Contagem de posts por categoria para a Sidebar
  const postsCountPorCategoria = React.useMemo(() => {
    const counts = { geral: posts.length, duvidas: 0, conselhos: 0, avisos: 0, projetos: 0 };
    posts.forEach((p) => {
      if (counts[p.categoria] !== undefined) {
        counts[p.categoria] += 1;
      }
    });
    return counts;
  }, [posts]);

  // Handler para criar publicação
  async function handleCriarPost(novoPostPayload) {
    const postCriado = await api.createPost(novoPostPayload);
    // Adiciona no topo do feed
    setPosts((prev) => [postCriado, ...prev]);
  }

  // Handler para curtir
  async function handleLike(postId) {
    return await api.likePost(postId);
  }

  // Handler para novo comentário
  async function handleAddComment(postId, conteudo) {
    const comentario = await api.addComentario(postId, conteudo);
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          const comentariosExistentes = p.comentarios || [];
          return {
            ...p,
            comentarios: [...comentariosExistentes, comentario],
            comentarios_count: (p.comentarios_count || 0) + 1,
          };
        }
        return p;
      })
    );
    return comentario;
  }

  return (
    <div style={styles.pageWrapper}>
      {/* Navbar Superior */}
      <Navbar
        termoBusca={termoBusca}
        setTermoBusca={setTermoBusca}
        onSelectCategoria={(cat) => setCategoriaAtiva(cat)}
        onOpenPerfil={() => setPerfilModalAberto(true)}
      />

      {/* Modal de Perfil e Edição de Dados */}
      <PerfilModal
        isOpen={perfilModalAberto}
        onClose={() => setPerfilModalAberto(false)}
      />

      {/* Conteúdo Principal com Layout Fluido e Responsivo */}
      <main style={styles.mainContainer} className="feed-layout">
        {/* Coluna 1: Sidebar Esquerda (Desktop) */}
        <div style={styles.leftColumn} className="sidebar-column">
          <SidebarCategorias
            categoriaAtiva={categoriaAtiva}
            onSelectCategoria={(cat) => setCategoriaAtiva(cat)}
            postsCountPorCategoria={postsCountPorCategoria}
          />
        </div>

        {/* Coluna 2: Centro (PostBox + Feed de Notícias) */}
        <div style={styles.centerColumn}>
          {/* Navegação horizontal por Categorias no Mobile */}
          <div className="mobile-category-bar mobile-only">
            {CATEGORIAS_MOBILE.map((cat) => {
              const Icon = cat.icon;
              const isSelected = categoriaAtiva === cat.id;
              const count = postsCountPorCategoria[cat.id] || 0;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategoriaAtiva(cat.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    backgroundColor: isSelected ? cat.color : 'var(--bg-card)',
                    color: isSelected ? '#ffffff' : 'var(--text-main)',
                    border: '1px solid ' + (isSelected ? cat.color : 'var(--border-color)'),
                    boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={14} color={isSelected ? '#ffffff' : cat.color} />
                  <span>{cat.label}</span>
                  {count > 0 && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--bg-hover)',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Caixa de Criação de Post */}
          <PostBox
            onPostCriado={handleCriarPost}
            categoriaAtiva={categoriaAtiva}
          />

          {/* Barra de Filtro / Status do Feed */}
          <div style={styles.feedStatusBar}>
            <div style={styles.statusLeft}>
              <Filter size={15} color="var(--color-primary)" />
              <span style={styles.statusLabel}>
                Exibindo:{' '}
                <strong>
                  {categoriaAtiva === 'geral'
                    ? 'Feed Geral'
                    : categoriaAtiva === 'duvidas'
                    ? 'Fórum & Dúvidas'
                    : categoriaAtiva === 'conselhos'
                    ? 'Conselhos & Dicas'
                    : categoriaAtiva === 'avisos'
                    ? 'Avisos do Campus'
                    : 'Projetos'}
                </strong>
                {termoBusca && ` • "${termoBusca}"`}
              </span>
            </div>

            <button
              onClick={() => carregarPosts(categoriaAtiva, termoBusca)}
              style={styles.refreshBtn}
              title="Atualizar feed"
            >
              <RefreshCw size={13} className={carregando ? 'spin-animation' : ''} />
              <span>Atualizar</span>
            </button>
          </div>

          {/* Estado de Carregamento */}
          {carregando && posts.length === 0 && (
            <div style={styles.loadingBox}>
              <div style={styles.spinner}></div>
              <span>Carregando publicações do campus...</span>
            </div>
          )}

          {/* Mensagem de Erro se houver */}
          {erro && (
            <div style={styles.errorBox}>
              <p>{erro}</p>
              <button
                onClick={() => carregarPosts(categoriaAtiva, termoBusca)}
                style={styles.retryBtn}
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Lista de Publicações */}
          <div style={styles.postsList}>
            {!carregando && posts.length === 0 && (
              <div style={styles.emptyState}>
                <MessageSquareDashed size={44} color="var(--text-subtle)" />
                <h4 style={styles.emptyTitle}>Nenhuma publicação encontrada</h4>
                <p style={styles.emptyText}>
                  {termoBusca
                    ? `Não encontramos resultados para "${termoBusca}". Tente outro termo.`
                    : 'Ainda não há postagens nesta categoria. Seja o primeiro a compartilhar algo com seus colegas!'}
                </p>
              </div>
            )}

            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onAddComment={handleAddComment}
              />
            ))}
          </div>
        </div>

        {/* Coluna 3: Sidebar Direita (Widgets rápidos / Links IFPE) */}
        <div style={styles.rightColumn} className="widgets-column">
          <WidgetsSidebar onSelectTag={(tag) => setTermoBusca(tag)} />
        </div>
      </main>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-page)',
    width: '100%',
    overflowX: 'hidden',
  },
  mainContainer: {
    maxWidth: '1240px',
    margin: '20px auto',
    padding: '0 20px',
    display: 'grid',
    gridTemplateColumns: '260px minmax(0, 1fr) 300px',
    gap: '24px',
    alignItems: 'start',
    width: '100%',
  },
  leftColumn: {
    position: 'sticky',
    top: '74px',
  },
  centerColumn: {
    minWidth: 0,
    width: '100%',
  },
  rightColumn: {
    position: 'sticky',
    top: '74px',
  },
  feedStatusBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    marginBottom: '14px',
    fontSize: '0.8rem',
    gap: '8px',
    flexWrap: 'wrap',
  },
  statusLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--text-secondary)',
    flex: '1',
    minWidth: '180px',
  },
  statusLabel: {
    fontSize: '0.78rem',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: 'var(--color-primary)',
    fontWeight: '700',
    fontSize: '0.75rem',
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-hover)',
    border: '1px solid var(--border-color)',
  },
  postsList: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '36px 16px',
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-muted)',
    fontSize: '0.86rem',
  },
  spinner: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    border: '3px solid var(--border-color)',
    borderTopColor: 'var(--color-primary)',
    animation: 'spin 0.8s linear infinite',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px 18px',
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px dashed var(--border-color)',
  },
  emptyTitle: {
    fontSize: '0.96rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginTop: '10px',
    marginBottom: '4px',
  },
  emptyText: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    maxWidth: '360px',
    lineHeight: '1.4',
  },
  errorBox: {
    backgroundColor: 'var(--color-accent-light)',
    color: 'var(--color-accent)',
    padding: '14px',
    borderRadius: 'var(--radius-md)',
    marginBottom: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.84rem',
  },
  retryBtn: {
    backgroundColor: 'var(--color-accent)',
    color: '#ffffff',
    padding: '5px 10px',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '600',
    fontSize: '0.76rem',
  },
};
