import React, { useState, useEffect, useRef } from 'react';
import { authFetch } from '../helpers/authFetch';
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
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [ramas, setRamas] = useState([]);
  const [selectedRama, setSelectedRama] = useState(null);
  const [allMiembros, setAllMiembros] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  // Estados Modal Dirigente
  const [selectedDirigente, setSelectedDirigente] = useState(null);
  const [showDirigenteModal, setShowDirigenteModal] = useState(false);
  const [dirigenteModalVisible, setDirigenteModalVisible] = useState(false);

  const badgesRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    Promise.all([
        authFetch('http://localhost:8080/api/ramas'),
        authFetch('http://localhost:8080/api/miembros')
    ])
      .then(async ([resRamas, resMiembros]) => {
        const ramasData = await resRamas.json();
        const miembrosData = await resMiembros.json();

        const ramasOrdenadas = ramasData.sort((a, b) => {
             return ordenRamas.indexOf(a.tipo) - ordenRamas.indexOf(b.tipo);
        });
        setRamas(ramasOrdenadas);
        setAllMiembros(miembrosData);

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

  const contarMiembrosPorRama = (ramaId) => {
      if (!ramaId || allMiembros.length === 0) return 0;
      return allMiembros.filter(m => m.rama && m.rama.id === ramaId).length;
  };

  const irAVerIntegrantes = () => {
      if (!selectedRama) return;
      navigate('/miembros', { state: { ramaFilterName: selectedRama.nombre } });
  };

  const handleSelectRama = (rama) => {
    if (selectedRama?.id === rama.id) { handleCloseCard(); return; }
    if (selectedRama) {
        setIsVisible(false);
        setTimeout(() => { setSelectedRama(rama); setTimeout(() => setIsVisible(true), 50); }, 300); 
    } else { setSelectedRama(rama); setTimeout(() => setIsVisible(true), 10); }
  };

  const handleCloseCard = () => { setIsVisible(false); setTimeout(() => { setSelectedRama(null); }, 300); };

  const handleViewDirigente = (dirigente, e) => {
      e.stopPropagation(); 
      setSelectedDirigente(dirigente);
      setShowDirigenteModal(true);
      setTimeout(() => setDirigenteModalVisible(true), 10);
  };

  const handleCloseDirigenteModal = () => {
      setDirigenteModalVisible(false);
      setTimeout(() => setShowDirigenteModal(false), 300);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (!selectedRama) return;
      const clickedOnBadges = badgesRef.current && badgesRef.current.contains(event.target);
      const clickedOnCard = cardRef.current && cardRef.current.contains(event.target);
      if (showDirigenteModal) return; 
      if (!clickedOnBadges && !clickedOnCard) handleCloseCard();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [selectedRama, showDirigenteModal]);

  // --- ESTILOS RESPONSIVOS ---
  const containerStyle = { padding: isMobile ? '10px' : '20px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto', color: '#222' };
  const heroBannerStyle = { backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: isMobile ? '20px' : '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '40px', textAlign: 'center', backdropFilter: 'blur(5px)', maxWidth: '800px', margin: '0 auto 40px auto' };
  const titleStyle = { margin: '0', fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: '300', textTransform: 'uppercase', letterSpacing: isMobile ? '1px' : '3px', fontFamily: "'Montserrat', sans-serif", color: '#222' };
  const subtitleStyle = { marginTop: '10px', fontSize: isMobile ? '0.9rem' : '1.1rem', color: '#444', fontWeight: '400' };

  const badgesContainerStyle = { 
      display: 'flex', justifyContent: 'center', gap: isMobile ? '15px' : '25px', flexWrap: 'wrap', 
      marginBottom: '40px', padding: '10px', maxWidth: '100%', margin: '0 auto' 
  };

  const getBadgeStyle = (tipo, isSelected) => ({ 
    width: isMobile ? '70px' : '110px', height: isMobile ? '70px' : '110px', borderRadius: '50%', backgroundColor: ramaStyles[tipo]?.color || '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '1.5rem' : '2.5rem', cursor: 'pointer', border: isSelected ? '4px solid #fff' : '4px solid transparent', boxShadow: isSelected ? `0 0 15px ${ramaStyles[tipo]?.color}, 0 4px 10px rgba(0,0,0,0.3)` : '0 4px 6px rgba(0,0,0,0.2)', transform: isSelected ? 'scale(1.15) translateY(-5px)' : 'scale(1)', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
  });

  const profileCardStyle = { backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: isMobile ? '20px' : '40px', borderRadius: '20px', maxWidth: '700px', margin: '0 auto', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', textAlign: 'left', position: 'relative', transition: 'all 0.3s ease-in-out', opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)' };
  const imageStyle = { width: '70%', height: '70%', objectFit: 'contain', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' };

  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(3px)', opacity: dirigenteModalVisible ? 1 : 0, transition: 'opacity 0.3s' };
  const dirigenteCardStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: '350px', boxShadow: '0 15px 35px rgba(0,0,0,0.3)', textAlign: 'center', transform: dirigenteModalVisible ? 'translateY(0) scale(1)' : 'translateY(20px)', opacity: dirigenteModalVisible ? 1 : 0, transition: 'all 0.3s' };

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
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${ramaStyles[selectedRama.tipo]?.color}`, paddingBottom: '15px', marginBottom: '20px', gap: isMobile ? '10px' : '0' }}>
                <h1 style={{ margin: 0, color: '#333', fontSize: isMobile ? '1.5rem' : '2rem', textAlign: isMobile ? 'center' : 'left' }}>{selectedRama.nombre}</h1>
                <span style={{ backgroundColor: ramaStyles[selectedRama.tipo]?.color, color: '#fff', padding: '5px 15px', borderRadius: '50px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                    {selectedRama.edadMinima} - {selectedRama.edadMaxima} Años
                </span>
            </div>
            
            <p style={{ fontSize: isMobile ? '1rem' : '1.1rem', lineHeight: '1.6', color: '#555', fontStyle: 'italic', textAlign: isMobile ? 'center' : 'left' }}>"{selectedRama.descripcion}"</p>
            
            <div style={{ marginTop: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
                {/* BLOQUE EQUIPO */}
                <div style={{ flex: 1, minWidth: '150px', background: '#f8f9fa', padding: '15px', borderRadius: '10px' }}>
                   <strong style={{display:'block', color: '#888', fontSize:'0.8rem', marginBottom:'10px', textAlign: isMobile ? 'center' : 'left'}}>EQUIPO DE UNIDAD</strong>
                   
                   {selectedRama.equipo && selectedRama.equipo.length > 0 ? (
                       // CAMBIO: Flex Column para que salgan uno debajo del otro
                       <div style={{display:'flex', flexDirection: 'column', gap:'8px', alignItems: isMobile ? 'center' : 'flex-start'}}>
                           {selectedRama.equipo.map(dir => (
                               <span 
                                key={dir.id}
                                onClick={(e) => handleViewDirigente(dir, e)}
                                style={{
                                    fontSize:'0.9rem', color: '#00B4D8', fontWeight:'600', cursor:'pointer', 
                                    textDecoration:'underline', display:'inline-block',
                                    padding: '5px 8px', borderRadius: '5px', transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#e0f7fa'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                               >
                                   {dir.nombres.split(" ")[0]} {dir.apellidos.split(" ")[0]}
                               </span>
                           ))}
                       </div>
                   ) : (
                       <span style={{fontSize:'0.9rem', color:'#aaa', fontStyle:'italic', display:'block', textAlign: isMobile ? 'center' : 'left'}}>Sin Equipo Asignado</span>
                   )}
                </div>

                <div style={{ flex: 1, minWidth: '150px', background: '#f8f9fa', padding: '15px', borderRadius: '10px', textAlign: isMobile ? 'center' : 'right' }}>
                   <strong style={{display:'block', color: '#888', fontSize:'0.8rem'}}>INTEGRANTES</strong>
                   <span style={{fontSize:'1.1rem', fontWeight:'600'}}>
                       {contarMiembrosPorRama(selectedRama.id)} Beneficiarios
                   </span>
                </div>
            </div>

            <div style={{ marginTop: '30px', textAlign: isMobile ? 'center' : 'right' }}>
                <button style={{ backgroundColor: '#00B4D8', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,180,216, 0.4)', transition: 'transform 0.2s', width: isMobile ? '100%' : 'auto' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} 
                onClick={irAVerIntegrantes} 
                >
                    Ver Planilla Completa →
                </button>
            </div>
        </div>
      )}

      {showDirigenteModal && selectedDirigente && (
          <div style={modalOverlayStyle} onClick={(e) => { if(e.target === e.currentTarget) handleCloseDirigenteModal() }}>
              <div style={dirigenteCardStyle}>
                  <div style={{width:'80px', height:'80px', borderRadius:'50%', background: ramaStyles[selectedRama.tipo]?.color || '#ccc', margin:'0 auto 15px auto', display:'flex', justifyContent:'center', alignItems:'center', fontSize:'2.5rem', color:'white', fontWeight:'bold', boxShadow:'0 4px 10px rgba(0,0,0,0.1)'}}>
                      {selectedDirigente.nombres.charAt(0)}
                  </div>
                  <h2 style={{margin:'0 0 5px 0', color:'#333'}}>{selectedDirigente.nombres} {selectedDirigente.apellidos}</h2>
                  <span style={{background:'#f0f8ff', color:'#00B4D8', padding:'4px 12px', borderRadius:'15px', fontSize:'0.8rem', fontWeight:'bold'}}>
                      {selectedDirigente.cargo || 'Dirigente'}
                  </span>

                  <div style={{marginTop:'25px', display:'flex', flexDirection:'column', gap:'15px', textAlign:'left'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                          <span style={{fontSize:'1.2rem'}}>📧</span>
                          <div>
                              <div style={{fontSize:'0.7rem', color:'#888'}}>Correo Electrónico</div>
                              <div style={{fontWeight:'500', fontSize:'0.95rem'}}>{selectedDirigente.email || 'No registrado'}</div>
                          </div>
                      </div>
                      <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                          <span style={{fontSize:'1.2rem'}}>📞</span>
                          <div>
                              <div style={{fontSize:'0.7rem', color:'#888'}}>Teléfono</div>
                              <div style={{fontWeight:'500', fontSize:'0.95rem'}}>{selectedDirigente.telefono || 'No registrado'}</div>
                          </div>
                      </div>
                  </div>

                  <button 
                    onClick={handleCloseDirigenteModal}
                    style={{
                        marginTop: '30px', width: '100%', padding: '12px', 
                        backgroundColor: '#222', color: 'white', border: 'none', 
                        borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                    }}
                  >
                      Cerrar
                  </button>
              </div>
          </div>
      )}
    </div>
  );
}

export default Ramas;