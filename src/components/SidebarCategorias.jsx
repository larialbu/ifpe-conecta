import React from 'react';
import {
  Compass,
  HelpCircle,
  Lightbulb,
  Megaphone,
  Rocket,
  Layers,
  GraduationCap
} from 'lucide-react';

const CATEGORIAS = [
  {
    id: 'geral',
    label: 'Feed Geral',
    descricao: 'Todas as publicações',
    icon: Compass,
    color: 'var(--color-primary)',
    bgActive: 'var(--color-primary-light)',
  },
  {
    id: 'duvidas',
    label: 'Fórum & Dúvidas',
    descricao: 'Perguntas e monitoria',
    icon: HelpCircle,
    color: '#0284c7', // Sky blue
    bgActive: '#e0f2fe',
  },
  {
    id: 'conselhos',
    label: 'Conselhos & Dicas',
    descricao: 'Estágios e vida acadêmica',
    icon: Lightbulb,
    color: '#d97706', // Amber
    bgActive: '#fef3c7',
  },
  {
    id: 'avisos',
    label: 'Avisos do Campus',
    descricao: 'Comunicados e eventos',
    icon: Megaphone,
    color: 'var(--color-accent)', // Red
    bgActive: 'var(--color-accent-light)',
  },
  {
    id: 'projetos',
    label: 'Projetos',
    descricao: 'Extensão, TCC e oportunidades',
    icon: Rocket,
    color: '#7c3aed', // Purple
    bgActive: '#ede9fe',
  },
];

export function SidebarCategorias({ categoriaAtiva, onSelectCategoria, postsCountPorCategoria }) {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Layers size={18} color="var(--color-primary)" />
          <h3 style={styles.title}>Espaços do Campus</h3>
        </div>

        <nav style={styles.nav}>
          {CATEGORIAS.map((cat) => {
            const Icon = cat.icon;
            const isAtiva = categoriaAtiva === cat.id;
            const count = postsCountPorCategoria?.[cat.id];

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategoria(cat.id)}
                style={{
                  ...styles.itemBtn,
                  backgroundColor: isAtiva ? cat.bgActive : 'transparent',
                  color: isAtiva ? '#111827' : 'var(--text-secondary)',
                  fontWeight: isAtiva ? '700' : '500',
                  borderLeft: isAtiva ? `4px solid ${cat.color}` : '4px solid transparent',
                }}
              >
                <div style={{ ...styles.iconWrapper, color: cat.color }}>
                  <Icon size={18} />
                </div>
                <div style={styles.itemText}>
                  <span style={styles.itemLabel}>{cat.label}</span>
                  <span style={styles.itemDesc}>{cat.descricao}</span>
                </div>
                {count !== undefined && count > 0 && (
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: isAtiva ? '#ffffff' : '#f3f4f6',
                      color: isAtiva ? cat.color : 'var(--text-muted)',
                      border: isAtiva ? `1px solid ${cat.color}` : 'none',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Card Institucional Inferior */}
      <div style={styles.campusInfoCard}>
        <div style={styles.campusInfoHeader}>
          <GraduationCap size={18} color="var(--color-primary)" />
          <span style={styles.campusInfoTitle}>IFPE Campus Olinda</span>
        </div>
        <p style={styles.campusInfoText}>
          Espaço aberto para troca de conhecimento entre discentes dos cursos técnicos e superiores.
        </p>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
    padding: '16px 12px',
    boxShadow: 'var(--shadow-sm)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 12px 12px 12px',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '8px',
  },
  title: {
    fontSize: '0.88rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  itemBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: 'var(--radius-md)',
    textAlign: 'left',
    width: '100%',
    transition: 'all 0.15s ease',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-card-subtle)',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  itemText: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  itemLabel: {
    fontSize: '0.85rem',
    lineHeight: '1.2',
  },
  itemDesc: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  badge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '2px 7px',
    borderRadius: 'var(--radius-full)',
  },
  campusInfoCard: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
    padding: '14px 16px',
    boxShadow: 'var(--shadow-sm)',
  },
  campusInfoHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  campusInfoTitle: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  campusInfoText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
};
