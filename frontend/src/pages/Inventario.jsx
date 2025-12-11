import React, { useState, useEffect } from 'react';
import { authFetch } from '../helpers/authFetch';

const statusColors = {
  NUEVO: { bg: '#d1e7dd', text: '#0f5132' },
  BUENO: { bg: '#d1e7dd', text: '#0f5132' },
  REGULAR: { bg: '#fff3cd', text: '#664d03' },
  EN_REPARACION: { bg: '#cfe2ff', text: '#084298' },
  MALO: { bg: '#f8d7da', text: '#842029' },
  BAJA: { bg: '#e2e3e5', text: '#41464b' }
};

function Inventario() {
  // 1. DETECTOR DE MÓVIL
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [materiales, setMateriales] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]); 
  
  const [searchTerm, setSearchTerm] = useState("");        
  const [debouncedFilter, setDebouncedFilter] = useState(""); 
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [tableOpacity, setTableOpacity] = useState(0); 

  const [showModal, setShowModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [showUbicacionInfo, setShowUbicacionInfo] = useState(false);
  const [ubicacionInfoVisible, setUbicacionInfoVisible] = useState(false);
  const [selectedUbicacion, setSelectedUbicacion] = useState(null);

  const [showNewCategoriaForm, setShowNewCategoriaForm] = useState(false);
  const [newCategoria, setNewCategoria] = useState({ nombre: '', descripcion: '' });

  const [showNewUbicacionForm, setShowNewUbicacionForm] = useState(false);
  const [newUbicacion, setNewUbicacion] = useState({ nombre: '', direccion: '' });

  const [formData, setFormData] = useState({
    id: null, nombre: '', 
    categoriaId: '', 
    cantidad: 1, 
    estado: 'BUENO', 
    ubicacionId: '', 
    descripcion: ''
  });

  // LISTENER PARA RESPONSIVIDAD
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setTableOpacity(0);
    const handler = setTimeout(() => { setDebouncedFilter(searchTerm); setTableOpacity(1); }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setTableOpacity(0);
    try {
      const [resMat, resCat, resUbi] = await Promise.all([
          authFetch('http://localhost:8080/api/materiales'),
          authFetch('http://localhost:8080/api/categorias'),
          authFetch('http://localhost:8080/api/ubicaciones')
      ]);

      if (resMat.ok && resCat.ok && resUbi.ok) {
          const dataMat = await resMat.json();
          const dataCat = await resCat.json();
          const dataUbi = await resUbi.json();
          setMateriales(dataMat);
          setCategorias(dataCat);
          setUbicaciones(dataUbi);
      }
      setTimeout(() => setTableOpacity(1), 100); 
    } catch (error) { console.error("Error cargando inventario:", error); }
  };

  // --- HANDLERS ---
  const handleOpenModal = (material = null) => {
    setShowNewCategoriaForm(false); setShowNewUbicacionForm(false);
    setNewCategoria({ nombre: '', descripcion: '' }); setNewUbicacion({ nombre: '', direccion: '' });

    if (material) {
      setIsEditing(true);
      setFormData({
        id: material.id, nombre: material.nombre, 
        categoriaId: material.categoria ? material.categoria.id : '',
        cantidad: material.cantidad || 1, estado: material.estado || 'BUENO',
        ubicacionId: material.ubicacion ? material.ubicacion.id : '', 
        descripcion: material.descripcion || ''
      });
    } else {
      setIsEditing(false);
      setFormData({ id: null, nombre: '', categoriaId: '', cantidad: 1, estado: 'BUENO', ubicacionId: '', descripcion: '' });
    }
    setShowModal(true);
    setTimeout(() => setModalVisible(true), 10);
  };

  const handleCloseModal = () => { setModalVisible(false); setTimeout(() => setShowModal(false), 300); };
  const handleViewUbicacion = (ubicacion) => { setSelectedUbicacion(ubicacion); setShowUbicacionInfo(true); setTimeout(() => setUbicacionInfoVisible(true), 10); };
  const handleCloseUbicacionInfo = () => { setUbicacionInfoVisible(false); setTimeout(() => setShowUbicacionInfo(false), 300); };
  
  const handleGoToMaps = () => { 
      if (selectedUbicacion && selectedUbicacion.direccion) { 
          const query = encodeURIComponent(selectedUbicacion.direccion); 
          window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank'); 
      } 
  };

  const cancelNewCategoria = () => { setShowNewCategoriaForm(false); setFormData({ ...formData, categoriaId: '' }); };
  const cancelNewUbicacion = () => { setShowNewUbicacionForm(false); setFormData({ ...formData, ubicacionId: '' }); };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'categoriaId') {
        if (value === 'CREAR_NUEVO') { setShowNewCategoriaForm(true); setFormData({ ...formData, categoriaId: '' }); } 
        else { setShowNewCategoriaForm(false); setFormData({ ...formData, categoriaId: value }); }
    } else if (name === 'ubicacionId') {
        if (value === 'CREAR_NUEVO') { setShowNewUbicacionForm(true); setFormData({ ...formData, ubicacionId: '' }); } 
        else { setShowNewUbicacionForm(false); setFormData({ ...formData, ubicacionId: value }); }
    } else { setFormData({ ...formData, [name]: value }); }
  };

  const handleNewCategoriaChange = (e) => { setNewCategoria({ ...newCategoria, [e.target.name]: e.target.value }); };
  const handleNewUbicacionChange = (e) => { setNewUbicacion({ ...newUbicacion, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalCategoriaId = formData.categoriaId;
    let finalUbicacionId = formData.ubicacionId;

    try {
        if (showNewCategoriaForm) {
            const resCat = await authFetch('http://localhost:8080/api/categorias', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newCategoria) });
            if (!resCat.ok) throw new Error("Error creando categoría");
            const catCreada = await resCat.json();
            finalCategoriaId = catCreada.id;
            setCategorias([...categorias, catCreada]); 
        }
        if (showNewUbicacionForm) {
            const resUbi = await authFetch('http://localhost:8080/api/ubicaciones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUbicacion) });
            if (!resUbi.ok) throw new Error("Error creando ubicación");
            const ubiCreada = await resUbi.json();
            finalUbicacionId = ubiCreada.id;
            setUbicaciones([...ubicaciones, ubiCreada]); 
        }

        const payload = {
            nombre: formData.nombre, cantidad: formData.cantidad, estado: formData.estado, descripcion: formData.descripcion,
            categoria: finalCategoriaId ? { id: finalCategoriaId } : null, ubicacion: finalUbicacionId ? { id: finalUbicacionId } : null
        };
        if (isEditing) payload.id = formData.id;

        await authFetch('http://localhost:8080/api/materiales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        handleCloseModal();
        setTimeout(() => { fetchData(); alert(isEditing ? "Item actualizado" : "Item agregado"); }, 300);

    } catch (error) { console.error("Error al guardar:", error); alert("Error al guardar. Revisa los datos."); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este material del inventario?")) {
        try { await authFetch(`http://localhost:8080/api/materiales/${id}`, { method: 'DELETE' }); fetchData(); } catch (error) { console.error(error); }
    }
  };

  const requestSort = (key) => {
    setTableOpacity(0);
    setTimeout(() => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
        setTableOpacity(1);
    }, 300);
  };

  const materialesProcesados = React.useMemo(() => {
    const filterText = debouncedFilter.toLowerCase();
    let data = materiales.filter(m => m.nombre.toLowerCase().includes(filterText) || (m.categoria && m.categoria.nombre.toLowerCase().includes(filterText)) || (m.ubicacion && m.ubicacion.nombre.toLowerCase().includes(filterText)));
    if (sortConfig.key) {
      data.sort((a, b) => {
        let valorA = ''; let valorB = '';
        if (sortConfig.key === 'categoria') { valorA = a.categoria?.nombre || ''; valorB = b.categoria?.nombre || ''; } 
        else if (sortConfig.key === 'ubicacion') { valorA = a.ubicacion?.nombre || ''; valorB = b.ubicacion?.nombre || ''; } 
        else { valorA = a[sortConfig.key] || ''; valorB = b[sortConfig.key] || ''; }
        if (typeof valorA === 'string') valorA = valorA.toLowerCase(); if (typeof valorB === 'string') valorB = valorB.toLowerCase();
        if (valorA < valorB) return sortConfig.direction === 'asc' ? -1 : 1; if (valorA > valorB) return sortConfig.direction === 'asc' ? 1 : -1; return 0;
      });
    }
    return data;
  }, [materiales, debouncedFilter, sortConfig]);

  // --- ESTILOS RESPONSIVOS ---
  const containerStyle = { padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Montserrat', sans-serif" };
  
  // Header Adaptable
  const headerCardStyle = { 
      backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '25px', border: '1px solid #eee',
      display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: isMobile ? '15px' : '0' 
  };
  const titleStyle = { color: '#00B4D8', margin: 0, textTransform: 'uppercase', fontSize: isMobile ? '1.5rem' : '1.8rem', textAlign: isMobile ? 'center' : 'left' };
  
  // Controles
  const controlsContainerStyle = { display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? '10px' : '0', width: isMobile ? '100%' : 'auto' };
  const searchInputStyle = { padding: '12px 15px', borderRadius: '8px', border: '1px solid #ddd', width: isMobile ? '100%' : '300px', marginRight: isMobile ? '0' : '15px', fontSize: '0.95rem', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' };
  const btnPrimaryStyle = { backgroundColor: '#00B4D8', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', boxShadow: '0 4px 10px rgba(0, 180, 216, 0.3)', transition: 'transform 0.1s', width: isMobile ? '100%' : 'auto' };

  // Tabla con Scroll Horizontal
  const tableContainerStyle = { width: '100%', overflowX: 'auto', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #eee', backgroundColor: 'white' };
  const tableStyle = { width: '100%', borderCollapse: 'collapse', minWidth: '800px' };

  const thSortableStyle = { backgroundColor: '#f8f9fa', color: '#444', padding: '18px', textAlign: 'left', userSelect: 'none', borderBottom: '2px solid #eee', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' };
  const thNoSortStyle = { backgroundColor: '#f8f9fa', color: '#444', padding: '18px', textAlign: 'left', userSelect: 'none', borderBottom: '2px solid #eee', fontWeight: '600', cursor: 'default' };
  const tdStyle = { padding: '15px 18px', borderBottom: '1px solid #eee', verticalAlign: 'middle' };
  const SortIcon = ({ colKey }) => { if (sortConfig.key !== colKey) return <span style={{opacity:0.3, marginLeft:'5px', fontSize: '0.8rem'}}>⇅</span>; return sortConfig.direction === 'asc' ? <span style={{marginLeft:'5px', color: '#00B4D8'}}>↑</span> : <span style={{marginLeft:'5px', color: '#00B4D8'}}>↓</span>; };
  
  // Modales
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(3px)', opacity: modalVisible || ubicacionInfoVisible ? 1 : 0, transition: 'opacity 0.3s ease-in-out' };
  const modalContentStyle = { backgroundColor: 'white', padding: '40px', borderRadius: '20px', width: isMobile ? '90%' : '550px', boxShadow: '0 15px 30px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto', transform: modalVisible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)', opacity: modalVisible ? 1 : 0, transition: 'all 0.3s ease-in-out' };
  const locationCardStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: isMobile ? '90%' : '400px', boxShadow: '0 15px 30px rgba(0,0,0,0.2)', textAlign: 'center', transform: ubicacionInfoVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)', opacity: ubicacionInfoVisible ? 1 : 0, transition: 'all 0.3s ease-in-out' };
  
  const miniFormContainerStyle = { transition: 'all 0.3s ease-in-out', overflow: 'hidden' };
  const miniFormStyle = { backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '10px', border: '1px dashed #00B4D8', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' };

  return (
    <div style={containerStyle}>
      <div style={headerCardStyle}>
        <div><h1 style={titleStyle}>Inventario de Grupo</h1><p style={{color: '#888', margin: '5px 0 0 0', fontSize: '1rem', textAlign: isMobile ? 'center' : 'left'}}>Control logístico y materiales</p></div>
        <div style={controlsContainerStyle}>
            <input type="text" placeholder="🔍 Buscar material o ubicación..." style={searchInputStyle} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onFocus={(e) => e.target.style.borderColor = '#00B4D8'} onBlur={(e) => e.target.style.borderColor = '#ddd'} />
            <button style={btnPrimaryStyle} onClick={() => handleOpenModal()} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>+ Nuevo Item</button>
        </div>
      </div>

      {/* CONTENEDOR CON SCROLL HORIZONTAL */}
      <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
                <tr>
                    <th style={thSortableStyle} onClick={() => requestSort('nombre')}>Material <SortIcon colKey="nombre"/></th>
                    <th style={thSortableStyle} onClick={() => requestSort('categoria')}>Categoría <SortIcon colKey="categoria"/></th>
                    <th style={thSortableStyle} onClick={() => requestSort('cantidad')}>Cant. <SortIcon colKey="cantidad"/></th>
                    <th style={thSortableStyle} onClick={() => requestSort('estado')}>Estado <SortIcon colKey="estado"/></th>
                    <th style={thSortableStyle} onClick={() => requestSort('ubicacion')}>Ubicación <SortIcon colKey="ubicacion"/></th>
                    <th style={thNoSortStyle} width="100">Acciones</th>
                </tr>
            </thead>
            <tbody style={{ opacity: tableOpacity, transition: 'opacity 0.3s ease-in-out' }}>
                {materialesProcesados.length > 0 ? (
                    materialesProcesados.map((m) => (
                        <tr key={m.id} style={{backgroundColor: 'white', transition: 'background 0.1s'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f8ff'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                            <td style={tdStyle}><div style={{fontWeight: '600', color: '#333'}}>{m.nombre}</div>{m.descripcion && <div style={{fontSize: '0.8rem', color: '#888'}}>{m.descripcion}</div>}</td>
                            <td style={tdStyle}>{m.categoria ? (<span style={{background: '#eee', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem'}}>{m.categoria.nombre}</span>) : <span style={{color: '#ccc', fontStyle:'italic'}}>Sin Categoría</span>}</td>
                            <td style={tdStyle}><span style={{fontWeight: 'bold', fontSize:'1.1rem'}}>{m.cantidad}</span></td>
                            <td style={tdStyle}><span style={{ backgroundColor: statusColors[m.estado]?.bg || '#eee', color: statusColors[m.estado]?.text || '#333', padding: '5px 10px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 'bold', border: `1px solid ${statusColors[m.estado]?.text}33` }}>{m.estado}</span></td>
                            <td style={tdStyle}>{m.ubicacion ? (<span onClick={() => handleViewUbicacion(m.ubicacion)} style={{color: '#00B4D8', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline'}} title="Ver detalles de la ubicación">📍 {m.ubicacion.nombre}</span>) : <span style={{color: '#ccc', fontStyle:'italic'}}>Sin Ubicación</span>}</td>
                            <td style={tdStyle}>
                                <button onClick={() => handleOpenModal(m)} style={{marginRight: '10px', border:'none', background:'transparent', cursor:'pointer', fontSize:'1.2rem'}} title="Editar">✏️</button>
                                <button onClick={() => handleDelete(m.id)} style={{border:'none', background:'transparent', cursor:'pointer', fontSize:'1.2rem', color: '#ED1C24'}} title="Eliminar">🗑️</button>
                            </td>
                        </tr>
                    ))
                ) : (<tr><td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#888', fontStyle: 'italic'}}>No hay materiales registrados.</td></tr>)}
            </tbody>
          </table>
      </div>

      {/* MODAL FORMULARIO MATERIAL */}
      {showModal && (
        <div style={modalOverlayStyle} onClick={(e) => { if(e.target === e.currentTarget) handleCloseModal() }}>
            <div style={modalContentStyle}>
                <h2 style={{color: '#222', marginTop: 0, marginBottom: '25px', textAlign: 'center'}}>{isEditing ? 'Editar Material' : 'Nuevo Material'}</h2>
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                    <input name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Nombre del Material (Ej: Carpa)" style={{padding: '12px', borderRadius: '8px', border: '1px solid #ddd'}} required />
                    
                    {/* FILA 1: RESPONSIVA */}
                    <div style={{display: isMobile ? 'flex' : 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '15px', alignItems: 'flex-start'}}>
                        <div style={{flex: 1, width: '100%'}}>
                            <select name="categoriaId" value={formData.categoriaId} onChange={handleInputChange} style={{padding: '12px', width:'100%', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: showNewCategoriaForm ? '#f0f8ff' : 'white'}}>
                                <option value="">-- Categoría --</option><option value="CREAR_NUEVO" style={{fontWeight: 'bold', color: '#00B4D8'}}>+ Nueva Categoría...</option><option disabled>----------------</option>{categorias.map(c => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
                            </select>
                            {showNewCategoriaForm && (
                                <div style={miniFormContainerStyle}>
                                    <div style={miniFormStyle}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px'}}><span style={{fontSize:'0.8rem', color:'#00B4D8', fontWeight:'bold'}}>Nueva Categoría:</span><button type="button" onClick={cancelNewCategoria} style={{background: 'none', border:'none', cursor:'pointer', fontWeight:'bold', color: '#666', fontSize: '1.1rem'}} title="Cancelar">✕</button></div>
                                        <input name="nombre" value={newCategoria.nombre} onChange={handleNewCategoriaChange} placeholder="Nombre (Ej: Montaña)" style={{padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}} required />
                                        <input name="descripcion" value={newCategoria.descripcion} onChange={handleNewCategoriaChange} placeholder="Descripción Corta" style={{padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}} />
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Cantidad con ancho automático o full en móvil */}
                        <input type="number" name="cantidad" value={formData.cantidad} onChange={handleInputChange} placeholder="Cant." style={{padding: '12px', width: isMobile ? '100%' : '60px', borderRadius: '8px', border: '1px solid #ddd', height: 'fit-content'}} required min="1" />
                    </div>

                    {/* FILA 2: RESPONSIVA */}
                    <div style={{display: isMobile ? 'flex' : 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '15px', alignItems: 'flex-start'}}>
                        <select name="estado" value={formData.estado} onChange={handleInputChange} style={{padding: '12px', width: '100%', flex:1, borderRadius: '8px', border: '1px solid #ddd', height: 'fit-content'}}>
                            <option value="NUEVO">NUEVO</option><option value="BUENO">BUENO</option><option value="REGULAR">REGULAR</option><option value="MALO">MALO</option><option value="EN_REPARACION">EN REPARACIÓN</option><option value="BAJA">DE BAJA</option>
                        </select>
                        
                        <div style={{flex: 1, width: '100%'}}>
                            <select name="ubicacionId" value={formData.ubicacionId} onChange={handleInputChange} style={{padding: '12px', width:'100%', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: showNewUbicacionForm ? '#f0f8ff' : 'white'}}>
                                <option value="">-- Ubicación --</option><option value="CREAR_NUEVO" style={{fontWeight: 'bold', color: '#00B4D8'}}>+ Nueva Ubicación...</option><option disabled>----------------</option>{ubicaciones.map(u => (<option key={u.id} value={u.id}>{u.nombre}</option>))}
                            </select>
                            {showNewUbicacionForm && (
                                <div style={miniFormContainerStyle}>
                                    <div style={miniFormStyle}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px'}}><span style={{fontSize:'0.8rem', color:'#00B4D8', fontWeight:'bold'}}>Nueva Ubicación:</span><button type="button" onClick={cancelNewUbicacion} style={{background: 'none', border:'none', cursor:'pointer', fontWeight:'bold', color: '#666', fontSize: '1.1rem'}} title="Cancelar">✕</button></div>
                                        <input name="nombre" value={newUbicacion.nombre} onChange={handleNewUbicacionChange} placeholder="Nombre (Ej: Bodega 1)" style={{padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}} required />
                                        <input name="direccion" value={newUbicacion.direccion} onChange={handleNewUbicacionChange} placeholder="Dirección Exacta" style={{padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} placeholder="Descripción o notas adicionales..." rows="3" style={{padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit'}} />

                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '10px'}}>
                        <button type="button" onClick={handleCloseModal} style={{padding: '12px 25px', border: '1px solid #ccc', background: '#f8f9fa', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#555'}}>Cancelar</button>
                        <button type="submit" style={btnPrimaryStyle}>Guardar Material</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* MODAL INFO UBICACIÓN */}
      {showUbicacionInfo && selectedUbicacion && (
          <div style={modalOverlayStyle} onClick={(e) => { if(e.target === e.currentTarget) handleCloseUbicacionInfo() }}>
              <div style={locationCardStyle}>
                  <div style={{fontSize: '3rem', marginBottom: '10px'}}>🗺️</div>
                  <h3 style={{margin: '0 0 5px 0', color: '#333'}}>{selectedUbicacion.nombre}</h3>
                  <p style={{color: '#666', margin: '0 0 20px 0', fontSize: '0.9rem'}}>Ubicación de Material</p>
                  <div style={{backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '10px', marginBottom: '20px'}}>
                      <div style={{fontSize: '0.8rem', color: '#888', fontWeight: 'bold', marginBottom: '5px'}}>DIRECCIÓN</div>
                      <div style={{fontSize: '1.1rem', fontWeight: '500', color: '#222'}}>{selectedUbicacion.direccion}</div>
                  </div>
                  <button onClick={handleGoToMaps} style={{width: '100%', padding: '12px', backgroundColor: '#4285F4', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 10px rgba(66, 133, 244, 0.3)'}}><span>📍</span> Ver en Google Maps</button>
                  <button onClick={handleCloseUbicacionInfo} style={{marginTop: '15px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', textDecoration: 'underline'}}>Cerrar</button>
              </div>
          </div>
      )}
    </div>
  );
}

export default Inventario;