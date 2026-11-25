import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../services/api';
import {
  GraduationCap,
  FileText,
  Calendar,
  X,
  ShieldCheck,
  Sparkles,
  Loader2
} from 'lucide-react';

export function VerPerfilModal({ usuario, onClose }) {
  const [detalhes, setDetalhes] = useState(usuario);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    let ativo = true;
    if (usuario?.id) {
      setDetalhes(usuario);
      // Busca dados mais recentes caso a bio não venha pré-carregada
      if (usuario.bio === undefined) {
        setCarregando(true);
        api.getPerfilPublico(usuario.id)
          .then((dados) => {
            if (ativo && dados) {
              setDetalhes((prev) => ({ ...prev, ...dados }));
            }
          })
          .catch(() => {
            // Em caso de falha de rede, mantém dados disponíveis
          })
          .finally(() => {
            if (ativo) setCarregando(false);
          });
      }
    }
    return () => {
      ativo = false;
    };
  }, [usuario]);

  // Fechar com tecla Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!usuario) return null;

  const nome = detalhes?.nome || usuario.nome || 'Estudante IFPE';
  const curso = detalhes?.curso || usuario.curso || 'Campus Olinda';
  const email = detalhes?.email || usuario.email || '';
  const bio = detalhes?.bio !== undefined ? detalhes.bio : usuario.bio;
  const iniciais = nome.charAt(0).toUpperCase();

  const dataIngresso = detalhes?.created_at
    ? new Date(detalhes.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : null;

  return createPortal(
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()} className="animate-fade-in">
        {/* Banner de Topo com Gradiente IFPE */}
        <div style={styles.banner}>
          <button onClick={onClose} style={styles.closeBtn} title="Fechar modal">
            <X size={18} />
          </button>
        </div>

        {/* Informações do Estudante */}
        <div style={styles.body}>
          {/* Avatar com Badge de Verificação Discente */}
          <div style={styles.avatarWrapper}>
            <div style={styles.avatarLarge}>{iniciais}</div>
            <div style={styles.verifiedBadge} title="Discente com e-mail institucional verificado">
              <ShieldCheck size={14} color="#ffffff" />
            </div>
          </div>

          <div style={styles.headerInfo}>
            <h2 style={styles.nome}>{nome}</h2>
            <div style={styles.cursoBadge}>
              <GraduationCap size={15} color="var(--color-primary)" />
              <span>{curso}</span>
            </div>
          </div>

          {/* Tag Institucional */}
          <div style={styles.communityTag}>
            <Sparkles size={14} color="var(--color-primary)" />
            <span>Discente Ativo(a) • IFPE Campus Olinda</span>
          </div>

          {/* Seção de Biografia Acadêmica */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <FileText size={15} color="var(--color-primary)" />
              <h4 style={styles.sectionTitle}>Biografia Acadêmica</h4>
              {carregando && <Loader2 size={13} className="animate-spin" color="var(--text-muted)" />}
            </div>
            <div style={styles.bioCard}>
              {bio && bio.trim() ? (
                <p style={styles.bioText}>{bio}</p>
              ) : (
                <p style={styles.bioEmpty}>
                  Este estudante ainda não adicionou uma biografia acadêmica.
                </p>
              )}
            </div>
          </div>

          {/* Membro desde */}
          {dataIngresso && (
            <div style={styles.footerInfo}>
              <Calendar size={13} color="var(--text-muted)" />
              <span>Na comunidade desde {dataIngresso}</span>
            </div>
          )}

          {/* Botão de Fechar */}
          <div style={styles.actionRow}>
            <button type="button" onClick={onClose} style={styles.closeActionBtn}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999,
    padding: '16px',
    boxSizing: 'border-box',
  },
  modal: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    maxWidth: '450px',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-lg)',
    position: 'relative',
  },
  banner: {
    position: 'relative',
    height: '84px',
    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #008242 100%)',
    borderTopLeftRadius: 'calc(var(--radius-lg) - 1px)',
    borderTopRightRadius: 'calc(var(--radius-lg) - 1px)',
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  body: {
    padding: '0 20px 20px 20px',
  },
  avatarWrapper: {
    position: 'relative',
    marginTop: '-40px',
    marginBottom: '12px',
    width: '74px',
    height: '74px',
  },
  avatarLarge: {
    width: '74px',
    height: '74px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '1.8rem',
    border: '3px solid var(--bg-card)',
    boxShadow: 'var(--shadow-md)',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: '#16a34a',
    border: '2px solid var(--bg-card)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
  },
  nome: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  cursoBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--color-primary-light)',
    color: 'var(--color-primary)',
    padding: '3px 10px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.78rem',
    fontWeight: '700',
    marginTop: '2px',
  },
  communityTag: {
    marginTop: '14px',
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-hover)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.76rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  section: {
    marginTop: '16px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px',
  },
  sectionTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  bioCard: {
    backgroundColor: 'var(--bg-card-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
    border: '1px solid var(--border-color)',
  },
  bioText: {
    fontSize: '0.86rem',
    color: 'var(--text-main)',
    lineHeight: '1.55',
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  bioEmpty: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    margin: 0,
  },
  footerInfo: {
    marginTop: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.74rem',
    color: 'var(--text-muted)',
  },
  actionRow: {
    marginTop: '18px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  closeActionBtn: {
    padding: '8px 18px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-hover)',
    color: 'var(--text-main)',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
};

