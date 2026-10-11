import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles, Sun, Moon } from 'lucide-react';

export function ConfirmarEmail({ token, onConcluido, onIrParaLogin }) {
  const { confirmarEmail } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [status, setStatus] = useState('processando'); // 'processando' | 'sucesso' | 'erro'
  const [mensagem, setMensagem] = useState('Validando seu e-mail institucional...');

  useEffect(() => {
    let ativo = true;

    async function validar() {
      try {
        const resposta = await confirmarEmail(token);
        if (!ativo) return;
        setStatus('sucesso');
        setMensagem(resposta.message || 'Conta ativada com sucesso! Bem-vindo(a) ao IFPE Olinda Conecta.');

        // Limpar token da URL para não reenviar em reload
        if (window.history?.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        // Aguardar 2.5 segundos para o usuário ver o feedback antes de entrar
        setTimeout(() => {
          if (ativo && onConcluido) {
            onConcluido();
          }
        }, 2500);
      } catch (err) {
        if (!ativo) return;
        setStatus('erro');
        setMensagem(err.message || 'Link de confirmação inválido ou expirado.');
      }
    }

    if (token) {
      validar();
    } else {
      setStatus('erro');
      setMensagem('Nenhum código de confirmação foi encontrado no link.');
    }

    return () => {
      ativo = false;
    };
  }, [token]);

  return (
    <div style={styles.container}>
      <div style={styles.card} className="auth-card animate-fade-in">
        <div style={styles.topBar}>
          <button
            type="button"
            onClick={toggleTheme}
            style={styles.themeToggleBtn}
            title={isDark ? 'Ativar Modo Claro' : 'Ativar Modo Noturno'}
          >
            {isDark ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#6366f1" />}
            <span style={{ fontSize: '0.74rem', fontWeight: '700' }}>{isDark ? 'Claro' : 'Escuro'}</span>
          </button>
        </div>

        <div style={styles.header}>
          <div style={styles.logoBadge}>
            <span style={styles.logoDotRed}></span>
            <span style={styles.logoDotWhite}></span>
            <span style={styles.logoDotWhite}></span>
          </div>
          <h1 style={styles.title}>Validação de Acesso</h1>
          <p style={styles.subtitle}>IFPE Campus Olinda</p>
        </div>

        {status === 'processando' && (
          <div style={styles.contentBox}>
            <div style={styles.iconWrapperLoading}>
              <Loader2 size={36} color="var(--color-primary)" className="animate-spin" />
            </div>
            <h2 style={styles.boxTitle}>Validando Confirmação...</h2>
            <p style={styles.boxDescription}>
              Estamos verificando suas credenciais discentes no banco de dados. Aguarde um instante.
            </p>
          </div>
        )}

        {status === 'sucesso' && (
          <div style={styles.contentBox}>
            <div style={styles.iconWrapperSuccess}>
              <CheckCircle2 size={40} color="#16a34a" />
            </div>
            <h2 style={{ ...styles.boxTitle, color: '#16a34a' }}>Conta Ativada com Sucesso!</h2>
            <p style={styles.boxDescription}>{mensagem}</p>
            <div style={styles.successNote}>
              <Sparkles size={16} color="#16a34a" />
              <span>Entrando automaticamente na plataforma...</span>
            </div>
            <button
              type="button"
              onClick={onConcluido}
              style={styles.primaryBtn}
            >
              <span>Acessar o Conecta Agora</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {status === 'erro' && (
          <div style={styles.contentBox}>
            <div style={styles.iconWrapperError}>
              <AlertCircle size={40} color="var(--color-accent)" />
            </div>
            <h2 style={{ ...styles.boxTitle, color: 'var(--color-accent)' }}>Falha na Validação</h2>
            <p style={styles.boxDescription}>{mensagem}</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              O link pode ter expirado (válido por 24h) ou já ter sido utilizado. Você pode solicitar um novo link na página de login.
            </p>
            <button
              type="button"
              onClick={onIrParaLogin}
              style={styles.primaryBtn}
            >
              <span>Voltar ao Login</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: 'var(--bg-page)',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    padding: '32px',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--border-color)',
    textAlign: 'center',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '8px',
  },
  themeToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 10px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--bg-hover)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
  },
  header: {
    marginBottom: '24px',
  },
  logoBadge: {
    width: '44px',
    height: '44px',
    backgroundColor: '#16a34a',
    borderRadius: '12px',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '5px',
    padding: '9px',
    margin: '0 auto 12px auto',
    boxShadow: '0 4px 10px rgba(22, 163, 74, 0.35)',
  },
  logoDotRed: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#dc2626',
  },
  logoDotWhite: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: '1.45rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    color: 'var(--text-main)',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '0.86rem',
    color: 'var(--text-muted)',
  },
  contentBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 8px',
  },
  iconWrapperLoading: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  iconWrapperSuccess: {
    width: '68px',
    height: '68px',
    borderRadius: '50%',
    backgroundColor: '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)',
  },
  iconWrapperError: {
    width: '68px',
    height: '68px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-accent-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  boxTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    marginBottom: '10px',
  },
  boxDescription: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    marginBottom: '18px',
  },
  successNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    padding: '8px 16px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.82rem',
    fontWeight: '700',
    marginBottom: '20px',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.92rem',
    fontWeight: '700',
    boxShadow: '0 3px 8px rgba(22, 163, 74, 0.3)',
    cursor: 'pointer',
    width: '100%',
  },
};
