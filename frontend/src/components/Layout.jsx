import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import miFondoLocal from '../assets/fondo-scout.jpg'; 

const colors = {
  primaryCyan: '#00B4D8',
  darkText: '#222222',
  white: '#ffffff',
  lightBg: '#f8f9fa',
  hoverCyan: '#0096B4'
};

function Layout({ children }) {
  // --- LÓGICA DEL MENÚ (Movida desde Home) ---
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Función para navegar y cerrar menú al mismo tiempo
  const handleNavigation = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  // --- ESTILOS GLOBALES ---
  const pageBackgroundStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1,
    backgroundImage: `url(${miFondoLocal})`,
    backgroundSize: 'cover', backgroundPosition: 'center',
    filter: 'blur(4px) brightness(0.9)', transform: 'scale(1.1)'
  };

  const navbarStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%',
    backgroundColor: colors.primaryCyan, height: '60px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 20px', zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    boxSizing: 'border-box'
  };

  const navLinksContainerStyle = isMobile ? {
    position: 'absolute', top: '60px', left: 0, width: '100%',
    backgroundColor: colors.primaryCyan, flexDirection: 'column',
    alignItems: 'center', padding: '20px 0', display: menuOpen ? 'flex' : 'none',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  } : { display: 'flex', flexDirection: 'row', gap: '30px' };

  const linkStyle = {
    color: colors.darkText, textDecoration: 'none', fontSize: '1rem',
    fontWeight: '500', cursor: 'pointer', padding: isMobile ? '15px 0' : '0',
    width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'center' : 'left'
  };

  const hamburgerButtonStyle = {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '1.8rem', color: colors.darkText, display: isMobile ? 'block' : 'none'
  };

  const mainContentContainer = {
    paddingTop: '80px', // El espacio para la navbar
    minHeight: '100vh', 
    boxSizing: 'border-box'
  };

  return (
    <>
      <div style={pageBackgroundStyle}></div>

      {/* NAVBAR */}
      <nav style={navbarStyle}>
        <div style={{...linkStyle, fontWeight: 'bold', fontSize: '1.2rem'}} onClick={() => handleNavigation('/')}>
          PUKARA WECHE
        </div>

        <button style={hamburgerButtonStyle} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>

        <div style={navLinksContainerStyle}>
          <a style={linkStyle} onClick={() => handleNavigation('/ramas')}>Ramas</a>
          <a style={linkStyle} onClick={() => handleNavigation('/miembros')}>Miembros</a>
          <a style={linkStyle} onClick={() => handleNavigation('/inventario')}>Inventario</a>
          <a style={linkStyle} onClick={() => handleNavigation('/eventos')}>Eventos</a>
          <a style={linkStyle} onClick={() => handleNavigation('/adultos')}>Equipo</a>
        </div>
      </nav>

      {/* CONTENIDO DE LAS PÁGINAS */}
      <main style={mainContentContainer}>
        {children}
      </main>
    </>
  );
}

export default Layout;