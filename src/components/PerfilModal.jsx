import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  GraduationCap,
  FileText,
  Lock,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const CURSOS_IFPE = [
  'Artes Visuais',
  'Computação Gráfica',
  'Técnico em Computação Gráfica',
];

export function PerfilModal({ isOpen, onClose }) {
  const { user, atualizarPerfil } = useAuth();

  const [nome, setNome] = useState(user?.nome || '');
  const [curso, setCurso] = useState(user?.curso || CURSOS_IFPE[0]);
  const [bio, setBio] = useState(user?.bio || '');
  const [mostrarAlterarSenha, setMostrarAlterarSenha] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  // Atualiza os dados quando o modal abre ou o usuário muda
  React.useEffect(() => {
    if (user && isOpen) {
      setNome(user.nome || '');
      setCurso(user.curso || CURSOS_IFPE[0]);
      setBio(user.bio || '');
      setNovaSenha('');
      setConfirmarSenha('');
      setMostrarAlterarSenha(false);
      setMensagemSucesso('');
      setMensagemErro('');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagemSucesso('');
    setMensagemErro('');

    if (!nome.trim()) {
      setMensagemErro('O nome não pode estar vazio.');
      return;
    }

    if (mostrarAlterarSenha && novaSenha) {
      if (novaSenha.length < 6) {
        setMensagemErro('A nova senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (novaSenha !== confirmarSenha) {
        setMensagemErro('As senhas informadas não coincidem.');
        return;
      }
    }

    try {
      setSalvando(true);
      const payload = {
        nome: nome.trim(),
        curso: curso.trim(),
        bio: bio.trim(),
      };

      if (mostrarAlterarSenha && novaSenha.trim()) {
        payload.novaSenha = novaSenha.trim();
      }

      await atualizarPerfil(payload);
      setMensagemSucesso('Perfil atualizado com sucesso!');
      setTimeout(() => {
        setMensagemSucesso('');
      }, 3000);
    } catch (err) {
      setMensagemErro(err.message || 'Falha ao salvar alterações.');
    } finally {
      setSalvando(false);
    }
  }

  const iniciais = (nome || 'U').charAt(0).toUpperCase();

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
        className="modal-container animate-fade-in"
      >
        {/* Topo do Modal */}
        <div style={styles.header}>
          <div style={styles.headerTitleGroup}>
            <div style={styles.avatarLarge}>{iniciais}</div>
            <div>
              <h2 style={styles.modalTitle}>Meu Perfil Estudantil</h2>
              <span style={styles.modalSubtitle}>Gerencie suas informações no IFPE Olinda Conecta</span>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Fechar modal">
            <X size={20} />
          </button>
        </div>

        {mensagemSucesso && (
          <div style={styles.alertSuccess}>
            <CheckCircle size={18} />
            <span>{mensagemSucesso}</span>
          </div>
        )}

        {mensagemErro && (
          <div style={styles.alertError}>
            <AlertCircle size={18} />
            <span>{mensagemErro}</span>
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
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          {/* E-mail Institucional (Bloqueado) */}
          <div style={styles.inputGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>E-mail Discente Oficial</label>
              <span style={styles.verifiedBadge}>
                <ShieldCheck size={13} color="var(--color-primary)" />
                <span>Verificado pelo IFPE</span>
              </span>
            </div>
            <div style={styles.inputWrapper}>
              <Mail size={18} color="var(--text-muted)" style={styles.inputIcon} />
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                disabled
                style={styles.inputDisabled}
              />
            </div>
            <span style={styles.helperText}>
              O e-mail discente é vinculado à sua matrícula institucional e não pode ser alterado.
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

          {/* Minibiografia / Interesses */}
          <div style={styles.inputGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>Sobre Você / Interesses Acadêmicos</label>
              <span style={styles.helperText}>Opcional</span>
            </div>
            <div style={styles.inputWrapper}>
              <textarea
                placeholder="Ex: Aluno do 4º período, focado em frontend e projetos de extensão. Busco equipes para hackathons e TCC."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={styles.textarea}
                rows={3}
                maxLength={240}
              />
            </div>
            <span style={styles.helperText}>{bio.length}/240 caracteres</span>
          </div>

          {/* Seção Alterar Senha */}
          <div style={styles.passwordSection}>
            <button
              type="button"
              onClick={() => setMostrarAlterarSenha(!mostrarAlterarSenha)}
              style={styles.togglePasswordBtn}
            >
              <Lock size={15} color="var(--color-primary)" />
              <span>{mostrarAlterarSenha ? 'Cancelar alteração de senha' : 'Deseja alterar sua senha?'}</span>
            </button>

            {mostrarAlterarSenha && (
              <div style={styles.passwordInputsRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nova Senha (mín. 6 dígitos)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    style={styles.input}
                    minLength={6}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Confirmar Nova Senha</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    style={styles.input}
                    minLength={6}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Rodapé com Botões */}
          <div style={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelBtn}
              disabled={salvando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={styles.saveBtn}
              disabled={salvando}
            >
              <Save size={16} />
              <span>{salvando ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '12px',
  },
  modal: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    maxWidth: '540px',
    maxHeight: '92vh',
    overflowY: 'auto',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-lg)',
    padding: '20px 18px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '16px',
    marginBottom: '20px',
  },
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  avatarLarge: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '1.25rem',
    boxShadow: '0 2px 8px rgba(22, 163, 74, 0.35)',
  },
  modalTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    letterSpacing: '-0.02em',
  },
  modalSubtitle: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  closeBtn: {
    color: 'var(--text-muted)',
    padding: '6px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--color-primary-light)',
    color: 'var(--color-primary)',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '16px',
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--color-accent-light)',
    color: 'var(--color-accent)',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '16px',
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
  verifiedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.72rem',
    fontWeight: '600',
    color: 'var(--color-primary)',
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
    padding: '10px 14px 10px 40px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-input)',
    fontSize: '0.88rem',
    outline: 'none',
  },
  inputDisabled: {
    width: '100%',
    padding: '10px 14px 10px 40px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-hover)',
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
    cursor: 'not-allowed',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '10px 14px 10px 40px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-input)',
    fontSize: '0.88rem',
    outline: 'none',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-input)',
    fontSize: '0.88rem',
    lineHeight: '1.45',
    resize: 'vertical',
    outline: 'none',
  },
  helperText: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },
  passwordSection: {
    backgroundColor: 'var(--bg-card-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
    border: '1px dashed var(--border-color)',
  },
  togglePasswordBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--color-primary)',
    fontWeight: '700',
    fontSize: '0.82rem',
  },
  passwordInputsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginTop: '12px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '16px',
    marginTop: '8px',
  },
  cancelBtn: {
    padding: '9px 18px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    borderRadius: 'var(--radius-md)',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    padding: '9px 20px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.88rem',
    fontWeight: '700',
    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
  },
};
