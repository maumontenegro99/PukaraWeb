import React, { useState, useEffect, useRef } from 'react';
// 1. IMPORTAMOS useLocation y useNavigate
import { useLocation, useNavigate } from 'react-router-dom';

import logoAvanzada from '../assets/logo-avanzada.png';
import logoManada from '../assets/logo-manada.png';
import logoBandada from '../assets/logo-bandada.png';
import logoTropa from '../assets/logo-tropa.png';
import logoCompania from '../assets/logo-compania.png';
import logoClan from '../assets/logo-clan.png';

const ramaStyles = {
  MANADA: { color: '#fced21', img: logoManada, label: 'Manada' },
  BANDADA: { color: '#1b2a7c', img: logoBandada, label: 'Bandada' },
  TROPA: { color: '#009245', img: logoTropa, label: 'Tropa' },
  COMPANIA: { color: '#66ccbe', img: logoCompania, label: 'Compañía' },
  AVANZADA: { color: '#5d448b', img: logoAvanzada, label: 'Avanzada' },
  CLAN: { color: '#ED1C24', img: logoClan, label: 'Clan' }
};

const ordenRamas = ['MANADA', 'BANDADA', 'TROPA', 'COMPANIA', 'AVANZADA', 'CLAN'];

function Ramas() {
  // 2. Inicializamos el hook de navegación
  const navigate = useNavigate();
  const location = useLocation();

  const [ramas, setRamas] = useState([]);
  const [selectedRama, setSelectedRama] = useState(null);
  // 3. NUEVO ESTADO: Para guardar todos los miembros y poder contarlos
  const [allMiembros, setAllMiembros] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  const badgesRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    // 4. MODIFICAMOS LA CARGA: Usamos Promise.all para cargar Ramas Y Miembros
    Promise.all([
        fetch('http://localhost:8080/api/ramas'),
        fetch('http://localhost:8080/api/miembros') // <--- Nuevo endpoint
    ])
      .then(async ([resRamas, resMiembros]) => {
        const ramasData = await resRamas.json();
        const miembrosData = await resMiembros.json();

        // Ordenamos ramas
        const ramasOrdenadas = ramasData.sort((a, b) => {
             return ordenRamas.indexOf(a.tipo) - ordenRamas.indexOf(b.tipo);
        });
        setRamas(ramasOrdenadas);
        // Guardamos todos los miembros
        setAllMiembros(miembrosData);

        // Lógica de redirección (si venimos desde la tabla de miembros al hacer clic en el chip)
        if (location.state?.selectedRamaId) {
            const ramaToSelect = ramasOrdenadas.find(r => r.id === location.state.selectedRamaId);
            if (ramaToSelect) {
                handleSelectRama(ramaToSelect);
                window.history.replaceState({}, document.title);
            }
        }
      })
      .catch(error => console.error("Error cargando datos:", error));
  }, []); 

  // 5. NUEVA FUNCIÓN: Cuenta los miembros de una rama específica
  const contarMiembrosPorRama = (ramaId) => {
      if (!ramaId || allMiembros.length === 0) return 0;
      // Filtramos la lista total buscando los que coincidan con el ID de la rama
      return allMiembros.filter(m => m.rama && m.rama.id === ramaId).length;
  };

  // 6. NUEVA FUNCIÓN: Navega a la vista de miembros con filtro
  const irAVerIntegrantes = () => {
      if (!selectedRama) return;
      // Navegamos a /miembros y pasamos el nombre de la rama en el "estado"
      navigate('/miembros', { state: { ramaFilterName: selectedRama.nombre } });
  };


  // --- (El resto de las funciones handleSelectRama, handleCloseCard, useEffect de click outside SIGUEN IGUAL) ---
  const handleSelectRama = (rama) => {
    if (selectedRama?.id === rama.id) { handleCloseCard(); return; }
    if (selectedRama) {
        setIsVisible(false);
        setTimeout(() => { setSelectedRama(rama); setTimeout(() => setIsVisible(true), 50); }, 300); 
    } else { setSelectedRama(rama); setTimeout(() => setIsVisible(true), 10); }
  };

  const handleCloseCard = () => { setIsVisible(false); setTimeout(() => { setSelectedRama(null); }, 300); };

  useEffect(() => {
    function handleClickOutside(event) {
      if (!selectedRama) return;
      const clickedOnBadges = badgesRef.current && badgesRef.current.contains(event.target);
      const clickedOnCard = cardRef.current && cardRef.current.contains(event.target);
      if (!clickedOnBadges && !clickedOnCard) handleCloseCard();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [selectedRama]);

  // --- ESTILOS (IGUALES) ---
  const containerStyle = { padding: '20px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto', color: '#222' };
  const heroBannerStyle = { backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '40px', textAlign: 'center', backdropFilter: 'blur(5px)', maxWidth: '800px', margin: '0 auto 40px auto' };
  const titleStyle = { margin: '0', fontSize: '2.5rem', fontWeight: '300', textTransform: 'uppercase', letterSpacing: '3px', fontFamily: "'Montserrat', sans-serif", color: '#222' };
  const subtitleStyle = { marginTop: '10px', fontSize: '1.1rem', color: '#444', fontWeight: '400' };
  const badgesContainerStyle = { display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', marginBottom: '40px', padding: '10px', maxWidth: '350px', margin: '0 auto' };
  const getBadgeStyle = (tipo, isSelected) => ({ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: ramaStyles[tipo]?.color || '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', cursor: 'pointer', border: isSelected ? '4px solid #fff' : '4px solid transparent', boxShadow: isSelected ? `0 0 15px ${ramaStyles[tipo]?.color}, 0 4px 10px rgba(0,0,0,0.3)` : '0 4px 6px rgba(0,0,0,0.2)', transform: isSelected ? 'scale(1.15) translateY(-5px)' : 'scale(1)', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' });
  const profileCardStyle = { backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '20px', maxWidth: '700px', margin: '0 auto', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', textAlign: 'left', position: 'relative', transition: 'all 0.3s ease-in-out', opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)' };
  const imageStyle = { width: '70%', height: '70%', objectFit: 'contain', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' };

  return (
    <div style={containerStyle}>
      <div style={heroBannerStyle}>
        <h1 style={titleStyle}>NUESTRAS UNIDADES</h1>
        <p style={subtitleStyle}>Selecciona una insignia para ver los detalles de la unidad.</p>
      </div>

      <div style={badgesContainerStyle} ref={badgesRef}>
        {ramas.map((rama) => {
            const styleData = ramaStyles[rama.tipo];
            const isSelected = selectedRama?.id === rama.id;
            return (
              <div key={rama.id} style={getBadgeStyle(rama.tipo, isSelected)} onClick={() => handleSelectRama(rama)} title={rama.nombre}>
                {styleData?.img ? (<img src={styleData.img} alt={rama.nombre} style={imageStyle} />) : (<span>{styleData?.icon || '⚜️'}</span>)}
              </div>
            );
        })}
      </div>

      {selectedRama && (
        <div style={profileCardStyle} ref={cardRef}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${ramaStyles[selectedRama.tipo]?.color}`, paddingBottom: '15px', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, color: '#333', fontSize: '2rem' }}>{selectedRama.nombre}</h1>
                <span style={{ backgroundColor: ramaStyles[selectedRama.tipo]?.color, color: '#fff', padding: '5px 15px', borderRadius: '50px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                    {selectedRama.edadMinima} - {selectedRama.edadMaxima} Años
                </span>
            </div>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#555', fontStyle: 'italic' }}>"{selectedRama.descripcion}"</p>
            <div style={{ marginTop: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '150px', background: '#f8f9fa', padding: '15px', borderRadius: '10px' }}>
                   <strong style={{display:'block', color: '#888', fontSize:'0.8rem'}}>TIPO DE UNIDAD</strong>
                   <span style={{fontSize:'1.1rem', fontWeight:'600'}}>{ramaStyles[selectedRama.tipo]?.label}</span>
                </div>
                <div style={{ flex: 1, minWidth: '150px', background: '#f8f9fa', padding: '15px', borderRadius: '10px' }}>
                   <strong style={{display:'block', color: '#888', fontSize:'0.8rem'}}>INTEGRANTES</strong>
                   {/* 7. USAMOS LA NUEVA FUNCIÓN PARA MOSTRAR EL CONTEO */}
                   <span style={{fontSize:'1.1rem', fontWeight:'600'}}>
                       {contarMiembrosPorRama(selectedRama.id)} Integrantes
                   </span>
                </div>
            </div>
            <div style={{ marginTop: '30px', textAlign: 'right' }}>
                {/* 8. ACTUALIZAMOS EL BOTÓN PARA USAR LA NAVEGACIÓN */}
                <button style={{ backgroundColor: '#00B4D8', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,180,216, 0.4)', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} 
                onClick={irAVerIntegrantes} // <--- Usamos la nueva función aquí
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