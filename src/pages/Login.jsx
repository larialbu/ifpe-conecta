import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogIn, Lock, Mail, AlertCircle, ArrowRight, Sun, Moon } from 'lucide-react';

export function Login({ onNavigateToCadastro }) {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !senha) {
      setErro('Preencha seu e-mail e senha.');
      return;
    }

    try {
      setCarregando(true);
      setErro('');
      await login(email, senha);
    } catch (err) {
      setErro(err.message || 'Falha ao autenticar.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card} className="auth-card animate-fade-in">
        <div style={styles.topBar}>
          <button
            onClick={toggleTheme}
            style={styles.themeToggleBtn}
            title={isDark ? 'Ativar Modo Claro' : 'Ativar Modo Noturno'}
          >
            {isDark ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#6366f1" />}
            <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>{isDark ? 'Claro' : 'Escuro'}</span>
          </button>
        </div>

        {/* Topo com Identidade IFPE */}
        <div style={styles.header}>
          <div style={styles.logoBadge}>
            <span style={styles.logoDotRed}></span>
            <span style={styles.logoDotWhite}></span>
            <span style={styles.logoDotWhite}></span>
          </div>
          <h1 style={styles.title}>
            <span style={{ color: 'var(--color-primary)' }}>IFPE</span>{' '}
            <span style={{ color: 'var(--color-accent)' }}>Olinda</span> Conecta
          </h1>
          <p style={styles.subtitle}>
            Acesse a comunidade discente do Campus Olinda
          </p>
        </div>

        {erro && (
          <div style={styles.alertError}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>{erro}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>E-mail Institucional</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} color="var(--text-muted)" style={styles.inputIcon} />
              <input
                type="email"
                placeholder="nome.sobrenome@discente.ifpe.edu.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <span style={styles.helperText}>
              Obrigatório e-mail institucional (@discente.ifpe.edu.br)
            </span>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha de Acesso</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="var(--text-muted)" style={styles.inputIcon} />
              <input
                type="password"
                placeholder="Sua senha segura"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            style={styles.submitBtn}
            disabled={carregando}
          >
            <LogIn size={18} />
            <span>{carregando ? 'Entrando...' : 'Entrar na Plataforma'}</span>
          </button>
        </form>

        {/* Rodapé / Link de Cadastro */}
        <div style={styles.footer}>
          <span>Ainda não possui uma conta?</span>
          <button
            type="button"
            onClick={onNavigateToCadastro}
            style={styles.linkBtn}
          >
            Cadastrar-se agora <ArrowRight size={14} />
          </button>
        </div>
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
    padding: '28px 32px 36px 32px',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--border-color)',
    position: 'relative',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '10px',
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
    textAlign: 'center',
    marginBottom: '28px',
  },
  logoBadge: {
    width: '46px',
    height: '46px',
    backgroundColor: '#16a34a',
    borderRadius: '12px',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '5px',
    padding: '10px',
    margin: '0 auto 14px auto',
    boxShadow: '0 4px 10px rgba(22, 163, 74, 0.35)',
  },
  logoDotRed: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    backgroundColor: '#dc2626',
  },
  logoDotWhite: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    marginBottom: '6px',
    color: 'var(--text-main)',
  },
  subtitle: {
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
  },
  alertError: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    backgroundColor: 'var(--color-accent-light)',
    color: 'var(--color-accent)',
    padding: '12px 14px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.84rem',
    lineHeight: '1.45',
    marginBottom: '16px',
  },
  alertActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--color-accent)',
    color: '#ffffff',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.84rem',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 40px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    fontSize: '0.9rem',
    backgroundColor: 'var(--bg-input)',
    color: 'var(--text-main)',
    outline: 'none',
  },
  helperText: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.95rem',
    fontWeight: '700',
    marginTop: '6px',
    boxShadow: '0 3px 8px rgba(22, 163, 74, 0.3)',
    transition: 'background-color 0.2s',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '0.84rem',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  linkBtn: {
    color: 'var(--color-primary)',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
};
