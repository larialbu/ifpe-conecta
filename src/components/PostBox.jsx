import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  HelpCircle,
  Lightbulb,
  Megaphone,
  Rocket,
  Compass,
  MessageSquarePlus,
  X
} from 'lucide-react';

const CATEGORIAS_OPCOES = [
  { id: 'geral', label: 'Geral', icon: Compass, color: '#16a34a' },
  { id: 'duvidas', label: 'Fórum & Dúvidas', icon: HelpCircle, color: '#0284c7' },
  { id: 'conselhos', label: 'Conselhos & Dicas', icon: Lightbulb, color: '#d97706' },
  { id: 'avisos', label: 'Avisos do Campus', icon: Megaphone, color: '#dc2626' },
  { id: 'projetos', label: 'Projetos', icon: Rocket, color: '#7c3aed' },
];

export function PostBox({ onPostCriado, categoriaAtiva }) {
  const { user } = useAuth();
  const [expandido, setExpandido] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [categoria, setCategoria] = useState(
    categoriaAtiva && categoriaAtiva !== 'geral' ? categoriaAtiva : 'geral'
  );
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  // Se a categoria externa mudar, atualiza se estiver em 'geral'
  React.useEffect(() => {
    if (categoriaAtiva && categoriaAtiva !== 'geral') {
      setCategoria(categoriaAtiva);
    }
  }, [categoriaAtiva]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!conteudo.trim()) {
      setErro('Por favor, escreva algo antes de publicar.');
      return;
    }

    try {
      setEnviando(true);
      setErro('');
      await onPostCriado({
        titulo: titulo.trim() || null,
        conteudo: conteudo.trim(),
        categoria,
      });
      // Limpar campos
      setTitulo('');
      setConteudo('');
      setExpandido(false);
    } catch (err) {
      setErro(err.message || 'Erro ao publicar.');
    } finally {
      setEnviando(false);
    }
  }

  const primeiroNome = user?.nome ? user.nome.split(' ')[0] : 'Estudante';

  return (
    <div style={styles.card} className="animate-fade-in">
      {!expandido ? (
        <div style={styles.collapsedBox}>
          <div style={styles.avatar}>
            {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
          </div>
          <button
            onClick={() => setExpandido(true)}
            style={styles.triggerBtn}
          >
            No que você está pensando, {primeiroNome}? Comece uma publicação...
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={styles.expandedForm}>
          <div style={styles.formHeader}>
            <div style={styles.authorBadge}>
              <div style={styles.avatarMini}>
                {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <span style={styles.authorName}>{user?.nome}</span>
                <span style={styles.authorCourse}>{user?.curso}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setExpandido(false);
                setErro('');
              }}
              style={styles.closeBtn}
              title="Cancelar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Seleção de Categoria */}
          <div style={styles.categoryPicker}>
            <span style={styles.pickerLabel}>Escolha o espaço:</span>
            <div style={styles.pillsList}>
              {CATEGORIAS_OPCOES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = categoria === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategoria(cat.id)}
                    style={{
                      ...styles.pillBtn,
                      backgroundColor: isSelected ? cat.color : '#f3f4f6',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      borderColor: isSelected ? cat.color : 'transparent',
                    }}
                  >
                    <Icon size={14} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Título Opcional */}
          <input
            type="text"
            placeholder="Título ou resumo do assunto (opcional)"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            style={styles.titleInput}
            maxLength={120}
          />

          {/* Textarea de Conteúdo */}
          <textarea
            placeholder={`Compartilhe dúvidas, oportunidades, projetos ou dicas com o campus Olinda...`}
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            style={styles.textarea}
            rows={4}
            required
            autoFocus
          />

          {erro && <div style={styles.errorMsg}>{erro}</div>}

          <div style={styles.formFooter}>
            <div style={styles.charCount}>
              {conteudo.length} caracteres
            </div>
            <div style={styles.actionButtons}>
              <button
                type="button"
                onClick={() => setExpandido(false)}
                style={styles.cancelBtn}
                disabled={enviando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={styles.submitBtn}
                disabled={enviando || !conteudo.trim()}
              >
                <Send size={15} />
                <span>{enviando ? 'Publicando...' : 'Publicar'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Botões de Acesso Rápido na visão minimizada */}
      {!expandido && (
        <div style={styles.quickActions}>
          <button
            onClick={() => {
              setCategoria('duvidas');
              setExpandido(true);
            }}
            style={styles.quickActionBtn}
          >
            <HelpCircle size={16} color="#0284c7" />
            <span>Tirar Dúvida</span>
          </button>
          <button
            onClick={() => {
              setCategoria('projetos');
              setExpandido(true);
            }}
            style={styles.quickActionBtn}
          >
            <Rocket size={16} color="#7c3aed" />
            <span>Divulgar Projeto</span>
          </button>
          <button
            onClick={() => {
              setCategoria('conselhos');
              setExpandido(true);
            }}
            style={styles.quickActionBtn}
          >
            <Lightbulb size={16} color="#d97706" />
            <span>Dica Acadêmica</span>
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
    padding: '14px',
    boxShadow: 'var(--shadow-sm)',
    marginBottom: '14px',
    width: '100%',
    overflow: 'hidden',
  },
  collapsedBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.95rem',
    flexShrink: 0,
  },
  avatarMini: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.8rem',
  },
  triggerBtn: {
    flex: 1,
    textAlign: 'left',
    padding: '10px 14px',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-full)',
    color: 'var(--text-muted)',
    fontSize: '0.86rem',
    transition: 'all 0.2s',
  },
  quickActions: {
    display: 'flex',
    justifyContent: 'flex-start',
    borderTop: '1px solid var(--border-color)',
    marginTop: '10px',
    paddingTop: '8px',
    gap: '6px',
    flexWrap: 'wrap',
  },
  quickActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 8px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    transition: 'background 0.2s',
  },
  expandedForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  authorName: {
    fontSize: '0.88rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    display: 'block',
  },
  authorCourse: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    display: 'block',
  },
  closeBtn: {
    color: 'var(--text-muted)',
    padding: '4px',
    borderRadius: '50%',
  },
  categoryPicker: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  pickerLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  pillsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  pillBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 12px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.75rem',
    fontWeight: '600',
    border: '1px solid transparent',
    transition: 'all 0.15s ease',
  },
  titleInput: {
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    fontSize: '0.9rem',
    fontWeight: '600',
    backgroundColor: 'var(--bg-input)',
    color: 'var(--text-main)',
    outline: 'none',
  },
  textarea: {
    padding: '12px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-input)',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    lineHeight: '1.5',
    resize: 'vertical',
    outline: 'none',
  },
  errorMsg: {
    color: 'var(--color-accent)',
    fontSize: '0.8rem',
    backgroundColor: 'var(--color-accent-light)',
    padding: '6px 10px',
    borderRadius: 'var(--radius-sm)',
  },
  formFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  cancelBtn: {
    padding: '8px 14px',
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    borderRadius: 'var(--radius-md)',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 18px',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: '700',
    borderRadius: 'var(--radius-full)',
    boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
    transition: 'opacity 0.2s',
  },
};
