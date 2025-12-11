import React, { useState, useEffect } from 'react';
import { authFetch } from '../helpers/authFetch';

const typeColors = {
  CAMPAMENTO: '#009245', 
  REUNION: '#00B4D8',    
  CEREMONIA: '#5d448b',  
  SERVICIO: '#ED1C24',   
  PASEO: '#fced21',      
  DISTRITAL: '#1b2a7c',  
  OTRO: '#888'           
};

// Colores para los chips de selección de ramas
const ramaChipColors = {
  MANADA: '#fced21',
  BANDADA: '#1b2a7c',
  TROPA: '#009245',
  COMPANIA: '#66ccbe',
  AVANZADA: '#5d448b',
  CLAN: '#ED1C24'
};

const ordenRamas = ['MANADA', 'BANDADA', 'TROPA', 'COMPANIA', 'AVANZADA', 'CLAN'];

function Eventos() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [eventos, setEventos] = useState([]);
  const [ramas, setRamas] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [showNewUbicacionForm, setShowNewUbicacionForm] = useState(false);
  const [newUbicacion, setNewUbicacion] = useState({ nombre: '', direccion: '' });

  const [formData, setFormData] = useState({
    id: null, titulo: '', tipo: 'REUNION',
    fechaInicio: '', fechaFin: '',
    ramaIds: [], 
    ubicacionId: '',
    descripcion: '', costo: 0
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resEv, resRa, resUb] = await Promise.all([
        authFetch('http://localhost:8080/api/eventos'),
        authFetch('http://localhost:8080/api/ramas'),
        authFetch('http://localhost:8080/api/ubicaciones-eventos')
      ]);
      
      if (resEv.ok) setEventos(await resEv.json());
      if (resRa.ok) {
          const ramasData = await resRa.json();
          setRamas(ramasData.sort((a, b) => ordenRamas.indexOf(a.tipo) - ordenRamas.indexOf(b.tipo)));
      }
      if (resUb.ok) setUbicaciones(await resUb.json());
    } catch (error) { console.error("Error cargando eventos:", error); }
  };

  // --- HANDLERS ---
  const handleOpenModal = (evento = null) => {
    setShowNewUbicacionForm(false);
    setNewUbicacion({ nombre: '', direccion: '' });

    if (evento) {
      setIsEditing(true);
      setFormData({
        id: evento.id, titulo: evento.titulo, tipo: evento.tipo,
        fechaInicio: evento.fechaInicio ? evento.fechaInicio.slice(0, 16) : '', 
        fechaFin: evento.fechaFin ? evento.fechaFin.slice(0, 16) : '',
        ramaIds: evento.ramas ? evento.ramas.map(r => r.id) : [],
        ubicacionId: evento.ubicacion ? evento.ubicacion.id : '',
        descripcion: evento.descripcion || '',
        costo: evento.costo || 0
      });
    } else {
      setIsEditing(false);
      setFormData({ id: null, titulo: '', tipo: 'REUNION', fechaInicio: '', fechaFin: '', ramaIds: [], ubicacionId: '', descripcion: '', costo: 0 });
    }
    setShowModal(true);
    setTimeout(() => setModalVisible(true), 10);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => setShowModal(false), 300);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'ubicacionId') {
        if (value === 'CREAR_NUEVO') { setShowNewUbicacionForm(true); setFormData({ ...formData, ubicacionId: '' }); } 
        else { setShowNewUbicacionForm(false); setFormData({ ...formData, ubicacionId: value }); }
    } else { setFormData({ ...formData, [name]: value }); }
  };

  const toggleRamaSelection = (id) => {
      const currentIds = formData.ramaIds;
      if (currentIds.includes(id)) {
          setFormData({ ...formData, ramaIds: currentIds.filter(rid => rid !== id) });
      } else {
          setFormData({ ...formData, ramaIds: [...currentIds, id] });
      }
  };

  const handleNewUbicacionChange = (e) => { setNewUbicacion({ ...newUbicacion, [e.target.name]: e.target.value }); };
  const cancelNewUbicacion = () => { setShowNewUbicacionForm(false); setFormData({ ...formData, ubicacionId: '' }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalUbicacionId = formData.ubicacionId;

    try {
        if (showNewUbicacionForm) {
            const resUbi = await authFetch('http://localhost:8080/api/ubicaciones-eventos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUbicacion) });
            if (!resUbi.ok) throw new Error("Error creando ubicación");
            const ubiCreada = await resUbi.json();
            finalUbicacionId = ubiCreada.id;
            setUbicaciones([...ubicaciones, ubiCreada]);
        }

        const payload = {
            titulo: formData.titulo, tipo: formData.tipo,
            fechaInicio: formData.fechaInicio, fechaFin: formData.fechaFin,
            descripcion: formData.descripcion, costo: formData.costo,
            ramas: formData.ramaIds.map(id => ({ id })), 
            ubicacion: finalUbicacionId ? { id: finalUbicacionId } : null
        };
        if (isEditing) payload.id = formData.id;

        await authFetch('http://localhost:8080/api/eventos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        handleCloseModal();
        setTimeout(() => { fetchData(); alert(isEditing ? "Evento actualizado" : "Evento creado"); }, 300);
    } catch (error) { console.error(error); alert("Error al guardar"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este evento?")) {
        try { await authFetch(`http://localhost:8080/api/eventos/${id}`, { method: 'DELETE' }); fetchData(); } catch (error) { console.error(error); }
    }
  };

  const formatearFecha = (fechaString) => {
      if (!fechaString) return '';
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' });
  };

  const eventosFiltrados = eventos.filter(e => 
    e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (e.ubicacion && e.ubicacion.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- ESTILOS RESPONSIVOS ---
  const containerStyle = { padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Montserrat', sans-serif" };
  const headerCardStyle = { backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '25px', border: '1px solid #eee', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: isMobile ? '15px' : '0' };
  const titleStyle = { color: '#00B4D8', margin: 0, textTransform: 'uppercase', fontSize: isMobile ? '1.5rem' : '1.8rem', textAlign: isMobile ? 'center' : 'left' };
  const searchInputStyle = { padding: '12px 15px', borderRadius: '8px', border: '1px solid #ddd', width: isMobile ? '100%' : '300px', marginRight: isMobile ? '0' : '15px', fontSize: '0.95rem', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' };
  const btnPrimaryStyle = { backgroundColor: '#00B4D8', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', boxShadow: '0 4px 10px rgba(0, 180, 216, 0.3)', width: isMobile ? '100%' : 'auto' };
  const gridStyle = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' };
  const cardStyle = { backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #eee', overflow: 'hidden', transition: 'transform 0.2s', position: 'relative' };
  
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(3px)', opacity: modalVisible ? 1 : 0, transition: 'opacity 0.3s ease-in-out' };
  const modalContentStyle = { backgroundColor: 'white', padding: '40px', borderRadius: '20px', width: isMobile ? '90%' : '550px', maxHeight: '90vh', overflowY: 'auto', transform: modalVisible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)', opacity: modalVisible ? 1 : 0, transition: 'all 0.3s ease-in-out' };
  const miniFormContainerStyle = { transition: 'all 0.3s ease-in-out', overflow: 'hidden', maxHeight: showNewUbicacionForm ? '500px' : '0px', opacity: showNewUbicacionForm ? 1 : 0, transform: showNewUbicacionForm ? 'translateY(0)' : 'translateY(-10px)' };
  const miniFormStyle = { backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '10px', border: '1px dashed #00B4D8', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' };

  return (
    <div style={containerStyle}>
      <div style={headerCardStyle}>
        <div><h1 style={titleStyle}>Registro de Eventos</h1><p style={{color: '#888', margin: '5px 0 0 0', fontSize: '1rem', textAlign: isMobile ? 'center' : 'left'}}>Calendario y actividades del grupo</p></div>
        <div style={{display:'flex', flexDirection: isMobile?'column':'row', alignItems:'center', gap: isMobile?'10px':'0', width: isMobile?'100%':'auto'}}>
            <input type="text" placeholder="🔍 Buscar evento..." style={searchInputStyle} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button style={btnPrimaryStyle} onClick={() => handleOpenModal()}>+ Nuevo Evento</button>
        </div>
      </div>

      <div style={gridStyle}>
          {eventosFiltrados.map(ev => (
              <div key={ev.id} style={cardStyle} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{height: '8px', backgroundColor: typeColors[ev.tipo] || typeColors.OTRO}}></div>
                  <div style={{padding: '20px'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px'}}>
                          <span style={{fontSize:'0.7rem', fontWeight:'bold', color: typeColors[ev.tipo] || '#888', border: `1px solid ${typeColors[ev.tipo]}`, padding:'2px 8px', borderRadius:'10px'}}>{ev.tipo}</span>
                          <div style={{fontSize:'0.7rem', color:'#666', textAlign:'right', maxWidth:'60%'}}>
                              {(!ev.ramas || ev.ramas.length === 0) ? (<span style={{fontWeight:'bold'}}>⚜️ Grupo Completo</span>) : (ev.ramas.map(r => r.nombre.split(" ")[0]).join(", "))}
                          </div>
                      </div>
                      <h3 style={{margin: '0 0 10px 0', color: '#333', fontSize:'1.2rem'}}>{ev.titulo}</h3>
                      <div style={{display:'flex', alignItems:'center', gap:'5px', color:'#666', fontSize:'0.9rem', marginBottom:'5px'}}><span>📅</span> {formatearFecha(ev.fechaInicio)}</div>
                      {ev.ubicacion && (<div style={{display:'flex', alignItems:'center', gap:'5px', color:'#666', fontSize:'0.9rem', marginBottom:'15px'}}><span>📍</span> {ev.ubicacion.nombre}</div>)}
                      <p style={{color: '#555', fontSize: '0.9rem', lineHeight: '1.4', marginBottom:'20px', height: '40px', overflow: 'hidden', textOverflow: 'ellipsis'}}>{ev.descripcion}</p>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '15px'}}>
                          <span style={{fontWeight:'bold', color: '#333'}}>${ev.costo ? ev.costo.toLocaleString() : '0'}</span>
                          <div>
                              <button onClick={() => handleOpenModal(ev)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem', marginRight:'10px'}}>✏️</button>
                              <button onClick={() => handleDelete(ev.id)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem', color:'#ED1C24'}}>🗑️</button>
                          </div>
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {showModal && (
        <div style={modalOverlayStyle} onClick={(e) => { if(e.target === e.currentTarget) handleCloseModal() }}>
            <div style={modalContentStyle}>
                <h2 style={{color: '#222', marginTop: 0, marginBottom: '25px', textAlign: 'center'}}>{isEditing ? 'Editar Evento' : 'Nuevo Evento'}</h2>
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                    <input name="titulo" value={formData.titulo} onChange={handleInputChange} placeholder="Título del Evento" style={{padding: '12px', borderRadius: '8px', border: '1px solid #ddd'}} required />
                    
                    <div style={{display: isMobile ? 'flex' : 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '15px'}}>
                        <select name="tipo" value={formData.tipo} onChange={handleInputChange} style={{padding: '12px', flex:1, borderRadius: '8px', border: '1px solid #ddd'}}>
                            {Object.keys(typeColors).map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{display:'block', fontSize:'0.9rem', color:'#666', marginBottom:'8px'}}>Participantes (Selecciona las unidades):</label>
                        {ramas.length === 0 ? (
                            <div style={{fontSize:'0.8rem', color:'#ED1C24', fontStyle:'italic', padding:'10px', background:'#fff0f0', borderRadius:'5px'}}>⚠️ No se encontraron unidades cargadas.</div>
                        ) : (
                            <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                                {ramas.map(rama => {
                                    const isSelected = formData.ramaIds.includes(rama.id);
                                    return (
                                        <div key={rama.id} onClick={() => toggleRamaSelection(rama.id)} style={{padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold', backgroundColor: isSelected ? ramaChipColors[rama.tipo] || '#00B4D8' : '#f0f0f0', color: isSelected ? (['BANDADA', 'AVANZADA', 'CLAN'].includes(rama.tipo) ? 'white' : '#222') : '#888', border: isSelected ? '1px solid transparent' : '1px solid #ddd', transition: 'all 0.2s', userSelect: 'none'}}>{rama.nombre}</div>
                                    );
                                })}
                            </div>
                        )}
                        <div style={{fontSize:'0.75rem', color:'#888', marginTop:'5px', fontStyle:'italic'}}>* Si no seleccionas ninguna, se considera "Grupo Completo".</div>
                    </div>

                    <div style={{display: isMobile ? 'flex' : 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '15px'}}>
                        <div style={{flex:1}}><label style={{fontSize:'0.8rem', color:'#666'}}>Inicio</label><input type="datetime-local" name="fechaInicio" value={formData.fechaInicio} onChange={handleInputChange} style={{width:'100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing:'border-box'}} required /></div>
                        <div style={{flex:1}}><label style={{fontSize:'0.8rem', color:'#666'}}>Fin</label><input type="datetime-local" name="fechaFin" value={formData.fechaFin} onChange={handleInputChange} style={{width:'100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing:'border-box'}} required /></div>
                    </div>

                    <div>
                        <select name="ubicacionId" value={formData.ubicacionId} onChange={handleInputChange} style={{padding: '12px', width:'100%', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: showNewUbicacionForm ? '#f0f8ff' : 'white'}}>
                            <option value="">-- Seleccionar Ubicación --</option><option value="CREAR_NUEVO" style={{fontWeight: 'bold', color: '#00B4D8'}}>+ Nueva Ubicación...</option><option disabled>----------------</option>{ubicaciones.map(u => (<option key={u.id} value={u.id}>{u.nombre}</option>))}
                        </select>
                        {showNewUbicacionForm && (
                            <div style={miniFormContainerStyle}>
                                <div style={miniFormStyle}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px'}}><span style={{fontSize:'0.8rem', color:'#00B4D8', fontWeight:'bold'}}>Nueva Ubicación de Evento:</span><button type="button" onClick={cancelNewUbicacion} style={{background: 'none', border:'none', cursor:'pointer', fontWeight:'bold', color: '#666', fontSize: '1.1rem'}} title="Cancelar">✕</button></div>
                                    <input name="nombre" value={newUbicacion.nombre} onChange={handleNewUbicacionChange} placeholder="Nombre (Ej: Campo Escuela)" style={{padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}} required />
                                    <input name="direccion" value={newUbicacion.direccion} onChange={handleNewUbicacionChange} placeholder="Dirección Exacta" style={{padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{display: 'flex', gap: '15px'}}>
                        {/* 2. SOLUCIÓN AQUÍ: Agregamos el Label y envolvemos en div para consistencia */}
                        <div style={{flex: 1}}>
                            <label style={{fontSize:'0.8rem', color:'#666', display:'block', marginBottom:'5px'}}>Costo / Cuota ($)</label>
                            <input type="number" name="costo" value={formData.costo} onChange={handleInputChange} placeholder="0" style={{padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box'}} />
                        </div>
                    </div>

                    <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} placeholder="Detalles del evento..." rows="3" style={{padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit'}} />

                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '10px'}}>
                        <button type="button" onClick={handleCloseModal} style={{padding: '12px 25px', border: '1px solid #ccc', background: '#f8f9fa', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#555'}}>Cancelar</button>
                        <button type="submit" style={btnPrimaryStyle}>Guardar Evento</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

export default Eventos;