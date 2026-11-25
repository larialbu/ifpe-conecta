import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';
import { Feed } from './pages/Feed';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { ConfirmarEmail } from './pages/ConfirmarEmail';

function AppContent() {
  const { user, loading, setSessionUser } = useAuth();
  const [telaAutenticacao, setTelaAutenticacao] = useState('login'); // 'login' | 'cadastro'
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('ifpe_admin_token'));

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setAdminToken(localStorage.getItem('ifpe_admin_token'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to) => {
    window.history.pushState({}, '', to);
    setCurrentPath(to);
    setAdminToken(localStorage.getItem('ifpe_admin_token'));
  };

  const handleAdminSuccess = (token) => {
    const tk = token || localStorage.getItem('ifpe_admin_token');
    setAdminToken(tk);
    navigate('/admin');
  };

  // 1. Rota de Confirmação de E-mail (quando o estudante clica no link enviado)
  const urlParams = new URLSearchParams(window.location.search);
  const tokenConfirmacao = urlParams.get('token_confirmacao');

  if (tokenConfirmacao || currentPath === '/confirmar-email') {
    return (
      <ConfirmarEmail
        token={tokenConfirmacao}
        onConcluido={(dadosSessao) => {
          if (dadosSessao?.usuario && dadosSessao?.token && setSessionUser) {
            setSessionUser(dadosSessao.usuario, dadosSessao.token);
          }
          window.history.replaceState({}, '', '/');
          setCurrentPath('/');
        }}
        onIrParaLogin={() => {
          window.history.replaceState({}, '', '/');
          setCurrentPath('/');
        }}
      />
    );
  }

  // Rota: /admin/login
  if (currentPath === '/admin/login') {
    return (
      <AdminLogin
        onNavigateToAdmin={handleAdminSuccess}
        onNavigateToFeed={() => navigate('/')}
      />
    );
  }

  // Rota: /admin (Exclusivo para admin - usuário comum tem acesso apenas ao sistema principal)
  if (currentPath === '/admin') {
    const currentAdminToken = adminToken || localStorage.getItem('ifpe_admin_token');
    const isLoggedAdmin = user?.tipo === 'admin' || user?.role === 'admin';

    // Se o usuário está logado na plataforma principal mas é usuário comum (não-admin) e não tem token admin
    if (user && !isLoggedAdmin && !currentAdminToken) {
      return (
        <div style={styles.accessDeniedScreen}>
          <div style={styles.accessDeniedCard}>
            <div style={styles.accessDeniedIcon}>🔒</div>
            <h2 style={styles.accessDeniedTitle}>Acesso Restrito ao Painel Admin</h2>
            <p style={styles.accessDeniedText}>
              Sua conta (<strong>{user.nome}</strong>) é do tipo <strong>estudante/usuário normal</strong> e possui acesso apenas à plataforma principal.
            </p>
            <button onClick={() => navigate('/')} style={styles.accessDeniedBtn}>
              Voltar à Plataforma Principal
            </button>
          </div>
        </div>
      );
    }

    if (!currentAdminToken && !isLoggedAdmin) {
      return (
        <AdminLogin
          onNavigateToAdmin={handleAdminSuccess}
          onNavigateToFeed={() => navigate('/')}
        />
      );
    }

    return (
      <AdminDashboard
        onNavigateToFeed={() => navigate('/')}
        onNavigateToLogin={() => {
          setAdminToken(null);
          navigate('/admin/login');
        }}
      />
    );
  }

  // Loading do feed discente
  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.logoBadge}>
          <span style={styles.logoDotRed}></span>
          <span style={styles.logoDotWhite}></span>
          <span style={styles.logoDotWhite}></span>
        </div>
        <div style={styles.loadingText}>Carregando IFPE Chega Junto...</div>
      </div>
    );
  }

  // Se não estiver logado na plataforma discente
  if (!user) {
    if (telaAutenticacao === 'cadastro') {
      return <Cadastro onNavigateToLogin={() => setTelaAutenticacao('login')} />;
    }
    return <Login onNavigateToCadastro={() => setTelaAutenticacao('cadastro')} />;
  }

  // Se logado com sucesso
  return <Feed />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = {
  loadingScreen: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-page, #f3f4f6)',
    gap: '16px',
  },
  logoBadge: {
    width: '50px',
    height: '50px',
    backgroundColor: '#16a34a',
    borderRadius: '12px',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '6px',
    padding: '10px',
    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
    animation: 'pulse 1.5s infinite ease-in-out',
  },
  logoDotRed: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#dc2626',
  },
  logoDotWhite: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'var(--text-muted, #4b5563)',
  },
  accessDeniedScreen: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-page, #f3f4f6)',
    padding: '20px',
  },
  accessDeniedCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '16px',
    padding: '36px 28px',
    maxWidth: '460px',
    textAlign: 'center',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid var(--border-color, #e5e7eb)',
  },
  accessDeniedIcon: {
    fontSize: '42px',
    marginBottom: '16px',
  },
  accessDeniedTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#dc2626',
    margin: '0 0 10px 0',
  },
  accessDeniedText: {
    fontSize: '0.92rem',
    color: 'var(--text-main, #4b5563)',
    lineHeight: '1.5',
    marginBottom: '24px',
  },
  accessDeniedBtn: {
    padding: '11px 22px',
    backgroundColor: '#15803d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.92rem',
    cursor: 'pointer',
  },
};
