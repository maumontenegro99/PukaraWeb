import React, { useState, useEffect } from 'react';
import miFondoLocal from '../assets/fondo-scout.jpg';
import insignia from '../assets/insignia.png';

const colors = {
  primaryCyan: '#00B4D8',
  darkText: '#222222',
  white: '#ffffff',
  lightBg: '#f8f9fa',
  hoverCyan: '#0096B4' // Un tono un poco más oscuro para el hover
};

function Home() {
  // --- ESTADOS PARA EL MENÚ Y RESPONSIVIDAD ---
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detectar cambio de tamaño de pantalla para activar/desactivar modo móvil
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMenuOpen(false); // Cierra el menú móvil si agrandamos la pantalla
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- CONFIGURACIÓN DE FONDO (Igual que antes) ---
  const backgroundImageUrl = miFondoLocal;

  const pageBackgroundStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    backgroundImage: `url(${backgroundImageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(4px) brightness(0.9)',
    transform: 'scale(1.1)'
  };

  const mainContainerStyle = {
    width: '100%',
    maxWidth: '1000px',
    margin: '0 auto',
    fontFamily: "'Montserrat', 'Segoe UI', sans-serif",
    color: colors.darkText,
    textAlign: 'left',
    position: 'relative',
    paddingTop: '80px' // ESPACIO EXTRA para que la navbar fija no tape el contenido
  };

  // --- ESTILOS DE LA NAVBAR ---
  const navbarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: colors.primaryCyan,
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    boxSizing: 'border-box' // Importante para que el padding no rompa el ancho
  };

  const logoTextStyle = {
    color: colors.darkText,
    fontSize: '1.2rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    cursor: 'pointer'
  };

  // Estilo del contenedor de enlaces (Dinámico según si es móvil o escritorio)
  const navLinksContainerStyle = isMobile ? {
    position: 'absolute',
    top: '60px',
    left: 0,
    width: '100%',
    backgroundColor: colors.primaryCyan,
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 0',
    display: menuOpen ? 'flex' : 'none', // Ocultar o mostrar según estado
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  } : {
    display: 'flex',
    flexDirection: 'row',
    gap: '30px'
  };

  const linkStyle = {
    color: colors.darkText,
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    padding: isMobile ? '15px 0' : '0', // Más espacio clickeable en móvil
    width: isMobile ? '100%' : 'auto',
    textAlign: isMobile ? 'center' : 'left',
    transition: 'color 0.2s'
  };

  // Botón Sándwich (Solo visible en móvil)
  const hamburgerButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.8rem',
    color: colors.darkText,
    display: isMobile ? 'block' : 'none'
  };

  // --- ESTILOS DEL HERO (Igual que antes) ---
  const heroBannerStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Hice el fondo blanco translúcido para contrastar con la navbar cyan
    color: colors.darkText,
    padding: '40px 30px',
    borderRadius: '20px', // Ahora redondeado completo, ya no pega con el techo
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    marginBottom: '40px',
    textAlign: 'center',
    backdropFilter: 'blur(5px)'
  };

  const titleStyle = {
    margin: '0',
    fontSize: '3rem',
    fontWeight: '300',
    textTransform: 'uppercase',
    letterSpacing: '4px',
    fontFamily: "'Montserrat', sans-serif"
  };

  const subtitleStyle = {
    margin: '10px 0 0 0',
    fontSize: '1.2rem',
    fontWeight: '400',
    color: colors.darkText
  };

  // --- CONTENIDO CENTRAL ---
  const contentStyle = {
    backgroundColor: 'rgba(255,255,255, 0.9)',
    padding: '40px',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  };

  // --- RENDER ---
  return (
    <>
      <div style={pageBackgroundStyle}></div>

      {/* --- NAVBAR SUPERIOR --- */}
      <nav style={navbarStyle}>
        {/* Logo / Nombre a la izquierda */}
        <div style={logoTextStyle} onClick={() => alert("Ir al inicio")}>
          PUKARA WECHE
        </div>

        {/* Botón Sándwich (Solo Móvil) */}
        <button 
          style={hamburgerButtonStyle} 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        {/* Enlaces de Navegación */}
        <div style={navLinksContainerStyle}>
          <a style={linkStyle} onClick={() => setMenuOpen(false)}>Ramas</a>
          <a style={linkStyle} onClick={() => setMenuOpen(false)}>Miembros</a>
          <a style={linkStyle} onClick={() => setMenuOpen(false)}>Inventario</a>
          <a style={linkStyle} onClick={() => setMenuOpen(false)}>Eventos</a>
        </div>
      </nav>

      {/* --- CONTENEDOR PRINCIPAL --- */}
      <div style={mainContainerStyle}>
        
        <header style={heroBannerStyle}>
          <h1 style={titleStyle}>BIENVENIDOS</h1>
          <p style={subtitleStyle}>Plataforma de Gestión y Logística</p>
          <div style={{marginTop: '20px'}}>
             <img src={insignia} alt="Insignia" style={{ width: '120px', borderRadius: '0px' }} />
          </div>
        </header>

        {/* CONTENIDO DE BIENVENIDA (Reemplaza al grid de tarjetas) */}
        <div style={contentStyle}>
            <h2 style={{color: colors.primaryCyan, marginTop: 0}}>¡Siempre Listos!</h2>
            <p style={{lineHeight: '1.6'}}>
                Selecciona una opción del menú superior para comenzar a gestionar tu unidad.
                Aquí podrás visualizar las novedades más recientes del grupo.
            </p>
            <p style={{fontSize: '0.9rem', color: '#666'}}>
                (Aquí irían noticias o avisos importantes en el futuro)
            </p>
        </div>

        <p style={{textAlign: 'center', marginTop: '50px', opacity: 0.8, fontSize: '0.9rem', fontWeight: '500', color: colors.white, textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}>
            Siempre Listos - Grupo Scout Pukara Weche 2025
        </p>
      </div>
    </>
  );
}

export default Home;