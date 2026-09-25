import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TemaProvider } from './context/TemaContext';

import PortalLayout from './layouts/PortalLayout';
import AdminLayout from './layouts/AdminLayout';
import BibliotecaLayout from './layouts/BibliotecaLayout';

import PortalHome from './pages/portal/PortalHome';
import Noticias from './pages/portal/Noticias';
import NoticiaDetalle from './pages/portal/NoticiaDetalle';
import Login from './pages/Login';
import BibliotecaInicio from './pages/biblioteca/BibliotecaInicio';
import EnviarAutorizacion from './pages/biblioteca/EnviarAutorizacion';
import Pagar from './pages/biblioteca/Pagar';

import AdminInicio from './pages/admin/AdminInicio';
import AdminDocumentos from './pages/admin/AdminDocumentos';
import AdminAutorizaciones from './pages/admin/AdminAutorizaciones';
import Ramas from './pages/Ramas';
import Miembros from './pages/Miembros';
import Inventario from './pages/Inventario';
import Eventos from './pages/Eventos';
import Equipo from './pages/Equipo';
import AdminNoticias from './pages/admin/AdminNoticias';
import EditorNoticia from './pages/admin/EditorNoticia';
import AdminPagos from './pages/admin/AdminPagos';
import AdminCobro from './pages/admin/AdminCobro';

// Protege el panel: sin sesión, manda al login y recuerda a dónde se quería ir.
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  return isAuthenticated ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />;
};

function App() {
  return (
    <TemaProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Portal público: familias, interesados y otros grupos */}
            <Route element={<PortalLayout />}>
              <Route index element={<PortalHome />} />
              <Route path="noticias" element={<Noticias />} />
              <Route path="noticias/:id" element={<NoticiaDetalle />} />
            </Route>

            {/* Biblioteca: manuales y formularios abiertos a todos; envío de autorizaciones firmadas */}
            <Route path="/biblioteca" element={<BibliotecaLayout />}>
              <Route index element={<BibliotecaInicio />} />
              <Route path="autorizaciones" element={<EnviarAutorizacion />} />
              <Route path="pagos" element={<Pagar />} />
            </Route>

            <Route path="/login" element={<Login />} />

            {/* Panel administrativo: requiere sesión */}
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<AdminInicio />} />
              <Route path="ramas" element={<Ramas />} />
              <Route path="miembros" element={<Miembros />} />
              <Route path="equipo" element={<Equipo />} />
              <Route path="inventario" element={<Inventario />} />
              <Route path="eventos" element={<Eventos />} />
              <Route path="noticias" element={<AdminNoticias />} />
              <Route path="noticias/nueva" element={<EditorNoticia />} />
              <Route path="noticias/:id" element={<EditorNoticia />} />
              <Route path="biblioteca" element={<AdminDocumentos />} />
              <Route path="autorizaciones" element={<AdminAutorizaciones />} />
              <Route path="pagos" element={<AdminPagos />} />
              <Route path="pagos/:id" element={<AdminCobro />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </TemaProvider>
  );
}

export default App;
