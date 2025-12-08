// 1. AGREGAMOS useRef a las importaciones
import React, { useState, useEffect, useRef } from 'react';

// IMPORTAMOS LAS IMAGENES (Igual que antes)
import logoAvanzada from '../assets/logo-avanzada.png';
import logoManada from '../assets/logo-manada.png';
import logoBandada from '../assets/logo-bandada.png';
import logoTropa from '../assets/logo-tropa.png';
import logoCompania from '../assets/logo-compania.png';
import logoClan from '../assets/logo-clan.png';

// Colores de las ramas (Igual que antes)
const ramaStyles = {
  MANADA: { color: '#dbcf1fff', img: logoManada, label: 'Manada' },
  BANDADA: { color: '#1b2a7cff', img: logoBandada, label: 'Bandada' },
  TROPA: { color: '#009245', img: logoTropa, label: 'Tropa' },
  COMPANIA: { color: '#66ccbeff', img: logoCompania, label: 'Compañía' },
  AVANZADA: { color: '#5d448bff', img: logoAvanzada, label: 'Avanzada' },
  CLAN: { color: '#ED1C24', img: logoClan, label: 'Clan' }
};

const ordenRamas = ['MANADA', 'BANDADA', 'TROPA', 'COMPANIA', 'AVANZADA', 'CLAN'];

function Ramas() {
  const [ramas, setRamas] = useState([]);
  const [selectedRama, setSelectedRama] = useState(null);

  // 2. CREAMOS LAS REFERENCIAS ("Ganchos")
  const badgesRef = useRef(null); // Para el contenedor de círculos
  const cardRef = useRef(null);   // Para la tarjeta de detalles

  // Carga de datos inicial
  useEffect(() => {
    fetch('http://localhost:8080/api/ramas')
      .then(res => res.json())
      .then(data => {
        const ramasOrdenadas = data.sort((a, b) => {
             return ordenRamas.indexOf(a.tipo) - ordenRamas.indexOf(b.tipo);
        });
        setRamas(ramasOrdenadas);
      })
      .catch(error => console.error("Error cargando ramas:", error));
  }, []);

  // 3. NUEVO useEffect: EL "ESPÍA" DE CLICS
  useEffect(() => {
    // Esta función se ejecutará cada vez que hagas clic en cualquier lado
    function handleClickOutside(event) {
      // Si no hay nada seleccionado, no hacemos nada
      if (!selectedRama) return;

      // Verificamos dónde cayó el clic:
      // ¿Cayó dentro del contenedor de insignias?
      const clickedOnBadges = badgesRef.current && badgesRef.current.contains(event.target);
      // ¿Cayó dentro de la tarjeta de detalles?
      const clickedOnCard = cardRef.current && cardRef.current.contains(event.target);

      // Si el clic NO fue en las insignias Y TAMPOCO en la tarjeta...
      if (!clickedOnBadges && !clickedOnCard) {
        // ...entonces fue "afuera", así que deseleccionamos.
        setSelectedRama(null);
      }
    }

    // Agregamos el espía al documento
    document.addEventListener("mousedown", handleClickOutside);

    // Limpieza: quitamos el espía cuando el componente se desmonta o cambia
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedRama]); // Se ejecuta cada vez que cambia el estado de selección

  // --- ESTILOS (Igual que antes) ---
  const containerStyle = { padding: '20px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto', color: '#222' };
  const heroBannerStyle = { backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '40px', textAlign: 'center', backdropFilter: 'blur(5px)', maxWidth: '800px', margin: '0 auto 40px auto' };
  const titleStyle = { margin: '0', fontSize: '2.5rem', fontWeight: '300', textTransform: 'uppercase', letterSpacing: '3px', fontFamily: "'Montserrat', sans-serif", color: '#222' };
  const subtitleStyle = { marginTop: '10px', fontSize: '1.1rem', color: '#444', fontWeight: '400' };
  const badgesContainerStyle = { display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', marginBottom: '40px', padding: '10px', maxWidth: '350px', margin: '0 auto' };

  const getBadgeStyle = (tipo, isSelected) => ({
    width: '120px', height: '120px', borderRadius: '50%', backgroundColor: ramaStyles[tipo]?.color || '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', cursor: 'pointer',
    // Cambio sutil: si está seleccionado, el borde es blanco, si no, transparente
    border: isSelected ? '4px solid #fff' : '4px solid transparent',
    boxShadow: isSelected ? `0 0 15px ${ramaStyles[tipo]?.color}, 0 4px 10px rgba(0,0,0,0.3)` : '0 4px 6px rgba(0,0,0,0.2)',
    transform: isSelected ? 'scale(1.15) translateY(-5px)' : 'scale(1)',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  });

  const profileCardStyle = { backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '20px', maxWidth: '700px', margin: '0 auto', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', textAlign: 'left', position: 'relative', animation: 'fadeIn 0.5s ease-out' };
  const imageStyle = { width: '70%', height: '70%', objectFit: 'contain', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' };

  return (
    <div style={containerStyle}>
      
      <div style={heroBannerStyle}>
        <h1 style={titleStyle}>NUESTRAS UNIDADES</h1>
        <p style={subtitleStyle}>Selecciona una insignia para ver los detalles de la unidad.</p>
      </div>

      {/* 4. ASIGNAMOS LA REFERENCIA AL CONTENEDOR DE INSIGNIAS */}
      <div style={badgesContainerStyle} ref={badgesRef}>
        {ramas.map((rama) => {
            const styleData = ramaStyles[rama.tipo];
            const isSelected = selectedRama?.id === rama.id;

            return (
              <div 
                key={rama.id} 
                style={getBadgeStyle(rama.tipo, isSelected)}
                onClick={() => setSelectedRama(rama)}
                title={rama.nombre}
              >
                {styleData?.img ? (
                    <img src={styleData.img} alt={rama.nombre} style={imageStyle} />
                ) : (
                    <span>{styleData?.icon || '⚜️'}</span>
                )}
              </div>
            );
        })}
      </div>

      {selectedRama && (
        // 5. ASIGNAMOS LA REFERENCIA A LA TARJETA DE DETALLES
        <div style={profileCardStyle} ref={cardRef}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${ramaStyles[selectedRama.tipo]?.color}`, paddingBottom: '15px', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, color: '#333', fontSize: '2rem' }}>{selectedRama.nombre}</h1>
                <span style={{ 
                    backgroundColor: ramaStyles[selectedRama.tipo]?.color, 
                    color: '#fff', padding: '5px 15px', borderRadius: '50px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}>
                    {selectedRama.edadMinima} - {selectedRama.edadMaxima} Años
                </span>
            </div>
            
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#555', fontStyle: 'italic' }}>
                "{selectedRama.descripcion}"
            </p>

            <div style={{ marginTop: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '150px', background: '#f8f9fa', padding: '15px', borderRadius: '10px' }}>
                   <strong style={{display:'block', color: '#888', fontSize:'0.8rem'}}>TIPO DE UNIDAD</strong>
                   <span style={{fontSize:'1.1rem', fontWeight:'600'}}>{ramaStyles[selectedRama.tipo]?.label}</span>
                </div>
                <div style={{ flex: 1, minWidth: '150px', background: '#f8f9fa', padding: '15px', borderRadius: '10px' }}>
                   <strong style={{display:'block', color: '#888', fontSize:'0.8rem'}}>INTEGRANTES</strong>
                   <span style={{fontSize:'1.1rem', fontWeight:'600'}}>
                       {selectedRama.miembros ? selectedRama.miembros.length : 0} Scouts
                   </span>
                </div>
            </div>

            <div style={{ marginTop: '30px', textAlign: 'right' }}>
                <button style={{
                    backgroundColor: '#00B4D8', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,180,216, 0.4)', transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onClick={() => alert(`Ir a ver miembros de: ${selectedRama.nombre}`)}
                >
                    Ver Integrantes →
                </button>
            </div>
        </div>
      )}
    </div>
  );
}

export default Ramas;