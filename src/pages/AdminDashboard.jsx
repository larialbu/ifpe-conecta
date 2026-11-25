import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  MessageSquare,
  FileText,
  Heart,
  Mail,
  Send,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  LogOut,
  ExternalLink,
  Shield,
  Loader2,
  RefreshCw,
  Info,
  Pencil,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';

const CURSOS_OFICIAIS = [
  'Artes Visuais',
  'Computação Gráfica Integrado',
  'Computação Gráfica Subsequente',
  'Produção em Multimídia',
];

export function AdminDashboard({ onNavigateToFeed, onNavigateToLogin }) {
  const { isDark } = useTheme();
  const { logout: authLogout } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState('metricas'); // 'metricas' | 'usuarios' | 'emails'
  const [stats, setStats] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Filtros de usuários
  const [busca, setBusca] = useState('');
  const [filtroCurso, setFiltroCurso] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos' | 'admin' | 'usuario'

  // Modal de exclusão
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [sucessoExclusao, setSucessoExclusao] = useState('');

  // Modal de edição de todos os campos do usuário
  const [usuarioParaEditar, setUsuarioParaEditar] = useState(null);
  const [editando, setEditando] = useState(false);
  const [sucessoEdicao, setSucessoEdicao] = useState('');
  const [erroEdicao, setErroEdicao] = useState('');
  const [formEdicao, setFormEdicao] = useState({
    nome: '',
    email: '',
    curso: CURSOS_OFICIAIS[0],
    bio: '',
    tipo: 'usuario',
    email_verificado: true,
    senha: '',
  });

  // Formulário de disparo de e-mail
  const [assuntoEmail, setAssuntoEmail] = useState('');
  const [mensagemEmail, setMensagemEmail] = useState('');
  const [destinatarioCurso, setDestinatarioCurso] = useState('todos');
  const [disparandoEmail, setDisparandoEmail] = useState(false);
  const [resultadoDisparo, setResultadoDisparo] = useState(null);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro('');
      const [dadosStats, dadosUsuarios] = await Promise.all([
        api.adminGetStats(),
        api.adminListarUsuarios(),
      ]);
      setStats(dadosStats);
      setUsuarios(dadosUsuarios);
    } catch (err) {
      if (err.message && err.message.includes('Token')) {
        handleLogout();
      } else {
        setErro(err.message || 'Erro ao carregar dados do painel.');
      }
    } finally {
      setCarregando(false);
    }
  }

  function handleLogout() {
    api.adminLogout();
    if (authLogout) authLogout();
    if (onNavigateToLogin) {
      onNavigateToLogin();
    } else {
      window.location.assign('/admin/login');
    }
  }

  async function handleConfirmarExclusao() {
    if (!usuarioParaExcluir) return;

    try {
      setExcluindo(true);
      await api.adminRemoverUsuario(usuarioParaExcluir.id);
      setSucessoExclusao(`Usuário "${usuarioParaExcluir.nome}" foi removido com sucesso.`);
      setUsuarioParaExcluir(null);
      // Atualizar lista
      await carregarDados();
      setTimeout(() => setSucessoExclusao(''), 5000);
    } catch (err) {
      alert(`Erro ao excluir: ${err.message}`);
    } finally {
      setExcluindo(false);
    }
  }

  function handleAbrirEdicao(u) {
    setUsuarioParaEditar(u);
    setFormEdicao({
      nome: u.nome || '',
      email: u.email || '',
      curso: u.curso || CURSOS_OFICIAIS[0],
      bio: u.bio || '',
      tipo: u.tipo || 'usuario',
      email_verificado: u.email_verificado !== false,
      senha: '',
    });
    setErroEdicao('');
  }

  async function handleSalvarEdicao(e) {
    e.preventDefault();
    if (!usuarioParaEditar) return;

    if (!formEdicao.nome.trim()) {
      setErroEdicao('O nome do usuário é obrigatório.');
      return;
    }

    if (!formEdicao.email.trim()) {
      setErroEdicao('O e-mail institucional é obrigatório.');
      return;
    }

    try {
      setEditando(true);
      setErroEdicao('');

      const payload = {
        nome: formEdicao.nome.trim(),
        email: formEdicao.email.trim(),
        curso: formEdicao.curso,
        bio: formEdicao.bio,
        tipo: formEdicao.tipo,
        email_verificado: formEdicao.email_verificado,
      };

      if (formEdicao.senha && formEdicao.senha.trim()) {
        if (formEdicao.senha.trim().length < 6) {
          setErroEdicao('A nova senha deve ter no mínimo 6 caracteres.');
          setEditando(false);
          return;
        }
        payload.senha = formEdicao.senha.trim();
      }

      await api.adminAtualizarUsuario(usuarioParaEditar.id, payload);
      setSucessoEdicao(`Dados de "${formEdicao.nome}" atualizados com sucesso!`);
      setUsuarioParaEditar(null);
      await carregarDados();
      setTimeout(() => setSucessoEdicao(''), 5000);
    } catch (err) {
      setErroEdicao(err.message || 'Erro ao atualizar dados do usuário.');
    } finally {
      setEditando(false);
    }
  }

  async function handleDispararEmail(e) {
    e.preventDefault();
    if (!assuntoEmail.trim() || !mensagemEmail.trim()) {
      alert('Preencha o assunto e a mensagem do e-mail.');
      return;
    }

    try {
      setDisparandoEmail(true);
      setResultadoDisparo(null);
      const res = await api.adminDispararEmail({
        assunto: assuntoEmail.trim(),
        mensagem: mensagemEmail.trim(),
        filtroCurso: destinatarioCurso,
      });
      setResultadoDisparo({
        tipo: 'sucesso',
        mensagem: res.message || 'Disparo de e-mails concluído!',
        detalhes: res,
      });
      setAssuntoEmail('');
      setMensagemEmail('');
    } catch (err) {
      setResultadoDisparo({
        tipo: 'erro',
        mensagem: err.message || 'Erro ao processar disparo de e-mails.',
      });
    } finally {
      setDisparandoEmail(false);
    }
  }

  // Filtragem de usuários
  const usuariosFiltrados = usuarios.filter((u) => {
    const termo = busca.toLowerCase();
    const bateNome = u.nome?.toLowerCase().includes(termo);
    const bateEmail = u.email?.toLowerCase().includes(termo);
    const bateCursoFiltro = filtroCurso === 'todos' || u.curso === filtroCurso;
    const bateTipoFiltro =
      filtroTipo === 'todos' ||
      (filtroTipo === 'admin' ? u.tipo === 'admin' : u.tipo !== 'admin');
    return (bateNome || bateEmail) && bateCursoFiltro && bateTipoFiltro;
  });

  return (
    <div style={styles.container}>
      {/* Barra Superior */}
      <header style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <div style={styles.logoBadge}>
            <Shield size={20} color="#ffffff" />
          </div>
          <div>
            <div style={styles.brandTitle}>
              IFPE Chega Junto <span style={styles.adminTag}>Painel Admin</span>
            </div>
            <div style={styles.brandSubtitle}>Gestão e moderação acadêmica</div>
          </div>
        </div>

        <div style={styles.topbarRight}>
          <button
            onClick={carregarDados}
            title="Atualizar dados"
            style={styles.iconBtn}
            disabled={carregando}
          >
            <RefreshCw size={16} className={carregando ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onNavigateToFeed || (() => { window.location.href = '/'; })}
            style={styles.secondaryBtn}
          >
            <ExternalLink size={16} style={{ marginRight: '6px' }} />
            Ir para a Plataforma
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={16} style={{ marginRight: '6px' }} />
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main style={styles.main}>
        {/* Abas de Navegação */}
        <div style={styles.tabNav}>
          <button
            onClick={() => setAbaAtiva('metricas')}
            style={{
              ...styles.tabBtn,
              ...(abaAtiva === 'metricas' ? styles.tabBtnActive : {}),
            }}
          >
            <FileText size={18} style={{ marginRight: '8px' }} />
            Visão Geral & Estatísticas
          </button>

          <button
            onClick={() => setAbaAtiva('usuarios')}
            style={{
              ...styles.tabBtn,
              ...(abaAtiva === 'usuarios' ? styles.tabBtnActive : {}),
            }}
          >
            <Users size={18} style={{ marginRight: '8px' }} />
            Gestão de Usuários
            <span style={styles.tabBadge}>{usuarios.length}</span>
          </button>

          <button
            onClick={() => setAbaAtiva('emails')}
            style={{
              ...styles.tabBtn,
              ...(abaAtiva === 'emails' ? styles.tabBtnActive : {}),
            }}
          >
            <Mail size={18} style={{ marginRight: '8px' }} />
            Disparo de E-mails
          </button>
        </div>

        {erro && (
          <div style={styles.errorAlert}>
            <AlertTriangle size={20} color="#dc2626" />
            <span>{erro}</span>
          </div>
        )}

        {sucessoExclusao && (
          <div style={styles.successAlert}>
            <CheckCircle size={20} color="#16a34a" />
            <span>{sucessoExclusao}</span>
          </div>
        )}

        {sucessoEdicao && (
          <div style={styles.successAlert}>
            <CheckCircle size={20} color="#16a34a" />
            <span>{sucessoEdicao}</span>
          </div>
        )}

        {carregando && !stats ? (
          <div style={styles.loadingContainer}>
            <Loader2 size={36} className="animate-spin" color="#16a34a" />
            <p style={{ marginTop: '12px', color: 'var(--text-muted, #6b7280)' }}>
              Carregando dados da administração...
            </p>
          </div>
        ) : (
          <>
            {/* ABA 1: MÉTRICAS E ESTATÍSTICAS */}
            {abaAtiva === 'metricas' && stats && (
              <div style={styles.tabContent}>
                {/* 4 Cards Principais */}
                <div style={styles.statsGrid}>
                  <div style={styles.statCard}>
                    <div style={{ ...styles.statIconBox, backgroundColor: 'rgba(22, 163, 74, 0.12)' }}>
                      <Users size={24} color="#16a34a" />
                    </div>
                    <div>
                      <div style={styles.statNumber}>{stats.totalUsuarios}</div>
                      <div style={styles.statLabel}>Estudantes Cadastrados</div>
                    </div>
                  </div>

                  <div style={styles.statCard}>
                    <div style={{ ...styles.statIconBox, backgroundColor: 'rgba(59, 130, 246, 0.12)' }}>
                      <FileText size={24} color="#3b82f6" />
                    </div>
                    <div>
                      <div style={styles.statNumber}>{stats.totalPosts}</div>
                      <div style={styles.statLabel}>Publicações no Feed</div>
                    </div>
                  </div>

                  <div style={styles.statCard}>
                    <div style={{ ...styles.statIconBox, backgroundColor: 'rgba(245, 158, 11, 0.12)' }}>
                      <MessageSquare size={24} color="#f59e0b" />
                    </div>
                    <div>
                      <div style={styles.statNumber}>{stats.totalComentarios}</div>
                      <div style={styles.statLabel}>Comentários & Respostas</div>
                    </div>
                  </div>

                  <div style={styles.statCard}>
                    <div style={{ ...styles.statIconBox, backgroundColor: 'rgba(239, 68, 68, 0.12)' }}>
                      <Heart size={24} color="#ef4444" />
                    </div>
                    <div>
                      <div style={styles.statNumber}>{stats.totalCurtidas}</div>
                      <div style={styles.statLabel}>Curtidas Realizadas</div>
                    </div>
                  </div>
                </div>

                {/* Linha com Distribuição por Cursos e Status de E-mail */}
                <div style={styles.twoColGrid}>
                  {/* Card Cursos */}
                  <div style={styles.sectionCard}>
                    <h3 style={styles.sectionTitle}>
                      <Users size={20} color="#16a34a" style={{ marginRight: '8px' }} />
                      Estudantes por Curso
                    </h3>
                    <div style={styles.coursesList}>
                      {CURSOS_OFICIAIS.map((curso) => {
                        const qtd = stats.usuariosPorCurso?.[curso] || 0;
                        const pct = stats.totalUsuarios > 0 ? Math.round((qtd / stats.totalUsuarios) * 100) : 0;
                        return (
                          <div key={curso} style={styles.courseItem}>
                            <div style={styles.courseHeader}>
                              <span style={styles.courseName}>{curso}</span>
                              <span style={styles.courseCount}>
                                <strong>{qtd}</strong> ({pct}%)
                              </span>
                            </div>
                            <div style={styles.progressBarBg}>
                              <div
                                style={{
                                  ...styles.progressBarFill,
                                  width: `${pct}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Status do Serviço de E-mail */}
                  <div style={styles.sectionCard}>
                    <h3 style={styles.sectionTitle}>
                      <Mail size={20} color="#16a34a" style={{ marginRight: '8px' }} />
                      Serviço de Disparo de E-mails
                    </h3>

                    <div style={styles.emailStatusBox}>
                      <div style={styles.emailStatusHeader}>
                        <div
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: stats.emailService?.configurado ? '#16a34a' : '#f59e0b',
                          }}
                        >
                          {stats.emailService?.configurado ? 'SMTP / Gmail Conectado' : 'Modo Simulação / Pendente Senha de App'}
                        </div>
                      </div>

                      <p style={styles.emailStatusText}>
                        {stats.emailService?.configurado ? (
                          <>
                            Remetente oficial configurado: <strong>{stats.emailService.remetente}</strong>.
                            <br />
                            Os e-mails e comunicados disparados são entregues diretamente na caixa de entrada dos estudantes discentes.
                          </>
                        ) : (
                          <>
                            O envio de e-mails está operando em modo log/simulação no servidor.
                            <br />
                            Assim que a <strong>Senha de App</strong> for inserida nas variáveis do projeto, os e-mails serão despachados via Gmail automaticamente.
                          </>
                        )}
                      </p>

                      <div style={styles.tipBox}>
                        <Info size={18} color="#0284c7" style={{ flexShrink: 0 }} />
                        <span style={styles.tipText}>
                          Você pode disparar avisos e comunicados institucionais na aba <strong>"Disparo de E-mails"</strong>.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 2: GESTÃO DE USUÁRIOS */}
            {abaAtiva === 'usuarios' && (
              <div style={styles.tabContent}>
                {/* Barra de Filtro e Busca */}
                <div style={styles.filterBar}>
                  <div style={styles.searchWrapper}>
                    <Search size={18} color="#9ca3af" style={styles.searchIcon} />
                    <input
                      type="text"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar por nome ou e-mail..."
                      style={styles.searchInput}
                    />
                  </div>

                  <div style={styles.selectWrapper}>
                    <Filter size={18} color="#9ca3af" style={styles.searchIcon} />
                    <select
                      value={filtroCurso}
                      onChange={(e) => setFiltroCurso(e.target.value)}
                      style={styles.selectInput}
                    >
                      <option value="todos">Todos os Cursos</option>
                      {CURSOS_OFICIAIS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.selectWrapper}>
                    <Shield size={18} color="#9ca3af" style={styles.searchIcon} />
                    <select
                      value={filtroTipo}
                      onChange={(e) => setFiltroTipo(e.target.value)}
                      style={styles.selectInput}
                    >
                      <option value="todos">Todos os Tipos de Usuário</option>
                      <option value="admin">Apenas Administradores (2 Sistemas)</option>
                      <option value="usuario">Apenas Usuários Normais (Principal)</option>
                    </select>
                  </div>
                </div>

                {/* Tabela de Usuários */}
                <div style={styles.tableCard}>
                  <div style={styles.tableResponsive}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHeaderRow}>
                          <th style={styles.th}>Estudante</th>
                          <th style={styles.th}>E-mail Institucional</th>
                          <th style={styles.th}>Curso</th>
                          <th style={styles.th}>Tipo de Acesso</th>
                          <th style={styles.th}>Status Conta</th>
                          <th style={styles.th}>Cadastrado em</th>
                          <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuariosFiltrados.length === 0 ? (
                          <tr>
                            <td colSpan="7" style={styles.emptyTd}>
                              Nenhum estudante encontrado para os filtros informados.
                            </td>
                          </tr>
                        ) : (
                          usuariosFiltrados.map((u) => {
                            const dataFormatada = u.created_at
                              ? new Date(u.created_at).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                })
                              : '—';

                            const inicial = u.nome ? u.nome[0].toUpperCase() : 'U';
                            const isAdmin = u.tipo === 'admin';

                            return (
                              <tr key={u.id} style={styles.tableRow}>
                                <td style={styles.td}>
                                  <div style={styles.userCell}>
                                    <div
                                      style={{
                                        ...styles.avatarMini,
                                        backgroundColor: isAdmin ? '#7c3aed' : '#16a34a',
                                      }}
                                    >
                                      {inicial}
                                    </div>
                                    <span style={styles.userName}>{u.nome}</span>
                                  </div>
                                </td>
                                <td style={styles.td}>
                                  <span style={styles.userEmail}>{u.email}</span>
                                </td>
                                <td style={styles.td}>
                                  <span style={styles.courseBadge}>{u.curso}</span>
                                </td>
                                <td style={styles.td}>
                                  {isAdmin ? (
                                    <span style={styles.badgeAdminAccess} title="Pode entrar tanto na plataforma principal quanto no painel administrativo">
                                      Admin (Dois Sistemas) 🛡️
                                    </span>
                                  ) : (
                                    <span style={styles.badgeUserAccess} title="Acesso restrito apenas ao sistema principal">
                                      Estudante (Principal)
                                    </span>
                                  )}
                                </td>
                                <td style={styles.td}>
                                  {u.email_verificado !== false ? (
                                    <span style={styles.badgeVerificado} title="E-mail verificado e conta liberada">
                                      <CheckCircle2 size={13} style={{ marginRight: '4px' }} />
                                      Liberado
                                    </span>
                                  ) : (
                                    <span style={styles.badgePendente} title="Aguardando confirmação do e-mail institucional">
                                      <XCircle size={13} style={{ marginRight: '4px' }} />
                                      Pendente
                                    </span>
                                  )}
                                </td>
                                <td style={styles.td}>
                                  <span style={styles.dateText}>{dataFormatada}</span>
                                </td>
                                <td style={{ ...styles.td, textAlign: 'right' }}>
                                  <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button
                                      onClick={() => handleAbrirEdicao(u)}
                                      style={styles.editBtn}
                                      title="Editar todos os campos deste usuário"
                                    >
                                      <Pencil size={15} style={{ marginRight: '5px' }} />
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => setUsuarioParaExcluir(u)}
                                      style={styles.deleteBtn}
                                      title="Remover usuário do sistema"
                                    >
                                      <Trash2 size={15} style={{ marginRight: '5px' }} />
                                      Remover
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 3: DISPARO DE E-MAILS */}
            {abaAtiva === 'emails' && (
              <div style={styles.tabContent}>
                <div style={styles.twoColGrid}>
                  {/* Formulário de Envio */}
                  <div style={styles.sectionCard}>
                    <h3 style={styles.sectionTitle}>
                      <Send size={20} color="#16a34a" style={{ marginRight: '8px' }} />
                      Novo Comunicado por E-mail
                    </h3>
                    <p style={styles.formHelpText}>
                      Envie comunicados, avisos de editais e informativos diretamente para os e-mails institucionais dos estudantes cadastrados.
                    </p>

                    {resultadoDisparo && (
                      <div
                        style={{
                          ...styles.alertBox,
                          backgroundColor:
                            resultadoDisparo.tipo === 'sucesso' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          borderColor:
                            resultadoDisparo.tipo === 'sucesso' ? 'rgba(22, 163, 74, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                        }}
                      >
                        {resultadoDisparo.tipo === 'sucesso' ? (
                          <CheckCircle size={20} color="#16a34a" style={{ flexShrink: 0 }} />
                        ) : (
                          <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0 }} />
                        )}
                        <div>
                          <div
                            style={{
                              fontWeight: '600',
                              color: resultadoDisparo.tipo === 'sucesso' ? '#166534' : '#b91c1c',
                            }}
                          >
                            {resultadoDisparo.mensagem}
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleDispararEmail} style={styles.emailForm}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Público Alvo / Destinatários</label>
                        <select
                          value={destinatarioCurso}
                          onChange={(e) => setDestinatarioCurso(e.target.value)}
                          style={styles.selectInputFull}
                          disabled={disparandoEmail}
                        >
                          <option value="todos">Todos os Estudantes Cadastrados ({usuarios.length} destinatários)</option>
                          {CURSOS_OFICIAIS.map((c) => {
                            const totalNoCurso = usuarios.filter((u) => u.curso === c).length;
                            return (
                              <option key={c} value={c}>
                                Somente curso de {c} ({totalNoCurso} estudantes)
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Assunto do E-mail</label>
                        <input
                          type="text"
                          value={assuntoEmail}
                          onChange={(e) => setAssuntoEmail(e.target.value)}
                          placeholder="Ex: [Comunicado] Horários do Semestre / Edital de Assistência"
                          style={styles.inputField}
                          disabled={disparandoEmail}
                          required
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Mensagem do Comunicado</label>
                        <textarea
                          rows={6}
                          value={mensagemEmail}
                          onChange={(e) => setMensagemEmail(e.target.value)}
                          placeholder="Escreva a mensagem oficial que será enviada para os discentes..."
                          style={styles.textareaField}
                          disabled={disparandoEmail}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={disparandoEmail}
                        style={{
                          ...styles.sendBtn,
                          opacity: disparandoEmail ? 0.7 : 1,
                          cursor: disparandoEmail ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {disparandoEmail ? (
                          <>
                            <Loader2 size={18} className="animate-spin" style={{ marginRight: '8px' }} />
                            Enviando comunicado aos estudantes...
                          </>
                        ) : (
                          <>
                            <Send size={18} style={{ marginRight: '8px' }} />
                            Disparar Comunicado
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Pré-visualização do E-mail */}
                  <div style={styles.sectionCard}>
                    <h3 style={styles.sectionTitle}>
                      <Mail size={20} color="#16a34a" style={{ marginRight: '8px' }} />
                      Pré-visualização do Template
                    </h3>

                    <div style={styles.emailPreviewBox}>
                      <div style={styles.previewHeader}>
                        <div style={styles.previewLogo}>IFPE Chega Junto</div>
                        <div style={styles.previewSubject}>
                          {assuntoEmail || 'Assunto do E-mail'}
                        </div>
                        <div style={styles.previewBadge}>📢 Comunicado da Administração</div>
                      </div>

                      <div style={styles.previewBody}>
                        <div style={styles.previewGreeting}>Olá, [Nome do Estudante]!</div>
                        <div style={styles.previewMessage}>
                          {mensagemEmail ? (
                            mensagemEmail.split('\n').map((paragrafo, idx) => (
                              <p key={idx} style={{ margin: '0 0 8px 0' }}>
                                {paragrafo}
                              </p>
                            ))
                          ) : (
                            <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                              O conteúdo do seu comunicado aparecerá aqui formatado no padrão oficial do IFPE Chega Junto.
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={styles.previewFooter}>
                        © {new Date().getFullYear()} IFPE Chega Junto - Instituto Federal de Pernambuco, Campus Olinda.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de Confirmação de Exclusão */}
      {usuarioParaExcluir && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div style={styles.modalIconBox}>
                <Trash2 size={24} color="#dc2626" />
              </div>
              <h3 style={styles.modalTitle}>Excluir Estudante?</h3>
            </div>

            <p style={styles.modalBody}>
              Você está prestes a remover o usuário <strong>{usuarioParaExcluir.nome}</strong> (
              {usuarioParaExcluir.email}).
            </p>
            <div style={styles.modalWarning}>
              ⚠️ Esta ação é irreversível. Todas as publicações, respostas e interações deste estudante serão removidas permanentemente do sistema em cascata.
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={() => setUsuarioParaExcluir(null)}
                disabled={excluindo}
                style={styles.cancelBtn}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarExclusao}
                disabled={excluindo}
                style={styles.confirmDeleteBtn}
              >
                {excluindo ? (
                  <>
                    <Loader2 size={16} className="animate-spin" style={{ marginRight: '6px' }} />
                    Removendo...
                  </>
                ) : (
                  'Sim, Excluir Usuário'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Todos os Campos do Usuário */}
      {usuarioParaEditar && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ ...styles.modalIconBox, backgroundColor: 'rgba(59, 130, 246, 0.12)' }}>
                  <Pencil size={20} color="#2563eb" />
                </div>
                <div>
                  <h3 style={styles.modalTitle}>Editar Usuário</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #6b7280)' }}>
                    Altere qualquer dado cadastral do estudante ou admin
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUsuarioParaEditar(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted, #6b7280)',
                  padding: '4px',
                }}
                title="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            {erroEdicao && (
              <div style={{ ...styles.errorAlert, marginBottom: '16px', padding: '10px 14px' }}>
                <AlertTriangle size={18} color="#dc2626" />
                <span>{erroEdicao}</span>
              </div>
            )}

            <form onSubmit={handleSalvarEdicao} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Nome Completo */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nome Completo *</label>
                <input
                  type="text"
                  value={formEdicao.nome}
                  onChange={(e) => setFormEdicao({ ...formEdicao, nome: e.target.value })}
                  style={styles.inputField}
                  required
                />
              </div>

              {/* E-mail Institucional */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>E-mail Institucional (@discente.ifpe.edu.br ou @ifpe.edu.br) *</label>
                <input
                  type="email"
                  value={formEdicao.email}
                  onChange={(e) => setFormEdicao({ ...formEdicao, email: e.target.value })}
                  style={styles.inputField}
                  required
                />
              </div>

              {/* Curso */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Curso no IFPE Campus Olinda *</label>
                <select
                  value={formEdicao.curso}
                  onChange={(e) => setFormEdicao({ ...formEdicao, curso: e.target.value })}
                  style={styles.selectInputFull}
                >
                  {CURSOS_OFICIAIS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid 2 colunas: Tipo de Acesso e Status da Conta */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Tipo de Permissão</label>
                  <select
                    value={formEdicao.tipo}
                    onChange={(e) => setFormEdicao({ ...formEdicao, tipo: e.target.value })}
                    style={styles.selectInputFull}
                  >
                    <option value="usuario">Estudante (Principal)</option>
                    <option value="admin">Administrador (2 Sistemas 🛡️)</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Status do Acesso</label>
                  <select
                    value={formEdicao.email_verificado ? 'true' : 'false'}
                    onChange={(e) => setFormEdicao({ ...formEdicao, email_verificado: e.target.value === 'true' })}
                    style={styles.selectInputFull}
                  >
                    <option value="true">Liberado / Ativo ✅</option>
                    <option value="false">Pendente de Confirmação ⏳</option>
                  </select>
                </div>
              </div>

              {/* Biografia */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Biografia / Apresentação</label>
                <textarea
                  rows={2}
                  value={formEdicao.bio}
                  onChange={(e) => setFormEdicao({ ...formEdicao, bio: e.target.value })}
                  placeholder="Descrição ou biografia acadêmica..."
                  style={styles.textareaField}
                />
              </div>

              {/* Redefinir Senha */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Redefinir Senha <span style={{ fontWeight: 'normal', color: 'var(--text-muted, #6b7280)', fontSize: '0.8rem' }}>(deixe vazio para não alterar)</span>
                </label>
                <input
                  type="password"
                  value={formEdicao.senha}
                  onChange={(e) => setFormEdicao({ ...formEdicao, senha: e.target.value })}
                  placeholder="Nova senha com no mínimo 6 caracteres"
                  style={styles.inputField}
                />
              </div>

              <div style={{ ...styles.modalActions, marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setUsuarioParaEditar(null)}
                  disabled={editando}
                  style={styles.cancelBtn}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editando}
                  style={{
                    ...styles.sendBtn,
                    padding: '9px 18px',
                    fontSize: '0.88rem',
                  }}
                >
                  {editando ? (
                    <>
                      <Loader2 size={16} className="animate-spin" style={{ marginRight: '6px' }} />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-page, #f3f4f6)',
    color: 'var(--text-main, #111827)',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 24px',
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderBottom: '1px solid var(--border-color, #e5e7eb)',
    position: 'sticky',
    top: 0,
    zIndex: 40,
  },
  topbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoBadge: {
    width: '38px',
    height: '38px',
    backgroundColor: '#15803d',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)',
  },
  brandTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: 'var(--text-main, #111827)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  adminTag: {
    backgroundColor: '#15803d',
    color: '#ffffff',
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  brandSubtitle: {
    fontSize: '0.8rem',
    color: 'var(--text-muted, #6b7280)',
  },
  topbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  iconBtn: {
    padding: '8px',
    backgroundColor: 'var(--bg-input, #f3f4f6)',
    border: '1px solid var(--border-color, #e5e7eb)',
    borderRadius: '8px',
    color: 'var(--text-main, #374151)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    padding: '8px 14px',
    backgroundColor: 'var(--bg-input, #f3f4f6)',
    border: '1px solid var(--border-color, #e5e7eb)',
    borderRadius: '8px',
    color: 'var(--text-main, #374151)',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  logoutBtn: {
    padding: '8px 14px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
    color: '#dc2626',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 20px 60px 20px',
  },
  tabNav: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid var(--border-color, #e5e7eb)',
    paddingBottom: '12px',
    marginBottom: '24px',
    overflowX: 'auto',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 18px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.92rem',
    fontWeight: '600',
    color: 'var(--text-muted, #6b7280)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabBtnActive: {
    backgroundColor: '#15803d',
    color: '#ffffff',
  },
  tabBadge: {
    marginLeft: '8px',
    padding: '2px 8px',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: '12px',
    fontSize: '0.78rem',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  statCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid var(--border-color, #e5e7eb)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
  },
  statIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: '1.65rem',
    fontWeight: '800',
    color: 'var(--text-main, #111827)',
    lineHeight: '1.2',
  },
  statLabel: {
    fontSize: '0.82rem',
    color: 'var(--text-muted, #6b7280)',
    fontWeight: '500',
  },
  twoColGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
    gap: '20px',
  },
  sectionCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid var(--border-color, #e5e7eb)',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-main, #111827)',
    margin: '0 0 16px 0',
    display: 'flex',
    alignItems: 'center',
  },
  coursesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  courseItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  courseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.88rem',
  },
  courseName: {
    fontWeight: '600',
    color: 'var(--text-main, #374151)',
  },
  courseCount: {
    color: 'var(--text-muted, #6b7280)',
  },
  progressBarBg: {
    width: '100%',
    height: '8px',
    backgroundColor: 'var(--bg-input, #e5e7eb)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#16a34a',
    borderRadius: '4px',
    transition: 'width 0.4s ease',
  },
  emailStatusBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  emailStatusHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  statusBadge: {
    color: '#ffffff',
    fontSize: '0.8rem',
    fontWeight: '700',
    padding: '6px 12px',
    borderRadius: '20px',
  },
  emailStatusText: {
    fontSize: '0.88rem',
    lineHeight: '1.6',
    color: 'var(--text-main, #4b5563)',
    margin: 0,
  },
  tipBox: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
    border: '1px solid rgba(2, 132, 199, 0.2)',
    padding: '12px 14px',
    borderRadius: '8px',
  },
  tipText: {
    fontSize: '0.82rem',
    color: '#0369a1',
    lineHeight: '1.5',
  },
  filterBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  searchWrapper: {
    flex: '1 1 300px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px 10px 38px',
    fontSize: '0.9rem',
    border: '1px solid var(--border-color, #d1d5db)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-input, #ffffff)',
    color: 'var(--text-main, #111827)',
    outline: 'none',
  },
  selectWrapper: {
    flex: '0 1 260px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  selectInput: {
    width: '100%',
    padding: '10px 14px 10px 38px',
    fontSize: '0.9rem',
    border: '1px solid var(--border-color, #d1d5db)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-input, #ffffff)',
    color: 'var(--text-main, #111827)',
    outline: 'none',
  },
  tableCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e5e7eb)',
    overflow: 'hidden',
  },
  tableResponsive: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeaderRow: {
    backgroundColor: 'var(--bg-input, #f9fafb)',
    borderBottom: '1px solid var(--border-color, #e5e7eb)',
  },
  th: {
    padding: '12px 16px',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-muted, #6b7280)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableRow: {
    borderBottom: '1px solid var(--border-color, #f3f4f6)',
  },
  td: {
    padding: '14px 16px',
    fontSize: '0.88rem',
    verticalAlign: 'middle',
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatarMini: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.85rem',
  },
  userName: {
    fontWeight: '600',
    color: 'var(--text-main, #111827)',
  },
  userEmail: {
    color: 'var(--text-muted, #4b5563)',
    fontSize: '0.84rem',
  },
  courseBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.78rem',
    fontWeight: '600',
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    color: '#166534',
  },
  badgeAdminAccess: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.76rem',
    fontWeight: '700',
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    color: '#6d28d9',
    border: '1px solid rgba(124, 58, 237, 0.25)',
  },
  badgeUserAccess: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.76rem',
    fontWeight: '600',
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    color: 'var(--text-muted, #4b5563)',
  },
  dateText: {
    color: 'var(--text-muted, #6b7280)',
    fontSize: '0.82rem',
  },
  badgeVerificado: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.74rem',
    fontWeight: '700',
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    color: '#166534',
    border: '1px solid rgba(22, 163, 74, 0.25)',
  },
  badgePendente: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.74rem',
    fontWeight: '700',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: '#b45309',
    border: '1px solid rgba(245, 158, 11, 0.25)',
  },
  editBtn: {
    padding: '6px 12px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.25)',
    borderRadius: '6px',
    color: '#2563eb',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'background-color 0.15s ease',
  },
  deleteBtn: {
    padding: '6px 12px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '6px',
    color: '#dc2626',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'background-color 0.15s ease',
  },
  emptyTd: {
    padding: '36px',
    textAlign: 'center',
    color: 'var(--text-muted, #6b7280)',
    fontSize: '0.9rem',
  },
  formHelpText: {
    fontSize: '0.85rem',
    color: 'var(--text-muted, #6b7280)',
    marginTop: '-8px',
    marginBottom: '16px',
  },
  alertBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid',
    marginBottom: '16px',
  },
  emailForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.84rem',
    fontWeight: '600',
    color: 'var(--text-main, #374151)',
  },
  selectInputFull: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '0.9rem',
    border: '1px solid var(--border-color, #d1d5db)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-input, #ffffff)',
    color: 'var(--text-main, #111827)',
    outline: 'none',
  },
  inputField: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '0.9rem',
    border: '1px solid var(--border-color, #d1d5db)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-input, #ffffff)',
    color: 'var(--text-main, #111827)',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textareaField: {
    width: '100%',
    padding: '12px',
    fontSize: '0.9rem',
    border: '1px solid var(--border-color, #d1d5db)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-input, #ffffff)',
    color: 'var(--text-main, #111827)',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    lineHeight: '1.5',
  },
  sendBtn: {
    marginTop: '6px',
    padding: '12px 20px',
    backgroundColor: '#15803d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.92rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailPreviewBox: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
  previewHeader: {
    background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
    padding: '20px',
    textAlign: 'center',
    color: '#ffffff',
  },
  previewLogo: {
    fontSize: '1.1rem',
    fontWeight: '800',
    backgroundColor: '#ffffff',
    color: '#15803d',
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: '6px',
    marginBottom: '8px',
  },
  previewSubject: {
    fontSize: '1rem',
    fontWeight: '700',
  },
  previewBadge: {
    fontSize: '0.72rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.2)',
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '12px',
    marginTop: '6px',
  },
  previewBody: {
    padding: '20px',
    color: '#374151',
    lineHeight: '1.6',
    fontSize: '0.88rem',
  },
  previewGreeting: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: '10px',
  },
  previewMessage: {
    backgroundColor: '#f9fafb',
    borderLeft: '4px solid #16a34a',
    padding: '12px 14px',
    borderRadius: '4px',
  },
  previewFooter: {
    backgroundColor: '#f9fafb',
    borderTop: '1px solid #e5e7eb',
    padding: '12px',
    textAlign: 'center',
    fontSize: '0.72rem',
    color: '#9ca3af',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '20px',
  },
  modalCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '14px',
    padding: '28px',
    maxWidth: '460px',
    width: '100%',
    border: '1px solid var(--border-color, #e5e7eb)',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '14px',
  },
  modalIconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'var(--text-main, #111827)',
  },
  modalBody: {
    fontSize: '0.92rem',
    color: 'var(--text-main, #374151)',
    lineHeight: '1.5',
    margin: '0 0 12px 0',
  },
  modalWarning: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '0.82rem',
    color: '#b91c1c',
    lineHeight: '1.4',
    marginBottom: '20px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  cancelBtn: {
    padding: '9px 16px',
    backgroundColor: 'var(--bg-input, #f3f4f6)',
    border: '1px solid var(--border-color, #d1d5db)',
    borderRadius: '8px',
    fontSize: '0.88rem',
    fontWeight: '600',
    color: 'var(--text-main, #374151)',
    cursor: 'pointer',
  },
  confirmDeleteBtn: {
    padding: '9px 16px',
    backgroundColor: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.88rem',
    fontWeight: '600',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
    color: '#dc2626',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    border: '1px solid rgba(22, 163, 74, 0.3)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
    color: '#166534',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
};

