import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  UserPlus,
  User,
  Mail,
  GraduationCap,
  Lock,
  AlertCircle,
  ArrowLeft,
  Sun,
  Moon,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

const CURSOS_IFPE = [
  'Artes Visuais',
  'Computação Gráfica Integrado',
  'Computação Gráfica Subsequente',
  'Produção em Multimídia',
];

export function Cadastro({ onNavigateToLogin }) {
  const { registro } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [curso, setCurso] = useState(CURSOS_IFPE[0]);
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Estado de confirmação por e-mail obrigatória
  const [registroConcluido, setRegistroConcluido] = useState(null);
  const [reenviando, setReenviando] = useState(false);
  const [mensagemReenvio, setMensagemReenvio] = useState('');

  const emailValido =
    email.trim().toLowerCase().endsWith('@discente.ifpe.edu.br') ||
    email.trim().toLowerCase().endsWith('@ifpe.edu.br');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nome || !email || !curso || !senha) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!emailValido) {
      setErro('O e-mail precisa pertencer ao domínio @discente.ifpe.edu.br.');
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    try {
      setCarregando(true);
      setErro('');
      const res = await registro(nome, email, curso, senha);
      if (res.aguardandoConfirmacao) {
        setRegistroConcluido({ email: email.trim().toLowerCase(), nome: nome.trim() });
      }
    } catch (err) {
      setErro(err.message || 'Falha ao realizar cadastro.');
    } finally {
      setCarregando(false);
    }
  }

  async function handleReenviar() {
    if (!registroConcluido?.email) return;
    try {
      setReenviando(true);
      setMensagemReenvio('');
      const res = await api.reenviarConfirmacao(registroConcluido.email);
      setMensagemReenvio(res.message || 'E-mail de ativação reenviado com sucesso! Verifique sua caixa de entrada.');
    } catch (err) {
      setMensagemReenvio(err.message || 'Erro ao reenviar e-mail.');
    } finally {
      setReenviando(false);
    }
  }

  // Se o cadastro foi efetuado, exibe a tela de confirmação de e-mail obrigatória
  if (registroConcluido) {
    return (
      <div style={styles.container}>
        <div style={styles.card} className="auth-card animate-fade-in">
          <div style={styles.topBar}>
            <button
              type="button"
              onClick={onNavigateToLogin}
              style={styles.backBtn}
            >
              <ArrowLeft size={16} />
              <span>Voltar ao Login</span>
            </button>
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
            <div style={styles.iconWrapperEmail}>
              <Mail size={38} color="#16a34a" />
            </div>
            <h1 style={styles.title}>Quase lá! Ative sua conta</h1>
            <p style={styles.subtitle}>Confirmação necessária para liberar o acesso</p>
          </div>

          <div style={styles.confirmationContent}>
            <p style={styles.confirmationText}>
              Enviamos um e-mail com o link de ativação oficial para:
              <br />
              <strong style={{ color: 'var(--color-primary)', wordBreak: 'break-all' }}>
                {registroConcluido.email}
              </strong>
            </p>

            <div style={styles.infoAlert}>
              <span>
                🔒 <strong>Atenção:</strong> Sua conta só será liberada na plataforma após você abrir o e-mail recebido e clicar no botão <strong>"Ativar Minha Conta"</strong>.
              </span>
            </div>

            {mensagemReenvio && (
              <div style={styles.resendMessage}>
                <span>{mensagemReenvio}</span>
              </div>
            )}

            <div style={styles.confirmationActions}>
              <button
                type="button"
                onClick={handleReenviar}
                disabled={reenviando}
                style={styles.resendBtn}
              >
                <RefreshCw size={15} className={reenviando ? 'animate-spin' : ''} style={{ marginRight: '6px' }} />
                {reenviando ? 'Reenviando...' : 'Reenviar E-mail de Ativação'}
              </button>

              <button
                type="button"
                onClick={onNavigateToLogin}
                style={styles.goToLoginBtn}
              >
                Já confirmei, ir para Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card} className="auth-card animate-fade-in">
        <div style={styles.topBar}>
          <button
            type="button"
            onClick={onNavigateToLogin}
            style={styles.backBtn}
          >
            <ArrowLeft size={16} />
            <span>Voltar ao Login</span>
          </button>
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

        {/* Topo */}
        <div style={styles.header}>
          <div style={styles.logoBadge}>
            <span style={styles.logoDotRed}></span>
            <span style={styles.logoDotWhite}></span>
            <span style={styles.logoDotWhite}></span>
          </div>
          <h1 style={styles.title}>Criar Conta Estudantil</h1>
          <p style={styles.subtitle}>
            Junte-se à comunidade do IFPE Campus Olinda
          </p>
        </div>

        {erro && (
          <div style={styles.alertError}>
            <AlertCircle size={16} />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Nome Completo */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nome Completo</label>
            <div style={styles.inputWrapper}>
              <User size={18} color="var(--text-muted)" style={styles.inputIcon} />
              <input
                type="text"
                placeholder="Ex: João da Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          {/* E-mail Institucional */}
          <div style={styles.inputGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>E-mail Discente (@discente.ifpe.edu.br)</label>
              {email && (
                <span style={{ fontSize: '0.72rem', color: emailValido ? 'var(--color-primary)' : 'var(--color-accent)' }}>
                  {emailValido ? '✓ Domínio válido' : '✕ Domínio inválido'}
                </span>
              )}
            </div>
            <div style={styles.inputWrapper}>
              <Mail size={18} color="var(--text-muted)" style={styles.inputIcon} />
              <input
                type="email"
                placeholder="joao.silva@discente.ifpe.edu.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  ...styles.input,
                  borderColor: email ? (emailValido ? 'var(--color-primary)' : 'var(--color-accent)') : 'var(--border-color)',
                }}
                required
              />
            </div>
          </div>

          {/* Curso */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Curso no Campus Olinda</label>
            <div style={styles.inputWrapper}>
              <GraduationCap size={18} color="var(--text-muted)" style={styles.inputIcon} />
              <select
                value={curso}
                onChange={(e) => setCurso(e.target.value)}
                style={styles.select}
                required
              >
                {CURSOS_IFPE.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Senha */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Crie uma Senha (mínimo 6 caracteres)</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="var(--text-muted)" style={styles.inputIcon} />
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                style={styles.input}
                minLength={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            style={styles.submitBtn}
            disabled={carregando}
          >
            <UserPlus size={18} />
            <span>{carregando ? 'Cadastrando e entrando...' : 'Finalizar Cadastro'}</span>
          </button>
        </form>

        <div style={styles.footer}>
          <span>Já tem cadastro?</span>
          <button
            type="button"
            onClick={onNavigateToLogin}
            style={styles.linkBtn}
          >
            Fazer login
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
    maxWidth: '480px',
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    padding: '28px 32px 36px 32px',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--border-color)',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--text-muted)',
    fontSize: '0.82rem',
    fontWeight: '600',
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
  alertError: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--color-accent-light)',
    color: 'var(--color-accent)',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.84rem',
    marginBottom: '18px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    padding: '11px 14px 11px 40px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    fontSize: '0.88rem',
    backgroundColor: 'var(--bg-input)',
    color: 'var(--text-main)',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '11px 14px 11px 40px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    fontSize: '0.88rem',
    backgroundColor: 'var(--bg-input)',
    color: 'var(--text-main)',
    outline: 'none',
    cursor: 'pointer',
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
  },
  footer: {
    marginTop: '20px',
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
  },
  iconWrapperEmail: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto',
  },
  confirmationContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: '0.92rem',
    lineHeight: '1.6',
    color: 'var(--text-main)',
    margin: 0,
  },
  infoAlert: {
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
    border: '1px solid rgba(22, 163, 74, 0.25)',
    borderRadius: '8px',
    padding: '12px 14px',
    fontSize: '0.82rem',
    lineHeight: '1.5',
    color: '#166534',
    textAlign: 'left',
  },
  resendMessage: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.25)',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '0.82rem',
    color: '#1e40af',
  },
  confirmationActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '8px',
  },
  resendBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 16px',
    backgroundColor: 'var(--bg-hover)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '0.86rem',
    fontWeight: '600',
    color: 'var(--text-main)',
    cursor: 'pointer',
  },
  goToLoginBtn: {
    padding: '11px 16px',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
  },
};
