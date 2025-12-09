import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // 1. Leemos el token DIRECTAMENTE en la inicialización (Lazy initialization)
  // Esto hace que el valor esté disponible desde el milisegundo 0
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  
  // 2. isAuthenticated también se calcula de inmediato
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  
  // 3. Agregamos un estado de "Cargando" para procesos asíncronos futuros
  // (Aunque con el cambio de arriba ya debería funcionar, esto es buena práctica)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sincronizamos estado
    setIsAuthenticated(!!token);
    setLoading(false); // Terminamos de revisar
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        return { success: false, message: 'Credenciales inválidas' };
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setIsAuthenticated(true);
      return { success: true };

    } catch (error) {
      console.error("Error de conexión:", error);
      return { success: false, message: 'Error de servidor' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};