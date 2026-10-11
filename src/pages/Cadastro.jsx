import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  UserPlus,
  User,
  Mail,
  GraduationCap,
  Lock,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Send,
  ExternalLink,
  Sun,
  Moon,
} from 'lucide-react';

const CURSOS_IFPE = [
  'Artes Visuais',
  'Computação Gráfica',
  'Técnico em Computação Gráfica',
];

export function Cadastro({ onNavigateToLogin }) {
  const { registro, reenviarConfirmacao } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [curso, setCurso] = useState(CURSOS_IFPE[0]);
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Estado pós-cadastro (aguardando confirmação no e-mail)
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
      const resultado = await registro(nome, email, curso, senha);
      setRegistroConcluido({
        email: email.trim().toLowerCase(),
        link_confirmacao: resultado.link_confirmacao,
        mensagem: resultado.message,
      });
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
      const res = await reenviarConfirmacao(registroConcluido.email);
      setMensagemReenvio('E-mail de confirmação reenviado com sucesso! Verifique sua caixa de entrada.');
      if (res.link_confirmacao) {
        setRegistroConcluido((prev) => ({ ...prev, link_confirmacao: res.link_confirmacao }));
      }
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
            <h1 style={styles.title}>Confirme seu E-mail</h1>
            <p style={styles.subtitle}>
              Quase lá! Validação de acesso estudantil pendente
            </p>
          </div>

          <div style={styles.emailInstructionsBox}>
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
              Enviamos um link de validação para:
            </p>
            <div style={styles.emailBadge}>
              <Mail size={16} color="var(--color-primary)" />
              <strong>{registroConcluido.email}</strong>
            </div>
            <p style={{ margin: '12px 0 0 0', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Por segurança, você <strong>só poderá acessar a plataforma após clicar no link</strong> recebido em sua caixa de entrada institucional.
            </p>
          </div>



          {mensagemReenvio && (
            <div style={styles.infoAlert}>
              <CheckCircle2 size={16} />
              <span>{mensagemReenvio}</span>
            </div>
          )}

          <div style={styles.actionButtonGroup}>
            <button
              type="button"
              onClick={handleReenviar}
              disabled={reenviando}
              style={styles.resendBtn}
            >
              <Send size={15} />
              <span>{reenviando ? 'Reenviando...' : 'Reenviar E-mail de Confirmação'}</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToLogin}
              style={styles.loginReturnBtn}
            >
              Ir para Tela de Login
            </button>
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
                placeholder="Ex: Larissa Silva Albuquerque"
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
                placeholder="seunome@discente.ifpe.edu.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  ...styles.input,
                  borderColor: email ? (emailValido ? 'var(--color-primary)' : 'var(--color-accent)') : 'var(--border-color)',
                }}
                required
              />
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Um link de confirmação será enviado para este e-mail para validar seu acesso.
            </span>
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
            <span>{carregando ? 'Cadastrando e enviando confirmação...' : 'Cadastrar e Enviar Confirmação'}</span>
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
  iconWrapperEmail: {
    width: '64px',
    height: '64px',
    backgroundColor: '#ecfdf5',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px auto',
    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)',
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
  emailInstructionsBox: {
    backgroundColor: 'var(--bg-card-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    border: '1px solid var(--border-color)',
    marginBottom: '18px',
    textAlign: 'center',
  },
  emailBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-card)',
    padding: '8px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    margin: '10px 0',
    fontSize: '0.9rem',
    color: 'var(--text-main)',
  },

  infoAlert: {
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
  actionButtonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  resendBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-hover)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    padding: '11px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.88rem',
    fontWeight: '600',
  },
  loginReturnBtn: {
    display: 'block',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    fontWeight: '600',
    padding: '8px',
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
};
