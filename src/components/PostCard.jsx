import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  HelpCircle,
  Lightbulb,
  Megaphone,
  Rocket,
  Compass,
  Clock,
  UserCheck
} from 'lucide-react';

const CATEGORIAS_CONFIG = {
  geral: { label: 'Geral', color: '#16a34a', bg: '#dcfce7', icon: Compass },
  duvidas: { label: 'Dúvida', color: '#0284c7', bg: '#e0f2fe', icon: HelpCircle },
  conselhos: { label: 'Conselho', color: '#d97706', bg: '#fef3c7', icon: Lightbulb },
  avisos: { label: 'Aviso Campus', color: '#dc2626', bg: '#fee2e2', icon: Megaphone },
  projetos: { label: 'Projeto', color: '#7c3aed', bg: '#ede9fe', icon: Rocket },
};

function formatarTempo(dataString) {
  if (!dataString) return '';
  const agora = new Date();
  const postDate = new Date(dataString);
  const diffSegundos = Math.floor((agora - postDate) / 1000);

  if (diffSegundos < 60) return 'Agora mesmo';
  const diffMinutos = Math.floor(diffSegundos / 60);
  if (diffMinutos < 60) return `Há ${diffMinutos} min`;
  const diffHoras = Math.floor(diffMinutos / 60);
  if (diffHoras < 24) return `Há ${diffHoras}h`;
  const diffDias = Math.floor(diffHoras / 24);
  if (diffDias === 1) return 'Ontem';
  if (diffDias < 7) return `Há ${diffDias} dias`;

  return postDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function PostCard({ post, onLike, onAddComment }) {
  const { user } = useAuth();
  const [comentariosAbertos, setComentariosAbertos] = useState(false);
  const [novoComentario, setNovoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [curtidoLocal, setCurtidoLocal] = useState(false);
  const [likesContagem, setLikesContagem] = useState(post.likes_count || 0);

  const categoriaInfo = CATEGORIAS_CONFIG[post.categoria] || CATEGORIAS_CONFIG.geral;
  const CategoryIcon = categoriaInfo.icon;

  async function handleCurtir() {
    try {
      // Otimista
      const novoEstado = !curtidoLocal;
      setCurtidoLocal(novoEstado);
      setLikesContagem((prev) => (novoEstado ? prev + 1 : Math.max(0, prev - 1)));

      const resultado = await onLike(post.id);
      if (resultado) {
        setLikesContagem(resultado.likes_count);
        setCurtidoLocal(resultado.liked);
      }
    } catch (err) {
      // Reverte em caso de erro
      setCurtidoLocal(!curtidoLocal);
      setLikesContagem(post.likes_count || 0);
    }
  }

  async function handleEnviarComentario(e) {
    e.preventDefault();
    if (!novoComentario.trim()) return;

    try {
      setEnviandoComentario(true);
      await onAddComment(post.id, novoComentario.trim());
      setNovoComentario('');
      setComentariosAbertos(true);
    } catch (err) {
      alert(err.message || 'Erro ao publicar resposta.');
    } finally {
      setEnviandoComentario(false);
    }
  }

  const comentarios = post.comentarios || [];
  const autorNome = post.autor?.nome || 'Estudante IFPE';
  const autorCurso = post.autor?.curso || 'Campus Olinda';
  const iniciais = autorNome.charAt(0).toUpperCase();

  return (
    <article style={styles.card} className="animate-fade-in">
      {/* Cabeçalho do Card */}
      <div style={styles.header}>
        <div style={styles.authorWrapper}>
          <div style={styles.avatar}>{iniciais}</div>
          <div style={styles.authorDetails}>
            <div style={styles.authorTopRow}>
              <span style={styles.authorName}>{autorNome}</span>
              <span style={styles.dotSeparator}>•</span>
              <span style={styles.timeTag}>
                <Clock size={12} style={{ marginRight: '3px' }} />
                {formatarTempo(post.created_at)}
              </span>
            </div>
            <div style={styles.authorCourse}>{autorCurso}</div>
          </div>
        </div>

        {/* Badge da Categoria */}
        <div
          style={{
            ...styles.categoryBadge,
            backgroundColor: categoriaInfo.bg,
            color: categoriaInfo.color,
          }}
        >
          <CategoryIcon size={13} />
          <span>{categoriaInfo.label}</span>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={styles.body}>
        {post.titulo && <h3 style={styles.title}>{post.titulo}</h3>}
        <p style={styles.content}>{post.conteudo}</p>
      </div>

      {/* Ações / Barra de Interação */}
      <div style={styles.actionsBar}>
        <button
          onClick={handleCurtir}
          style={{
            ...styles.actionBtn,
            color: curtidoLocal ? 'var(--color-accent)' : 'var(--text-secondary)',
          }}
          title="Apoiar publicação"
        >
          <Heart
            size={18}
            fill={curtidoLocal ? 'var(--color-accent)' : 'none'}
            color={curtidoLocal ? 'var(--color-accent)' : 'currentColor'}
          />
          <span style={styles.actionCount}>
            {likesContagem} {likesContagem === 1 ? 'apoio' : 'apoios'}
          </span>
        </button>

        <button
          onClick={() => setComentariosAbertos(!comentariosAbertos)}
          style={{
            ...styles.actionBtn,
            color: comentariosAbertos ? 'var(--color-primary)' : 'var(--text-secondary)',
          }}
          title="Ver e adicionar respostas"
        >
          <MessageCircle size={18} />
          <span style={styles.actionCount}>
            {post.comentarios_count ?? comentarios.length}{' '}
            {(post.comentarios_count ?? comentarios.length) === 1 ? 'resposta' : 'respostas'}
          </span>
        </button>
      </div>

      {/* Seção Expansível de Comentários */}
      {comentariosAbertos && (
        <div style={styles.commentsSection}>
          {/* Campo para Novo Comentário */}
          <form onSubmit={handleEnviarComentario} style={styles.commentInputRow}>
            <div style={styles.commentAvatarMini}>
              {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={styles.inputContainer}>
              <input
                type="text"
                placeholder="Escreva uma resposta para este tópico..."
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                style={styles.commentInput}
              />
              <button
                type="submit"
                disabled={enviandoComentario || !novoComentario.trim()}
                style={styles.commentSendBtn}
                title="Publicar resposta"
              >
                <Send size={14} />
              </button>
            </div>
          </form>

          {/* Lista de Respostas */}
          {comentarios.length > 0 ? (
            <div style={styles.commentsList}>
              {comentarios.map((com) => {
                const autorComNome = com.autor?.nome || 'Estudante';
                const autorComCurso = com.autor?.curso || 'IFPE Olinda';
                return (
                  <div key={com.id} style={styles.commentItem}>
                    <div style={styles.commentItemAvatar}>
                      {autorComNome.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.commentBubble}>
                      <div style={styles.commentBubbleHeader}>
                        <span style={styles.commentAuthor}>{autorComNome}</span>
                        <span style={styles.commentTime}>{formatarTempo(com.created_at)}</span>
                      </div>
                      <div style={styles.commentAuthorCourse}>{autorComCurso}</div>
                      <p style={styles.commentText}>{com.conteudo}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={styles.noCommentsNotice}>
              Nenhuma resposta ainda. Seja o primeiro a responder e ajudar a comunidade!
            </div>
          )}
        </div>
      )}
    </article>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
    padding: '16px',
    boxShadow: 'var(--shadow-sm)',
    marginBottom: '14px',
    transition: 'border-color 0.2s',
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '12px',
  },
  authorWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '1rem',
  },
  authorDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  authorTopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  authorName: {
    fontSize: '0.92rem',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  dotSeparator: {
    color: 'var(--text-subtle)',
    fontSize: '0.8rem',
  },
  timeTag: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  authorCourse: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '1px',
  },
  categoryBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.74rem',
    fontWeight: '700',
  },
  body: {
    marginBottom: '16px',
  },
  title: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginBottom: '8px',
    lineHeight: '1.3',
  },
  content: {
    fontSize: '0.92rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
  },
  actionsBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '12px',
    flexWrap: 'wrap',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.82rem',
    fontWeight: '600',
    padding: '6px 8px',
    borderRadius: 'var(--radius-sm)',
    transition: 'all 0.15s ease',
  },
  actionCount: {
    fontSize: '0.82rem',
  },
  commentsSection: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  commentInputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  commentAvatarMini: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.8rem',
    flexShrink: 0,
  },
  inputContainer: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  commentInput: {
    width: '100%',
    padding: '8px 40px 8px 14px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-input)',
    color: 'var(--text-main)',
    fontSize: '0.84rem',
    outline: 'none',
  },
  commentSendBtn: {
    position: 'absolute',
    right: '6px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  commentItem: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  commentItemAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-hover)',
    color: 'var(--text-main)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.75rem',
    flexShrink: 0,
    marginTop: '2px',
  },
  commentBubble: {
    backgroundColor: 'var(--bg-card-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '8px 12px',
    flex: 1,
    border: '1px solid var(--border-color)',
  },
  commentBubbleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentAuthor: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  commentTime: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
  commentAuthorCourse: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    marginBottom: '4px',
  },
  commentText: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  noCommentsNotice: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    padding: '4px 0',
  },
};
