import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, getCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If a token exists, validate it with the server and set user.
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('anyaaUser');

    const init = async () => {
      if (token) {
        try {
          const me = await getCurrentUser();
          setUser(me);
          // keep anyaaUser in sync for UI persistence
          localStorage.setItem('anyaaUser', JSON.stringify(me));
        } catch (err) {
          // invalid token: clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('anyaaUser');
          setUser(null);
        }
      } else if (savedUser) {
        // savedUser without token should NOT auto-authenticate; clear it
        localStorage.removeItem('anyaaUser');
        setUser(null);
      }
      setLoading(false);
    };

    init();
  }, []);

  const login = async (email, password) => {
    try {
      const userData = await apiLogin(email, password);
      setUser(userData);
      localStorage.setItem('anyaaUser', JSON.stringify(userData));
      return true;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('anyaaUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
