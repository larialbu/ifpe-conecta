import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoredUser() {
      const storedToken = localStorage.getItem('ifpe_Conecta_token') || localStorage.getItem('ifpe_admin_token');
      const storedUser = localStorage.getItem('ifpe_Conecta_user');

      if (storedToken) {
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error('Falha ao restaurar sessão', e);
          }
        }
        // Validação e sincronização automática com a API
        api.getMe()
          .then((data) => {
            if (data?.usuario) {
              setUser(data.usuario);
              localStorage.setItem('ifpe_Conecta_user', JSON.stringify(data.usuario));
            }
          })
          .catch(() => {
            // Silencioso se offline/erro de rede temporário
          });
      }
      setLoading(false);
    }
    loadStoredUser();
  }, []);

  function setSessionUser(userData, token) {
    if (token) {
      localStorage.setItem('ifpe_Conecta_token', token);
      localStorage.setItem('ifpe_admin_token', token);
    }
    if (userData) {
      localStorage.setItem('ifpe_Conecta_user', JSON.stringify(userData));
      setUser(userData);
    }
  }

  async function login(email, senha) {
    const data = await api.login(email, senha);
    if (data.token && data.usuario) {
      setSessionUser(data.usuario, data.token);
    }
    return data;
  }

  async function registro(nome, email, curso, senha) {
    const data = await api.registro(nome, email, curso, senha);
    if (data.token && data.usuario && !data.aguardandoConfirmacao) {
      setSessionUser(data.usuario, data.token);
    }
    return data;
  }

  async function confirmarEmail(token) {
    const data = await api.confirmarEmail(token);
    if (data.token && data.usuario) {
      setSessionUser(data.usuario, data.token);
    }
    return data;
  }

  async function reenviarConfirmacao(email) {
    return await api.reenviarConfirmacao(email);
  }

  async function atualizarPerfil(dados) {
    const data = await api.atualizarPerfil(dados);
    if (data.usuario) {
      localStorage.setItem('ifpe_Conecta_user', JSON.stringify(data.usuario));
      if (data.token) {
        localStorage.setItem('ifpe_Conecta_token', data.token);
      }
      setUser(data.usuario);
    }
    return data;
  }

  function logout() {
    localStorage.removeItem('ifpe_Conecta_token');
    localStorage.removeItem('ifpe_Conecta_user');
    localStorage.removeItem('ifpe_admin_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        registro,
        confirmarEmail,
        reenviarConfirmacao,
        atualizarPerfil,
        setSessionUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
