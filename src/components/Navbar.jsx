import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, LogOut, Sun, Moon, Edit3 } from 'lucide-react';

export function Navbar({ termoBusca, setTermoBusca, onSelectCategoria, onOpenPerfil }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header style={styles.header}>
      <div style={styles.container} className="navbar-container">
        {/* Logotipo IFPE Olinda Hub */}
        <div style={styles.brand} onClick={() => onSelectCategoria('geral')}>
          <div style={styles.logoBadge}>
            <span style={styles.logoDotRed}></span>
            <span style={styles.logoDotWhite}></span>
            <span style={styles.logoDotWhite}></span>
          </div>
          <div>
            <div style={styles.brandTitle} className="brand-title-text">
              <span style={{ color: 'var(--color-primary)' }}>IFPE</span>
              <span style={{ color: 'var(--color-accent)', marginLeft: '4px' }}>Olinda</span>
              <span style={styles.brandSubtitle}>Hub</span>
            </div>
            <div style={styles.campusTag} className="campus-tag-desktop">
              Campus Olinda • Comunidade Discente
            </div>
          </div>
        </div>

        {/* Barra de Busca (em mobile vira linha própria) */}
        <div style={styles.searchWrapper} className="navbar-search-wrapper">
          <Search size={16} color="var(--text-muted)" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar dúvidas, projetos, avisos..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            style={styles.searchInput}
          />
          {termoBusca && (
            <button
              onClick={() => setTermoBusca('')}
              style={styles.clearBtn}
              title="Limpar busca"
            >
              ✕
            </button>
          )}
        </div>

        {/* Ações da Direita: Modo Noturno, Perfil e Sair */}
        <div style={styles.rightActions} className="navbar-right-actions">
          {/* Botão de Alternar Modo Noturno */}
          <button
            onClick={toggleTheme}
            style={styles.themeToggleBtn}
            title={isDark ? 'Ativar Modo Claro' : 'Ativar Modo Noturno'}
          >
            {isDark ? (
              <Sun size={17} color="#f59e0b" />
            ) : (
              <Moon size={17} color="#6366f1" />
            )}
            <span style={styles.themeToggleLabel} className="theme-toggle-text">
              {isDark ? 'Claro' : 'Escuro'}
            </span>
          </button>

          {/* Área do Usuário Logado (Clicável para abrir perfil) */}
          {user && (
            <button
              onClick={onOpenPerfil}
              style={styles.userCardBtn}
              title="Editar Perfil"
            >
              <div style={styles.avatar}>
                {user.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={styles.userInfo}>
                <div style={styles.userNameRow} className="user-card-name">
                  <span style={styles.userName}>{user.nome}</span>
                  <Edit3 size={11} color="var(--text-muted)" />
                </div>
                <span style={styles.userCourse} className="user-card-course">{user.curso}</span>
              </div>
            </button>
          )}

          {/* Botão Sair */}
          <button
            onClick={logout}
            style={styles.logoutBtn}
            title="Sair da conta"
          >
            <LogOut size={16} />
            <span style={styles.logoutText} className="logout-btn-text">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: 'var(--bg-card)',
    borderBottom: '1px solid var(--border-color)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: 'var(--shadow-sm)',
    transition: 'background-color 0.25s ease, border-color 0.25s ease',
  },
  container: {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '14px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    userSelect: 'none',
    flexShrink: 0,
  },
  logoBadge: {
    width: '36px',
    height: '36px',
    backgroundColor: '#16a34a',
    borderRadius: '10px',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '4px',
    padding: '7px',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
    flexShrink: 0,
  },
  logoDotRed: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#dc2626',
  },
  logoDotWhite: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
  },
  brandTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    lineHeight: '1.2',
    letterSpacing: '-0.02em',
    display: 'flex',
    alignItems: 'center',
  },
  brandSubtitle: {
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: 'var(--bg-hover)',
    color: 'var(--text-main)',
    padding: '1px 5px',
    borderRadius: '4px',
    marginLeft: '5px',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  campusTag: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  searchWrapper: {
    position: 'relative',
    flex: '1',
    maxWidth: '460px',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '9px 36px 9px 36px',
    fontSize: '0.86rem',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-input)',
    color: 'var(--text-main)',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  clearBtn: {
    position: 'absolute',
    right: '12px',
    color: 'var(--text-muted)',
    fontSize: '12px',
    padding: '2px 6px',
    borderRadius: '50%',
  },
  rightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  themeToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 10px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--bg-hover)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    fontSize: '0.76rem',
    fontWeight: '700',
    transition: 'all 0.2s ease',
  },
  themeToggleLabel: {
    display: 'inline',
  },
  userCardBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 10px 4px 4px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--bg-hover)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'left',
  },
  avatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.82rem',
    flexShrink: 0,
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  userNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  userName: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    lineHeight: '1.2',
    whiteSpace: 'nowrap',
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userCourse: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '7px 11px',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-accent)',
    backgroundColor: 'var(--color-accent-light)',
    fontSize: '0.78rem',
    fontWeight: '700',
    transition: 'background-color 0.2s',
  },
  logoutText: {
    display: 'inline',
  },
};
