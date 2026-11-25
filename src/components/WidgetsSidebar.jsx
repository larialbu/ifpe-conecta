import React from 'react';
import {
  ExternalLink,
  Flame,
  ShieldCheck,
  Globe,
  Hash
} from 'lucide-react';

const LINKS_IFPE = [
  {
    nome: 'Q-Acadêmico Web',
    descricao: 'Notas, faltas e horários de aula',
    url: 'https://qacademico.ifpe.edu.br/',
    icon: Globe,
  },
  {
    nome: 'Site do IFPE',
    descricao: 'Portal institucional e notícias do campus',
    url: 'https://portal.ifpe.edu.br/olinda/',
    icon: Globe,
  },
];

export function WidgetsSidebar({ onSelectTag, topicos = [], tagAtiva = '' }) {
  return (
    <aside style={styles.container}>
      {/* Widget 1: Links Rápidos do IFPE */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <ExternalLink size={16} color="var(--color-primary)" />
          <h4 style={styles.cardTitle}>Links Úteis • IFPE Olinda</h4>
        </div>
        <div style={styles.linksList}>
          {LINKS_IFPE.map((item, index) => {
            const Icon = item.icon;
            return (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.linkItem}
              >
                <div style={styles.linkIconWrapper}>
                  <Icon size={15} color="var(--color-primary)" />
                </div>
                <div style={styles.linkContent}>
                  <span style={styles.linkName}>{item.nome}</span>
                  <span style={styles.linkDesc}>{item.descricao}</span>
                </div>
                <ExternalLink size={13} color="var(--text-subtle)" />
              </a>
            );
          })}
        </div>
      </div>

      {/* Widget 2: Tópicos da Semana / Hashtags Dinâmicas */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <Flame size={16} color="var(--color-accent)" />
          <h4 style={styles.cardTitle}>Em Alta no Campus</h4>
        </div>
        <div style={styles.tagsList}>
          {topicos && topicos.length > 0 ? (
            topicos.map((item, index) => {
              const isSelected =
                tagAtiva &&
                (tagAtiva === item.tag || tagAtiva === item.tag.replace('#', ''));
              return (
                <div
                  key={index}
                  style={{
                    ...styles.tagItem,
                    ...(isSelected ? styles.tagItemActive : {}),
                  }}
                  onClick={() => onSelectTag && onSelectTag(item.tag)}
                  title={
                    isSelected
                      ? `Clique para sair da hashtag ${item.tag}`
                      : `Filtrar publicações com ${item.tag}`
                  }
                >
                  <span style={styles.tagName}>{item.tag}</span>
                  <div style={styles.tagCountGroup}>
                    <span style={styles.tagCount}>
                      {item.count} {item.count === 1 ? 'post' : 'posts'}
                    </span>
                    {isSelected && (
                      <span style={styles.tagRemoveBtn} title="Remover filtro">
                        ✕
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={styles.emptyTagsBox}>
              <div style={styles.emptyTagsIcon}>
                <Hash size={16} color="var(--text-muted)" />
              </div>
              <p style={styles.emptyTagsTitle}>Nenhuma # em alta ainda</p>
              <span style={styles.emptyTagsSub}>
                Inclua hashtags (ex: #Monitoria, #Projeto) nas publicações para destacá-las aqui!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Widget 3: Boas práticas / Regras */}
      <div style={styles.cardMuted}>
        <div style={styles.cardHeader}>
          <ShieldCheck size={16} color="var(--color-primary)" />
          <h4 style={styles.cardTitle}>Diretrizes da Comunidade</h4>
        </div>
        <p style={styles.guidelineText}>
          Mantenha o respeito com os colegas, compartilhe fontes confiáveis e incentive a colaboração científica e cultural no campus Olinda.
        </p>
      </div>
    </aside>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
    padding: '16px',
    boxShadow: 'var(--shadow-sm)',
  },
  cardMuted: {
    backgroundColor: 'var(--bg-card-subtle)',
    borderRadius: 'var(--radius-lg)',
    border: '1px dashed var(--border-color)',
    padding: '16px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid var(--border-color)',
  },
  cardTitle: {
    fontSize: '0.82rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  linksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  linkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
    color: 'inherit',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    transition: 'all 0.15s ease',
  },
  linkIconWrapper: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    backgroundColor: 'var(--color-primary-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  linkContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  linkName: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  linkDesc: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
  },
  tagsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  tagItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-hover)',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  tagName: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--color-primary)',
  },
  tagCount: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },
  tagItemActive: {
    backgroundColor: 'var(--color-primary-light)',
    border: '1px solid var(--color-primary)',
  },
  tagCountGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  tagRemoveBtn: {
    fontSize: '0.68rem',
    fontWeight: '800',
    color: 'var(--color-primary)',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTagsBox: {
    padding: '12px 10px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-card-subtle)',
    border: '1px dashed var(--border-color)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  emptyTagsIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-hover)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTagsTitle: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: 0,
  },
  emptyTagsSub: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  guidelineText: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.45',
  },
};
