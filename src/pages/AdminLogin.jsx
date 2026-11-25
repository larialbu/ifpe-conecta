import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

export function AdminLogin({ onNavigateToAdmin, onNavigateToFeed }) {
  const { setSessionUser } = useAuth();
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !senha) {
      setErro('Preencha o e-mail e a senha administrativa.');
      return;
    }

    try {
      setCarregando(true);
      setErro('');
      const data = await api.adminLogin(email, senha);
      const adminData = data.admin || data.usuario;
      if (setSessionUser && adminData) {
        setSessionUser(adminData, data.token);
      }
      if (onNavigateToAdmin) {
        onNavigateToAdmin(data.token);
      } else {
        window.location.assign('/admin');
      }
    } catch (err) {
      setErro(err.message || 'Credenciais de administrador inválidas.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.shieldBadge}>
            <ShieldCheck size={32} color="#ffffff" />
          </div>
          <h1 style={styles.title}>Painel Administrativo</h1>
          <p style={styles.subtitle}>Acesso restrito para gestão e moderação do IFPE Chega Junto</p>
        </div>

        {erro && (
          <div style={styles.errorBox}>
            <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
            <div>
              <span style={styles.errorText}>{erro}</span>
              {erro.includes('principal') && (
                <div style={{ marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={onNavigateToFeed || (() => { window.location.href = '/'; })}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#15803d',
                      fontWeight: '700',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                    }}
                  >
                    👉 Ir para o login do sistema principal
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>E-mail Administrativo</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} color="#9ca3af" style={styles.inputIcon} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ifpe.edu.br"
                style={styles.input}
                disabled={carregando}
                autoFocus
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha de Administrador</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#9ca3af" style={styles.inputIcon} />
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                disabled={carregando}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando}
            style={{
              ...styles.submitBtn,
              opacity: carregando ? 0.7 : 1,
              cursor: carregando ? 'not-allowed' : 'pointer',
            }}
          >
            {carregando ? (
              <>
                <Loader2 size={18} className="animate-spin" style={{ marginRight: '8px' }} />
                Autenticando...
              </>
            ) : (
              'Entrar no Painel'
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <button
            type="button"
            onClick={onNavigateToFeed || (() => { window.location.href = '/'; })}
            style={styles.backBtn}
          >
            <ArrowLeft size={16} style={{ marginRight: '6px' }} />
            Voltar para a plataforma discente
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
    backgroundColor: 'var(--bg-page, #f3f4f6)',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    border: '1px solid var(--border-color, #e5e7eb)',
    padding: '36px 32px',
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  shieldBadge: {
    width: '60px',
    height: '60px',
    backgroundColor: '#15803d',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto',
    boxShadow: '0 6px 14px rgba(21, 128, 61, 0.25)',
  },
  title: {
    fontSize: '1.45rem',
    fontWeight: '700',
    color: 'var(--text-main, #111827)',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '0.88rem',
    color: 'var(--text-muted, #6b7280)',
    margin: 0,
    lineHeight: '1.4',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '12px 14px',
    marginBottom: '20px',
  },
  errorText: {
    fontSize: '0.86rem',
    color: '#dc2626',
    fontWeight: '500',
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
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-main, #374151)',
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
    padding: '11px 14px 11px 40px',
    fontSize: '0.92rem',
    border: '1px solid var(--border-color, #d1d5db)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-input, #ffffff)',
    color: 'var(--text-main, #111827)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
  },
  submitBtn: {
    marginTop: '6px',
    padding: '12px',
    backgroundColor: '#15803d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
  footer: {
    marginTop: '24px',
    paddingTop: '18px',
    borderTop: '1px solid var(--border-color, #f3f4f6)',
    textAlign: 'center',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted, #6b7280)',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  },
};

