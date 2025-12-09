import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserWidget from './UserWidget'; // <--- 1. Importamos el Widget
import miFondoLocal from '../assets/fondo-scout.jpg'; 
import insignia from '../assets/insignia.png';
import iconFacebook from '../assets/icon-facebook.png'; 
import iconInstagram from '../assets/icon-instagram.png';
import iconMail from '../assets/icon-mail.png';
import iconMap from '../assets/icon-map.png';
import iconAsosiacion from '../assets/logo-asosiacion.png';

const colors = {
  primaryCyan: '#00B4D8',
  darkText: '#222222',
  white: '#ffffff',
  lightBg: '#f8f9fa',
  hoverCyan: '#0096B4'
};

function Layout({ children }) {
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

  const handleNavigation = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  // --- ESTILOS ---
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

  const appWrapperStyle = {
    display: 'flex', flexDirection: 'column', minHeight: '100vh', 
  };

  const mainContentContainer = {
    paddingTop: '80px', flex: 1, boxSizing: 'border-box', paddingBottom: '40px' 
  };

  // --- ESTILOS DEL FOOTER ---
  const footerStyle = {
    backgroundColor: '#222', color: '#fff', padding: '30px 20px', textAlign: 'center',
    borderTop: `4px solid ${colors.primaryCyan}`, marginTop: 'auto' 
  };

  const footerContentStyle = {
    maxWidth: '1000px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', 
    justifyContent: 'center', gap: '30px', alignItems: 'center'
  };

  const footerItemStyle = {
    display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem',
    color: '#ddd', textDecoration: 'none' 
  };

  const iconStyle = {
    width: '24px', height: '24px', objectFit: 'contain', filter: 'invert(1)' 
  };

  const associationLogoStyle = {
    height: '60px', width: 'auto', marginTop: '10px', objectFit: 'contain'
  };

  return (
    <div style={appWrapperStyle}>
      <div style={pageBackgroundStyle}></div>

      {/* NAVBAR */}
      <nav style={navbarStyle}>
        {/* LOGO + NOMBRE DEL GRUPO */}
        <div 
            style={{
                ...linkStyle, 
                fontWeight: 'bold', 
                fontSize: '1.2rem',
                display: 'flex',        
                alignItems: 'center',   
                gap: '10px'             
            }} 
            onClick={() => handleNavigation('/')}
        >
          {/* Orden: Insignia primero, luego Texto */}
          <img src={insignia} alt="Logo" style={{ height: '40px', width: 'auto' }} />
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

      {/* CONTENIDO PRINCIPAL */}
      <main style={mainContentContainer}>
        {children}
      </main>

      {/* 2. AQUÍ INSERTAMOS EL WIDGET DE USUARIO */}
      <UserWidget />

      {/* FOOTER */}
      <footer style={footerStyle}>
        <div style={footerContentStyle}>
            <a href="https://www.facebook.com/pukaraweche" target="_blank" rel="noopener noreferrer" style={footerItemStyle}>
                <img src={iconFacebook} alt="FB" style={iconStyle} />
                <span>Pukara Weche</span>
            </a>
            <a href="https://www.instagram.com/pukaraweche" target="_blank" rel="noopener noreferrer" style={footerItemStyle}>
                <img src={iconInstagram} alt="IG" style={iconStyle} />
                <span>@pukaraweche</span>
            </a>
            <a href="mailto:pukaraweche@gmail.com" style={footerItemStyle}>
                <img src={iconMail} alt="Mail" style={iconStyle} />
                <span>pukaraweche@gmail.com</span>
            </a>
            <a href="https://maps.app.goo.gl/WWYeVVZFBZ2wPEYe7" target="_blank" rel="noopener noreferrer" style={footerItemStyle}>
                <img src={iconMap} alt="Map" style={iconStyle} />
                <span>Ver Ubicación</span>
            </a>
        </div>
        
        <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                © 2025 Grupo Scout Pukara Weche
            </span>
            <a href="https://guiasyscoutsdechile.org/" target="_blank" rel="noopener noreferrer" style={{ cursor: 'pointer' }}>
                <img src={iconAsosiacion} alt="Asociación de Guías y Scouts de Chile" style={associationLogoStyle} />
            </a>
        </div>
      </footer>
    </div>
  );
}

export default Layout;