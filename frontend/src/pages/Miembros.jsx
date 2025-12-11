import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// 1. IMPORTAMOS authFetch (¡Esto faltaba!)
import { authFetch } from '../helpers/authFetch';

const ramaColors = {
  MANADA: '#fced21',
  BANDADA: '#1b2a7c',
  TROPA: '#009245',
  COMPANIA: '#66ccbe',
  AVANZADA: '#5d448b',
  CLAN: '#ED1C24'
};

const ramaTextColors = {
  BANDADA: '#fff',
  AVANZADA: '#fff',
  default: '#222'
};

function Miembros() {
  const navigate = useNavigate();
  const location = useLocation();

  const [miembros, setMiembros] = useState([]);
  const [ramas, setRamas] = useState([]);
  const [apoderados, setApoderados] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState("");        
  const [debouncedFilter, setDebouncedFilter] = useState(""); 
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [tableOpacity, setTableOpacity] = useState(0); 

  // ESTADOS MODAL PRINCIPAL
  const [showModal, setShowModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // Animación modal
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null, nombres: '', apellidos: '', documentoIdentidad: '',
    fechaNacimiento: '', telefonoApoderado: '', direccion: '',
    ramaId: '', apoderadoId: ''
  });

  // ESTADOS MINI-FORM APODERADO
  const [showNewApoderadoForm, setShowNewApoderadoForm] = useState(false);
  const [miniFormVisible, setMiniFormVisible] = useState(false); // Animación mini-form
  const [isEditingApoderado, setIsEditingApoderado] = useState(false); 
  const [newApoderado, setNewApoderado] = useState({
      id: null, nombres: '', apellidos: '', email: '', telefono: '', direccion: ''
  });

  // ESTADOS MODAL INFO
  const [showApoderadoInfo, setShowApoderadoInfo] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false); // Animación info
  const [selectedApoderadoInfo, setSelectedApoderadoInfo] = useState(null);

  // --- EFECTOS ---
  useEffect(() => {
    if (location.state?.ramaFilterName && searchTerm === location.state.ramaFilterName) return;
    setTableOpacity(0);
    const handler = setTimeout(() => { setDebouncedFilter(searchTerm); setTableOpacity(1); }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
    if (location.state?.ramaFilterName) {
        const filtroRecibido = location.state.ramaFilterName;
        setSearchTerm(filtroRecibido);
        setDebouncedFilter(filtroRecibido);
        window.history.replaceState({}, document.title);
    }
  }, []);

  const fetchData = async () => {
    setTableOpacity(0);
    try {
      // 2. USAMOS authFetch EN TODAS LAS PETICIONES
      const [resMiembros, resRamas, resApoderados] = await Promise.all([
        authFetch('http://localhost:8080/api/miembros'),
        authFetch('http://localhost:8080/api/ramas'),
        authFetch('http://localhost:8080/api/apoderados')
      ]);

      if (resMiembros.ok && resRamas.ok && resApoderados.ok) {
          setMiembros(await resMiembros.json());
          setRamas(await resRamas.json());
          setApoderados(await resApoderados.json());
      }
      setTimeout(() => setTableOpacity(1), 100); 
    } catch (error) { console.error("Error cargando datos:", error); }
  };

  // --- HANDLERS ANIMADOS ---
  const handleOpenModal = (miembro = null) => {
    setShowNewApoderadoForm(false);
    setMiniFormVisible(false);
    setIsEditingApoderado(false);
    setNewApoderado({ id: null, nombres: '', apellidos: '', email: '', telefono: '', direccion: '' });
    
    if (miembro) {
      setIsEditing(true);
      setFormData({
        id: miembro.id, nombres: miembro.nombres, apellidos: miembro.apellidos,
        documentoIdentidad: miembro.documentoIdentidad || '', fechaNacimiento: miembro.fechaNacimiento || '',
        telefonoApoderado: miembro.telefonoApoderado || '', direccion: miembro.direccion || '',
        ramaId: miembro.rama ? miembro.rama.id : '', apoderadoId: miembro.apoderado ? miembro.apoderado.id : ''
      });
    } else {
      setIsEditing(false);
      setFormData({ id: null, nombres: '', apellidos: '', documentoIdentidad: '', fechaNacimiento: '', telefonoApoderado: '', direccion: '', ramaId: '', apoderadoId: '' });
    }
    setShowModal(true);
    setTimeout(() => setModalVisible(true), 10);
  };

  const handleCloseModal = () => {
      setModalVisible(false);
      setTimeout(() => setShowModal(false), 300);
  };

  const handleShowMiniForm = () => {
      setShowNewApoderadoForm(true);
      setTimeout(() => setMiniFormVisible(true), 10);
  };

  const handleHideMiniForm = () => {
      setMiniFormVisible(false);
      setTimeout(() => setShowNewApoderadoForm(false), 300);
  };

  const handleViewApoderado = (apoderado) => {
      setSelectedApoderadoInfo(apoderado);
      setShowApoderadoInfo(true);
      setTimeout(() => setInfoVisible(true), 10);
  };

  const handleCloseInfo = () => {
      setInfoVisible(false);
      setTimeout(() => setShowApoderadoInfo(false), 300);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'apoderadoId') {
        if (value === 'CREAR_NUEVO') { 
            handleShowMiniForm(); 
            setIsEditingApoderado(false); 
            setNewApoderado({ id: null, nombres: '', apellidos: '', email: '', telefono: '', direccion: '' });
            setFormData({ ...formData, apoderadoId: '' }); 
        } 
        else { 
            if(showNewApoderadoForm) handleHideMiniForm();
            setIsEditingApoderado(false);
            setFormData({ ...formData, apoderadoId: value }); 
        }
    } else { setFormData({ ...formData, [name]: value }); }
  };

  const handleNewApoderadoChange = (e) => { const { name, value } = e.target; setNewApoderado({ ...newApoderado, [name]: value }); };

  const handleEditExistingApoderado = () => {
      const apoderadoId = formData.apoderadoId;
      if (!apoderadoId) return;
      const apoderadoActual = apoderados.find(a => a.id === parseInt(apoderadoId));
      if (apoderadoActual) {
          setNewApoderado({
              id: apoderadoActual.id, nombres: apoderadoActual.nombres, apellidos: apoderadoActual.apellidos,
              email: apoderadoActual.email || '', telefono: apoderadoActual.telefono || '', direccion: apoderadoActual.direccion || ''
          });
          setIsEditingApoderado(true);
          handleShowMiniForm();
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalApoderadoId = formData.apoderadoId;
    try {
        if (showNewApoderadoForm) {
            let url = 'http://localhost:8080/api/apoderados';
            // Con tu backend actual, save() sirve para crear y actualizar (POST funciona)
            const resApoderado = await authFetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newApoderado) });
            if (!resApoderado.ok) throw new Error("Error al guardar apoderado");
            const apoderadoGuardado = await resApoderado.json();
            finalApoderadoId = apoderadoGuardado.id;
            
            if (isEditingApoderado) {
                setApoderados(apoderados.map(a => a.id === finalApoderadoId ? apoderadoGuardado : a));
            } else {
                setApoderados([...apoderados, apoderadoGuardado]);
            }
        }

        const payload = {
          nombres: formData.nombres, apellidos: formData.apellidos, documentoIdentidad: formData.documentoIdentidad,
          fechaNacimiento: formData.fechaNacimiento, telefonoApoderado: formData.telefonoApoderado, direccion: formData.direccion,
          rama: formData.ramaId ? { id: formData.ramaId } : null, apoderado: finalApoderadoId ? { id: finalApoderadoId } : null
        };
        if (isEditing) payload.id = formData.id;
        
        await authFetch('http://localhost:8080/api/miembros', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        
        handleCloseModal();
        setTimeout(() => { fetchData(); alert(isEditing ? "Datos guardados correctamente" : "Miembro creado con éxito"); }, 300);

    } catch (error) { console.error("Error al guardar:", error); alert("Hubo un error al guardar."); }
  };

  const handleDelete = async (id) => { if (window.confirm("¿Estás seguro de eliminar este miembro?")) { try { await authFetch(`http://localhost:8080/api/miembros/${id}`, { method: 'DELETE' }); fetchData(); } catch (error) { console.error(error); } } };
  const calcularEdad = (fecha) => { if (!fecha) return 0; const hoy = new Date(); const nacimiento = new Date(fecha); let edad = hoy.getFullYear() - nacimiento.getFullYear(); const m = hoy.getMonth() - nacimiento.getMonth(); if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) { edad--; } return edad; };
  const requestSort = (key) => { setTableOpacity(0); setTimeout(() => { let direction = 'asc'; if (sortConfig.key === key && sortConfig.direction === 'asc') { direction = 'desc'; } setSortConfig({ key, direction }); setTableOpacity(1); }, 300); };

  const miembrosProcesados = React.useMemo(() => {
    const filterText = debouncedFilter.toLowerCase();
    let data = miembros.filter(m => m.nombres.toLowerCase().includes(filterText) || m.apellidos.toLowerCase().includes(filterText) || (m.rama && m.rama.nombre.toLowerCase().includes(filterText)));
    if (sortConfig.key) {
      data.sort((a, b) => {
        let valorA, valorB;
        switch (sortConfig.key) {
            case 'apellidos': valorA = a.apellidos.toLowerCase(); valorB = b.apellidos.toLowerCase(); break;
            case 'rama': valorA = a.rama?.nombre || ''; valorB = b.rama?.nombre || ''; break;
            case 'edad': valorA = calcularEdad(a.fechaNacimiento); valorB = calcularEdad(b.fechaNacimiento); break;
            case 'apoderado': valorA = a.apoderado?.nombres || ''; valorB = b.apoderado?.nombres || ''; break;
            default: valorA = a[sortConfig.key]; valorB = b[sortConfig.key];
        }
        if (valorA < valorB) return sortConfig.direction === 'asc' ? -1 : 1; if (valorA > valorB) return sortConfig.direction === 'asc' ? 1 : -1; return 0;
      });
    }
    return data;
  }, [miembros, debouncedFilter, sortConfig]);

  const irARama = (rama) => { if(rama) { navigate('/ramas', { state: { selectedRamaId: rama.id } }); } };

  // --- ESTILOS RESPONSIVOS ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const containerStyle = { padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Montserrat', sans-serif" };
  const headerCardStyle = { backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '25px', border: '1px solid #eee', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: isMobile ? '15px' : '0' };
  const titleStyle = { color: '#00B4D8', margin: 0, textTransform: 'uppercase', fontSize: isMobile ? '1.5rem' : '1.8rem', textAlign: isMobile ? 'center' : 'left' };
  const controlsContainerStyle = { display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? '10px' : '0', width: isMobile ? '100%' : 'auto' };
  const searchInputStyle = { padding: '12px 15px', borderRadius: '8px', border: '1px solid #ddd', width: isMobile ? '100%' : '300px', marginRight: isMobile ? '0' : '15px', fontSize: '0.95rem', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' };
  const btnPrimaryStyle = { backgroundColor: '#00B4D8', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', boxShadow: '0 4px 10px rgba(0, 180, 216, 0.3)', transition: 'transform 0.1s', width: isMobile ? '100%' : 'auto' };
  
  // Tabla con scroll horizontal
  const tableContainerStyle = { width: '100%', overflowX: 'auto', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #eee', backgroundColor: 'white' };
  const tableStyle = { width: '100%', borderCollapse: 'collapse', minWidth: '800px' };
  
  const thSortableStyle = { backgroundColor: '#f8f9fa', color: '#444', padding: '18px', textAlign: 'left', userSelect: 'none', borderBottom: '2px solid #eee', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' };
  const thNoSortStyle = { backgroundColor: '#f8f9fa', color: '#444', padding: '18px', textAlign: 'left', userSelect: 'none', borderBottom: '2px solid #eee', fontWeight: '600', cursor: 'default' };
  const tdStyle = { padding: '15px 18px', borderBottom: '1px solid #eee', verticalAlign: 'middle' };
  const SortIcon = ({ colKey }) => { if (sortConfig.key !== colKey) return <span style={{opacity:0.3, marginLeft:'5px', fontSize: '0.8rem'}}>⇅</span>; return sortConfig.direction === 'asc' ? <span style={{marginLeft:'5px', color: '#00B4D8'}}>↑</span> : <span style={{marginLeft:'5px', color: '#00B4D8'}}>↓</span>; };
  
  // Estilos Modales Animados
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(3px)', opacity: modalVisible || infoVisible ? 1 : 0, transition: 'opacity 0.3s ease-in-out' };
  const modalContentStyle = { backgroundColor: 'white', padding: '40px', borderRadius: '20px', width: isMobile ? '90%' : '550px', boxShadow: '0 15px 30px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto', transform: modalVisible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)', opacity: modalVisible ? 1 : 0, transition: 'all 0.3s ease-in-out' };
  const apoderadoCardStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: isMobile ? '90%' : '400px', boxShadow: '0 15px 30px rgba(0,0,0,0.2)', textAlign: 'center', transform: infoVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)', opacity: infoVisible ? 1 : 0, transition: 'all 0.3s ease-in-out' };
  
  // Estilo Mini Form Animado
  const miniFormContainerStyle = { transition: 'all 0.3s ease-in-out', overflow: 'hidden', maxHeight: miniFormVisible ? '500px' : '0px', opacity: miniFormVisible ? 1 : 0, transform: miniFormVisible ? 'translateY(0)' : 'translateY(-10px)' };
  const miniFormStyle = { backgroundColor: isEditingApoderado ? '#fff8e1' : '#f0f8ff', padding: '15px', borderRadius: '10px', border: isEditingApoderado ? '1px dashed #ffa000' : '1px dashed #00B4D8', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' };

  return (
    <div style={containerStyle}>
      <div style={headerCardStyle}>
        <div><h1 style={titleStyle}>Gestión de Miembros</h1><p style={{color: '#888', margin: '5px 0 0 0', fontSize: '1rem', textAlign: isMobile ? 'center' : 'left'}}>Planilla general de beneficiarios</p></div>
        <div style={controlsContainerStyle}>
            <input type="text" placeholder="🔍 Buscar por nombre o rama..." style={searchInputStyle} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onFocus={(e) => e.target.style.borderColor = '#00B4D8'} onBlur={(e) => e.target.style.borderColor = '#ddd'} />
            <button style={btnPrimaryStyle} onClick={() => handleOpenModal()} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>+ Nuevo Miembro</button>
        </div>
      </div>

      <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
                <tr>
                    <th style={thSortableStyle} onClick={() => requestSort('apellidos')}>Nombre Completo <SortIcon colKey="apellidos"/></th>
                    <th style={thSortableStyle} onClick={() => requestSort('rama')}>Rama <SortIcon colKey="rama"/></th>
                    <th style={thSortableStyle} onClick={() => requestSort('edad')}>Edad <SortIcon colKey="edad"/></th>
                    <th style={thSortableStyle} onClick={() => requestSort('apoderado')}>Apoderado <SortIcon colKey="apoderado"/></th>
                    <th style={thNoSortStyle}>Tel. Emergencia</th>
                    <th style={thNoSortStyle} width="150">Acciones</th>
                </tr>
            </thead>
            <tbody style={{ opacity: tableOpacity, transition: 'opacity 0.3s ease-in-out' }}>
                {miembrosProcesados.length > 0 ? (
                    miembrosProcesados.map((m) => (
                        <tr key={m.id} style={{backgroundColor: 'white', transition: 'background 0.1s'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f8ff'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                            <td style={tdStyle}><div style={{fontWeight: '600', fontSize: '1.05rem', color: '#333'}}>{m.apellidos}, {m.nombres}</div><div style={{fontSize: '0.85rem', color: '#888', marginTop: '3px'}}>{m.documentoIdentidad}</div></td>
                            <td style={tdStyle}>{m.rama ? (<span onClick={() => irARama(m.rama)} style={{ backgroundColor: ramaColors[m.rama.tipo] || '#eee', color: ramaTextColors[m.rama.tipo] || '#222', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', textDecoration: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'inline-block' }} title="Ir a ver detalles de la Unidad">{m.rama.nombre}</span>) : <span style={{color:'#aaa', fontStyle: 'italic'}}>Sin Asignar</span>}</td>
                            <td style={tdStyle}><span style={{fontWeight: '500'}}>{calcularEdad(m.fechaNacimiento)}</span> <span style={{fontSize:'0.9rem', color:'#888'}}>años</span></td>
                            <td style={tdStyle}>{m.apoderado ? (<div onClick={() => handleViewApoderado(m.apoderado)} style={{fontWeight: '500', color: '#00B4D8', cursor: 'pointer', textDecoration: 'underline', display: 'inline-block'}} title="Ver datos de contacto">{m.apoderado.nombres} {m.apoderado.apellidos}</div>) : (<span style={{color: '#aaa', fontStyle: 'italic'}}>—</span>)}</td>
                            <td style={tdStyle}><span style={{color: '#555', fontFamily: 'monospace', fontSize: '1rem'}}>{m.telefonoApoderado || '—'}</span></td>
                            <td style={tdStyle}>
                                <button onClick={() => handleOpenModal(m)} style={{marginRight: '15px', border:'none', background:'white', cursor:'pointer', fontSize:'1.3rem', padding: '5px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', transition: 'transform 0.1s'}} title="Editar">✏️</button>
                                <button onClick={() => handleDelete(m.id)} style={{border:'none', background:'white', cursor:'pointer', fontSize:'1.3rem', padding: '5px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', color: '#ED1C24', transition: 'transform 0.1s'}} title="Eliminar">🗑️</button>
                            </td>
                        </tr>
                    ))
                ) : (<tr><td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#888', fontStyle: 'italic'}}>No se encontraron miembros.</td></tr>)}
            </tbody>
          </table>
      </div>

      {/* MODAL CREAR/EDITAR */}
      {showModal && (
        <div style={modalOverlayStyle} onClick={(e) => { if(e.target === e.currentTarget) handleCloseModal() }}>
            <div style={modalContentStyle}>
                <h2 style={{color: '#222', marginTop: 0, marginBottom: '25px', textAlign: 'center'}}>{isEditing ? 'Editar Miembro' : 'Nuevo Miembro'}</h2>
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                    <div style={{display: isMobile ? 'block' : 'flex', gap: '15px'}}>
                        <input name="nombres" value={formData.nombres} onChange={handleInputChange} placeholder="Nombres" style={{padding: '12px', flex:1, borderRadius: '8px', border: '1px solid #ddd', width: isMobile ? '100%' : 'auto', boxSizing: 'border-box', marginBottom: isMobile ? '15px' : '0'}} required />
                        <input name="apellidos" value={formData.apellidos} onChange={handleInputChange} placeholder="Apellidos" style={{padding: '12px', flex:1, borderRadius: '8px', border: '1px solid #ddd', width: isMobile ? '100%' : 'auto', boxSizing: 'border-box'}} required />
                    </div>
                    <input name="documentoIdentidad" value={formData.documentoIdentidad} onChange={handleInputChange} placeholder="RUT / DNI" style={{padding: '12px', borderRadius: '8px', border: '1px solid #ddd'}} />
                    <div><label style={{display:'block', fontSize: '0.9rem', color: '#666', marginBottom: '5px'}}>Fecha de Nacimiento:</label><input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleInputChange} style={{padding: '12px', width: '100%', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #ddd'}} required /></div>
                    <select name="ramaId" value={formData.ramaId} onChange={handleInputChange} style={{padding: '12px', borderRadius: '8px', border: '1px solid #ddd'}} required><option value="">-- Selecciona una Rama --</option>{ramas.map(r => (<option key={r.id} value={r.id}>{r.nombre}</option>))}</select>
                    
                    <div style={{borderTop: '1px solid #eee', paddingTop: '15px'}}>
                        <label style={{display:'block', fontSize: '0.9rem', color: '#00B4D8', fontWeight: 'bold', marginBottom: '8px'}}>Apoderado / Responsable</label>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <select name="apoderadoId" value={formData.apoderadoId} onChange={handleInputChange} style={{padding: '12px', width:'100%', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: showNewApoderadoForm ? (isEditingApoderado ? '#fff8e1' : '#f0f8ff') : 'white', flex: 1}}>
                                <option value="">-- Sin Apoderado (Opcional) --</option><option value="CREAR_NUEVO" style={{fontWeight: 'bold', color: '#00B4D8'}}>+ Crear Nuevo Apoderado...</option><option disabled>----------------</option>{apoderados.map(a => (<option key={a.id} value={a.id}>{a.nombres} {a.apellidos}</option>))}
                            </select>
                            {formData.apoderadoId && formData.apoderadoId !== 'CREAR_NUEVO' && !showNewApoderadoForm && (
                                <button type="button" onClick={handleEditExistingApoderado} style={{padding: '0 15px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '1.2rem'}} title="Editar">✏️</button>
                            )}
                        </div>
                        {showNewApoderadoForm && (
                            <div style={miniFormContainerStyle}>
                                <div style={miniFormStyle}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><div style={{fontSize:'0.85rem', color: isEditingApoderado ? '#ffa000' : '#00B4D8', fontWeight: 'bold', fontStyle:'italic'}}>{isEditingApoderado ? 'Editando Apoderado Existente:' : 'Ingresa los datos del nuevo apoderado:'}</div><button type="button" onClick={handleHideMiniForm} style={{background: 'none', border:'none', cursor:'pointer', fontWeight:'bold', color: '#666'}}>✕</button></div>
                                    <div style={{display: isMobile ? 'block' : 'flex', gap: '10px'}}>
                                        <input name="nombres" value={newApoderado.nombres} onChange={handleNewApoderadoChange} placeholder="Nombres Apoderado" style={{padding: '8px', flex:1, borderRadius: '5px', border: '1px solid #ccc', width: isMobile ? '100%' : 'auto', boxSizing: 'border-box', marginBottom: isMobile ? '10px' : '0'}} required />
                                        <input name="apellidos" value={newApoderado.apellidos} onChange={handleNewApoderadoChange} placeholder="Apellidos" style={{padding: '8px', flex:1, borderRadius: '5px', border: '1px solid #ccc', width: isMobile ? '100%' : 'auto', boxSizing: 'border-box'}} required />
                                    </div>
                                    <input name="email" value={newApoderado.email} onChange={handleNewApoderadoChange} placeholder="Email" style={{padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}} /><input name="telefono" value={newApoderado.telefono} onChange={handleNewApoderadoChange} placeholder="Teléfono" style={{padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}} />
                                </div>
                            </div>
                        )}
                    </div>
                    <input name="telefonoApoderado" value={formData.telefonoApoderado} onChange={handleInputChange} placeholder="Teléfono de Emergencia Extra (Opcional)" style={{padding: '12px', borderRadius: '8px', border: '1px solid #ddd'}} /><input name="direccion" value={formData.direccion} onChange={handleInputChange} placeholder="Dirección" style={{padding: '12px', borderRadius: '8px', border: '1px solid #ddd'}} />
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px'}}><button type="button" onClick={handleCloseModal} style={{padding: '12px 25px', border: '1px solid #ccc', background: '#f8f9fa', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#555'}}>Cancelar</button><button type="submit" style={btnPrimaryStyle}>Guardar Todo</button></div>
                </form>
            </div>
        </div>
      )}

      {/* MODAL INFO APODERADO */}
      {showApoderadoInfo && selectedApoderadoInfo && (
          <div style={modalOverlayStyle} onClick={(e) => { if(e.target === e.currentTarget) handleCloseInfo() }}>
              <div style={apoderadoCardStyle}>
                  <h3 style={{color: '#00B4D8', margin: '0 0 20px 0', borderBottom: '2px solid #eee', paddingBottom: '10px'}}>Datos de Contacto</h3>
                  <div style={{textAlign: 'center', marginBottom: '20px'}}><div style={{fontSize: '3rem'}}>🧑‍🧑</div><h2 style={{margin: '10px 0', color: '#333'}}>{selectedApoderadoInfo.nombres} {selectedApoderadoInfo.apellidos}</h2><span style={{background: '#f0f8ff', color: '#00B4D8', padding: '5px 10px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold'}}>Apoderado</span></div>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'10px'}}><span style={{fontSize:'1.2rem'}}>📞</span><div><div style={{fontSize:'0.8rem', color:'#888'}}>Teléfono</div><div style={{fontWeight:'500'}}>{selectedApoderadoInfo.telefono || 'No registrado'}</div></div></div>
                      <div style={{display:'flex', alignItems:'center', gap:'10px'}}><span style={{fontSize:'1.2rem'}}>📧</span><div><div style={{fontSize:'0.8rem', color:'#888'}}>Correo Electrónico</div><div style={{fontWeight:'500'}}>{selectedApoderadoInfo.email || 'No registrado'}</div></div></div>
                      <div style={{display:'flex', alignItems:'center', gap:'10px'}}><span style={{fontSize:'1.2rem'}}>🏠</span><div><div style={{fontSize:'0.8rem', color:'#888'}}>Dirección</div><div style={{fontWeight:'500'}}>{selectedApoderadoInfo.direccion || 'No registrada'}</div></div></div>
                  </div>
                  <button onClick={handleCloseInfo} style={{marginTop: '30px', width: '100%', padding: '12px', backgroundColor: '#222', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>Cerrar</button>
              </div>
          </div>
      )}
    </div>
  );
}

export default Miembros;