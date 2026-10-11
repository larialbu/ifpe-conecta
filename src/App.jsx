import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';
import { Feed } from './pages/Feed';

function AppContent() {
  const { user, loading } = useAuth();
  const [telaAutenticacao, setTelaAutenticacao] = useState('login'); // 'login' | 'cadastro'

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.logoBadge}>
          <span style={styles.logoDotRed}></span>
          <span style={styles.logoDotWhite}></span>
          <span style={styles.logoDotWhite}></span>
        </div>
        <div style={styles.loadingText}>Carregando IFPE Olinda Conecta...</div>
      </div>
    );
  }

  // Se não estiver logado
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
};
