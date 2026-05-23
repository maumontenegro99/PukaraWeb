import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Layout from './components/Layout';
import Home from './pages/Home';
import Ramas from './pages/Ramas';
import Miembros from './pages/Miembros';
import Login from './pages/Login';
import Inventario from './pages/Inventario';
import Eventos from './pages/Eventos'; 
import Equipo from './pages/Equipo';
import CrearNoticia from './components/CrearNoticia';
import ListadoNoticias from './pages/ListadoNoticias';

// COMPONENTE PROTECTOR MEJORADO
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // 1. Si estamos cargando (verificando token), mostramos un mensaje de espera
  if (loading) {
    return (
        <div style={{
            height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', 
            backgroundColor: '#f8f9fa', color: '#00B4D8', fontFamily: 'sans-serif'
        }}>
            Cargando Pukara Weche...
        </div>
    ); 
  }

  // 2. Si terminó de cargar y NO está autenticado -> Redirige al Login
  // 3. Si terminó de cargar y SÍ está autenticado -> Concede acceso
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta Pública Independiente */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Privadas / Estructura del Panel de Gestión */}
          <Route path="/" element={<PrivateRoute><Layout><Home /></Layout></PrivateRoute>} />
          
          {/* Nueva Vista de Noticias con la misma estructura en la barra superior */}
          <Route path="/noticias" element={<PrivateRoute><Layout><ListadoNoticias /></Layout></PrivateRoute>} />
          
          <Route path="/ramas" element={<PrivateRoute><Layout><Ramas /></Layout></PrivateRoute>} />
          <Route path="/miembros" element={<PrivateRoute><Layout><Miembros /></Layout></PrivateRoute>} />
          <Route path="/inventario" element={<PrivateRoute><Layout><Inventario /></Layout></PrivateRoute>} />
          <Route path="/eventos" element={<PrivateRoute><Layout><Eventos /></Layout></PrivateRoute>} />
          <Route path="/equipo" element={<PrivateRoute><Layout><Equipo /></Layout></PrivateRoute>} />
          
          {/* Formulario de Redacción */}
          <Route path="/crear-noticia" element={<PrivateRoute><Layout><CrearNoticia /></Layout></PrivateRoute>} />
          
          {/* Redirección Automática por Defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;