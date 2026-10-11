import React from 'react';
import {
  ExternalLink,
  Flame,
  ShieldCheck,
  Calendar,
  BookOpen,
  Award,
  Globe
} from 'lucide-react';

const LINKS_IFPE = [
  {
    nome: 'Q-Acadêmico Web',
    descricao: 'Notas, faltas e horários de aula',
    url: 'https://qacademico.ifpe.edu.br/',
    icon: Globe,
  },
  {
    nome: 'Biblioteca Virtual Pearson',
    descricao: 'Acesso a livros técnicos e bibliografias',
    url: 'https://www.ifpe.edu.br/olinda/',
    icon: BookOpen,
  },
  {
    nome: 'Calendário Acadêmico 2026',
    descricao: 'Datas de matrículas, provas e recessos',
    url: 'https://www.ifpe.edu.br/olinda/',
    icon: Calendar,
  },
  {
    nome: 'Editais de Assistência e Extensão',
    descricao: 'Bolsas permanência, pesquisa e PIBIF',
    url: 'https://portal.ifpe.edu.br/',
    icon: Award,
  },
];

const TOPICOS_DESTAQUE = [
  { tag: '#HackathonRecife', count: 18 },
  { tag: '#MonitoriaAlgoritmos', count: 14 },
  { tag: '#InovacaoIFPEOlinda', count: 9 },
  { tag: '#EstagioPortoDigital', count: 8 },
  { tag: '#PIBITI2026', count: 6 },
];

export function WidgetsSidebar({ onSelectTag }) {
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

      {/* Widget 2: Tópicos da Semana */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <Flame size={16} color="var(--color-accent)" />
          <h4 style={styles.cardTitle}>Em Alta no Campus</h4>
        </div>
        <div style={styles.tagsList}>
          {TOPICOS_DESTAQUE.map((item, index) => (
            <div
              key={index}
              style={styles.tagItem}
              onClick={() => onSelectTag && onSelectTag(item.tag.replace('#', ''))}
            >
              <span style={styles.tagName}>{item.tag}</span>
              <span style={styles.tagCount}>{item.count} posts</span>
            </div>
          ))}
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
  guidelineText: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.45',
  },
};
