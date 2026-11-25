import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Sun,
  Moon,
  LogIn,
} from 'lucide-react';

export function ConfirmarEmail({ token, onConcluido, onIrParaLogin }) {
  const { confirmarEmail } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [status, setStatus] = useState('processando'); // 'processando' | 'sucesso' | 'erro'
  const [mensagem, setMensagem] = useState('Validando seu e-mail institucional no banco de dados...');
  const [dadosSessao, setDadosSessao] = useState(null);
  const validacaoExecutada = useRef(false);

  useEffect(() => {
    if (validacaoExecutada.current) return;
    validacaoExecutada.current = true;

    async function validar() {
      try {
        const resposta = await confirmarEmail(token);
        setStatus('sucesso');
        setMensagem(
          resposta.message || 'Conta ativada com sucesso! Seu acesso ao IFPE Chega Junto está liberado.'
        );
        setDadosSessao(resposta);

        // Limpar token da URL para manter limpo o endereço
        if (window.history?.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err) {
        setStatus('erro');
        setMensagem(err.message || 'Link de confirmação inválido ou expirado.');
      }
    }

    if (token) {
      validar();
    } else {
      setStatus('erro');
      setMensagem('Nenhum código de confirmação foi informado no link.');
    }
  }, [token, confirmarEmail]);

  function handleEntrarPlataforma() {
    if (onConcluido) {
      onConcluido(dadosSessao);
    } else {
      window.location.assign('/');
    }
  }

  function handleIrLogin() {
    if (onIrParaLogin) {
      onIrParaLogin();
    } else {
      window.location.assign('/');
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card} className="auth-card animate-fade-in">
        {/* Barra superior de tema */}
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

        {/* Cabeçalho */}
        <div style={styles.header}>
          <div style={styles.logoBadge}>
            <span style={styles.logoDotRed}></span>
            <span style={styles.logoDotWhite}></span>
            <span style={styles.logoDotWhite}></span>
          </div>
          <h1 style={styles.title}>IFPE Chega Junto</h1>
          <p style={styles.subtitle}>Campus Olinda • Validação de Cadastro</p>
        </div>

        {/* 1. ESTADO: PROCESSANDO */}
        {status === 'processando' && (
          <div style={styles.contentBox}>
            <div style={styles.iconWrapperLoading}>
              <Loader2 size={38} color="#16a34a" className="animate-spin" />
            </div>
            <h2 style={styles.boxTitle}>Validando Confirmação...</h2>
            <p style={styles.boxDescription}>
              Estamos verificando suas credenciais discentes e ativando o seu acesso no banco de dados.
            </p>
          </div>
        )}

        {/* 2. ESTADO: SUCESSO - TELA OFICIAL "OK, VOCÊ PODE ACESSAR" */}
        {status === 'sucesso' && (
          <div style={styles.contentBox}>
            <div style={styles.iconWrapperSuccess}>
              <CheckCircle2 size={46} color="#16a34a" />
            </div>
            
            <h2 style={styles.successTitle}>Tudo pronto! Você já pode acessar</h2>
            <p style={styles.boxDescription}>
              Seu e-mail institucional foi confirmado com sucesso e sua conta discente foi <strong>liberada no sistema</strong>.
            </p>

            {/* Cartão de Confirmação dos Dados */}
            <div style={styles.statusCard}>
              <div style={styles.statusRow}>
                <ShieldCheck size={18} color="#16a34a" />
                <span style={styles.statusLabel}>Status do Acesso:</span>
                <span style={styles.statusBadgeLiberado}>Conta Ativa & Liberada</span>
              </div>
              <div style={styles.statusRow}>
                <span style={styles.statusDot}>•</span>
                <span style={styles.statusLabel}>Rede:</span>
                <span style={styles.statusValue}>IFPE Campus Olinda</span>
              </div>
            </div>

            {/* Botões de Ação */}
            <div style={styles.actionsContainer}>
              <button
                type="button"
                onClick={handleEntrarPlataforma}
                style={styles.primaryBtn}
              >
                <span>Acessar a Plataforma Agora</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                onClick={handleIrLogin}
                style={styles.secondaryBtn}
              >
                <LogIn size={16} style={{ marginRight: '6px' }} />
                Ir para a Tela de Login
              </button>
            </div>
          </div>
        )}

        {/* 3. ESTADO: ERRO OU LINK INVÁLIDO */}
        {status === 'erro' && (
          <div style={styles.contentBox}>
            <div style={styles.iconWrapperError}>
              <AlertCircle size={44} color="#dc2626" />
            </div>
            <h2 style={styles.errorTitle}>Falha na Validação</h2>
            <p style={styles.boxDescription}>{mensagem}</p>
            <p style={styles.errorHelpText}>
              Se você já ativou sua conta anteriormente, você já pode fazer login normalmente.
            </p>

            <button
              type="button"
              onClick={handleIrLogin}
              style={styles.primaryBtn}
            >
              <span>Ir para a Tela de Login</span>
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
    backgroundColor: 'var(--bg-page, #f3f4f6)',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '16px',
    padding: '32px 28px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    border: '1px solid var(--border-color, #e5e7eb)',
    boxSizing: 'border-box',
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
    borderRadius: '20px',
    backgroundColor: 'var(--bg-hover, #f3f4f6)',
    border: '1px solid var(--border-color, #e5e7eb)',
    color: 'var(--text-main, #374151)',
    cursor: 'pointer',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
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
    fontSize: '1.4rem',
    fontWeight: '800',
    color: 'var(--text-main, #111827)',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '0.86rem',
    color: 'var(--text-muted, #6b7280)',
    margin: 0,
  },
  contentBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  iconWrapperLoading: {
    width: '68px',
    height: '68px',
    borderRadius: '50%',
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  iconWrapperSuccess: {
    width: '76px',
    height: '76px',
    borderRadius: '50%',
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.2)',
  },
  iconWrapperError: {
    width: '76px',
    height: '76px',
    borderRadius: '50%',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  boxTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text-main, #111827)',
    margin: '0 0 8px 0',
  },
  successTitle: {
    fontSize: '1.35rem',
    fontWeight: '800',
    color: '#15803d',
    margin: '0 0 8px 0',
  },
  errorTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#dc2626',
    margin: '0 0 8px 0',
  },
  boxDescription: {
    fontSize: '0.92rem',
    lineHeight: '1.6',
    color: 'var(--text-main, #4b5563)',
    margin: '0 0 16px 0',
  },
  errorHelpText: {
    fontSize: '0.84rem',
    color: 'var(--text-muted, #6b7280)',
    marginBottom: '20px',
  },
  statusCard: {
    width: '100%',
    backgroundColor: 'rgba(22, 163, 74, 0.06)',
    border: '1px solid rgba(22, 163, 74, 0.25)',
    borderRadius: '10px',
    padding: '14px 16px',
    margin: '0 0 24px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    boxSizing: 'border-box',
    textAlign: 'left',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.86rem',
  },
  statusLabel: {
    color: 'var(--text-muted, #6b7280)',
    fontWeight: '500',
  },
  statusDot: {
    color: '#16a34a',
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },
  statusValue: {
    fontWeight: '600',
    color: 'var(--text-main, #111827)',
  },
  statusBadgeLiberado: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    fontSize: '0.74rem',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '12px',
    letterSpacing: '0.3px',
  },
  actionsContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  primaryBtn: {
    width: '100%',
    padding: '13px 20px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
    transition: 'background-color 0.2s ease',
  },
  secondaryBtn: {
    width: '100%',
    padding: '11px 16px',
    backgroundColor: 'transparent',
    color: 'var(--text-main, #374151)',
    border: '1px solid var(--border-color, #d1d5db)',
    borderRadius: '10px',
    fontSize: '0.88rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
