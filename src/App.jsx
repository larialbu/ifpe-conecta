import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';
import { Feed } from './pages/Feed';
import { ConfirmarEmail } from './pages/ConfirmarEmail';

function AppContent() {
  const { user, loading } = useAuth();
  const [telaAutenticacao, setTelaAutenticacao] = useState('login'); // 'login' | 'cadastro'
  const [tokenConfirmacao, setTokenConfirmacao] = useState(null);

  useEffect(() => {
    // Detecta se o usuário clicou no link recebido por e-mail (?token_confirmacao=... ou ?token=...)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token_confirmacao') || params.get('token');
    if (token) {
      setTokenConfirmacao(token);
    }
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.logoBadge}>
          <span style={styles.logoDotRed}></span>
          <span style={styles.logoDotWhite}></span>
          <span style={styles.logoDotWhite}></span>
        </div>
        <div style={styles.loadingText}>Carregando IFPE Olinda Hub...</div>
      </div>
    );
  }

  // 1. Se veio com token de confirmação no link de e-mail
  if (tokenConfirmacao && !user) {
    return (
      <ConfirmarEmail
        token={tokenConfirmacao}
        onConcluido={() => {
          setTokenConfirmacao(null);
        }}
        onIrParaLogin={() => {
          setTokenConfirmacao(null);
          setTelaAutenticacao('login');
          if (window.history?.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }}
      />
    );
  }

  // 2. Se não estiver logado
  if (!user) {
    if (telaAutenticacao === 'cadastro') {
      return <Cadastro onNavigateToLogin={() => setTelaAutenticacao('login')} />;
    }
    return <Login onNavigateToCadastro={() => setTelaAutenticacao('cadastro')} />;
  }

  // 3. Se logado com sucesso (após confirmação do e-mail)
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
};
