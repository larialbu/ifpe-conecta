import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoredUser() {
      const storedToken = localStorage.getItem('ifpe_Conecta_token');
      const storedUser = localStorage.getItem('ifpe_Conecta_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Opcional: validação assíncrona com API
          api.getMe()
            .then((data) => {
              if (data?.usuario) {
                setUser(data.usuario);
                localStorage.setItem('ifpe_Conecta_user', JSON.stringify(data.usuario));
              }
            })
            .catch(() => {
              // Se token expirou, desloga
              // logout();
            });
        } catch (e) {
          console.error('Falha ao restaurar sessão', e);
        }
      }
      setLoading(false);
    }
    loadStoredUser();
  }, []);

  async function login(email, senha) {
    const data = await api.login(email, senha);
    if (data.token && data.usuario) {
      localStorage.setItem('ifpe_Conecta_token', data.token);
      localStorage.setItem('ifpe_Conecta_user', JSON.stringify(data.usuario));
      setUser(data.usuario);
    }
    return data;
  }

  async function registro(nome, email, curso, senha) {
    const data = await api.registro(nome, email, curso, senha);
    if (data.token && data.usuario) {
      localStorage.setItem('ifpe_Conecta_token', data.token);
      localStorage.setItem('ifpe_Conecta_user', JSON.stringify(data.usuario));
      setUser(data.usuario);
    }
    return data;
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
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        registro,
        atualizarPerfil,
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
