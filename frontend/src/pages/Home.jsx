import React from 'react';
import insignia from '../assets/insignia.png';

const colors = {
  primaryCyan: '#00B4D8',
  darkText: '#222222',
  white: '#ffffff',
  lightBg: '#f8f9fa'
};

function Home() {
  
  // --- ESTILOS ESPECÍFICOS DEL HOME ---
  const mainContainerStyle = {
    width: '100%',
    maxWidth: '1000px',
    margin: '0 auto',
    fontFamily: "'Montserrat', 'Segoe UI', sans-serif",
    color: colors.darkText,
    textAlign: 'left',
    // Ya no necesitamos paddingTop aquí porque el Layout lo maneja, 
    // pero podemos dejar un margen extra si queremos separarlo más.
  };

  const heroBannerStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    color: colors.darkText,
    padding: '40px 30px',
    borderRadius: '20px',
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

  const contentStyle = {
    backgroundColor: 'rgba(255,255,255, 0.9)',
    padding: '40px',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  };

  // --- RENDER (Solo contenido) ---
  return (
    <div style={mainContainerStyle}>
      
      <header style={heroBannerStyle}>
        <h1 style={titleStyle}>BIENVENIDOS</h1>
        <p style={subtitleStyle}>Plataforma de Gestión y Logística</p>
        <div style={{marginTop: '20px'}}>
           <img src={insignia} alt="Insignia" style={{ width: '120px', borderRadius: '0px' }} />
        </div>
      </header>

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
  );
}

export default Home;