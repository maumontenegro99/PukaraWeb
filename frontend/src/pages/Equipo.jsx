import React, { useState, useEffect } from 'react';
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

function Equipo() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [dirigentes, setDirigentes] = useState([]);
  const [ramas, setRamas] = useState([]);

  // Estados UI
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tableOpacity, setTableOpacity] = useState(0);

  const [formData, setFormData] = useState({
    id: null, nombres: '', apellidos: '', email: '', telefono: '', cargo: '', 
    fechaNacimiento: '', ramaId: '',
    docAntecedentes: false, docInhabilidad: false, 
    docCurriculum: false, docCurriculumScout: false, docNacimiento: false
  });

  // --- EFECTOS ---
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
      const [resDir, resRam] = await Promise.all([
        authFetch('http://localhost:8080/api/dirigentes'),
        authFetch('http://localhost:8080/api/ramas')
      ]);
      if (resDir.ok) setDirigentes(await resDir.json());
      if (resRam.ok) setRamas(await resRam.json());
      setTimeout(() => setTableOpacity(1), 100);
    } catch (error) { console.error("Error cargando equipo:", error); }
  };

  // --- HANDLERS ---
  const handleOpenModal = (dir = null) => {
    if (dir) {
      setIsEditing(true);
      setFormData({
        id: dir.id, nombres: dir.nombres, apellidos: dir.apellidos,
        email: dir.email || '', telefono: dir.telefono || '', cargo: dir.cargo || '',
        fechaNacimiento: dir.fechaNacimiento || '',
        ramaId: dir.rama ? dir.rama.id : '',
        docAntecedentes: dir.docAntecedentes, docInhabilidad: dir.docInhabilidad,
        docCurriculum: dir.docCurriculum, docCurriculumScout: dir.docCurriculumScout, docNacimiento: dir.docNacimiento
      });
    } else {
      setIsEditing(false);
      setFormData({
        id: null, nombres: '', apellidos: '', email: '', telefono: '', cargo: '', 
        fechaNacimiento: '', ramaId: '',
        docAntecedentes: false, docInhabilidad: false, docCurriculum: false, docCurriculumScout: false, docNacimiento: false
      });
    }
    setShowModal(true);
    setTimeout(() => setModalVisible(true), 10);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => setShowModal(false), 300);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
        ...formData,
        rama: formData.ramaId ? { id: formData.ramaId } : null
    };
    try {
        await authFetch('http://localhost:8080/api/dirigentes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        handleCloseModal();
        setTimeout(() => { fetchData(); alert(isEditing ? "Dirigente actualizado" : "Dirigente creado"); }, 300);
    } catch (error) { console.error(error); alert("Error al guardar"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar a este dirigente del equipo?")) {
        try { await authFetch(`http://localhost:8080/api/dirigentes/${id}`, { method: 'DELETE' }); fetchData(); } 
        catch (error) { console.error(error); }
    }
  };

  // --- FILTRADO ---
  const dirigentesFiltrados = dirigentes.filter(d => 
    d.nombres.toLowerCase().includes(debouncedFilter.toLowerCase()) || 
    d.apellidos.toLowerCase().includes(debouncedFilter.toLowerCase()) ||
    (d.rama && d.rama.nombre.toLowerCase().includes(debouncedFilter.toLowerCase()))
  );

  // --- RENDERIZADO DE CHECKLIST ---
  const DocCheck = ({ label, checked }) => (
      <div style={{display:'flex', alignItems:'center', gap:'5px', fontSize:'0.8rem', color: checked ? '#009245' : '#ccc', marginBottom:'3px'}}>
          <span>{checked ? '✅' : '⬜'}</span> {label}
      </div>
  );

  // --- ESTILOS RESPONSIVOS ---
  const containerStyle = { padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Montserrat', sans-serif" };
  const headerCardStyle = { backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '25px', border: '1px solid #eee', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: isMobile ? '15px' : '0' };
  const titleStyle = { color: '#00B4D8', margin: 0, textTransform: 'uppercase', fontSize: isMobile ? '1.5rem' : '1.8rem', textAlign: isMobile ? 'center' : 'left' };
  const controlsContainerStyle = { display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? '10px' : '0', width: isMobile ? '100%' : 'auto' };
  const searchInputStyle = { padding: '12px 15px', borderRadius: '8px', border: '1px solid #ddd', width: isMobile ? '100%' : '300px', marginRight: isMobile ? '0' : '15px', fontSize: '0.95rem', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' };
  const btnPrimaryStyle = { backgroundColor: '#00B4D8', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', boxShadow: '0 4px 10px rgba(0, 180, 216, 0.3)', width: isMobile ? '100%' : 'auto' };
  
  const gridStyle = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', opacity: tableOpacity, transition: 'opacity 0.3s' };
  const cardStyle = { backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #eee', overflow: 'hidden', transition: 'transform 0.2s', position: 'relative', display:'flex', flexDirection:'column' };
  
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(3px)', opacity: modalVisible ? 1 : 0, transition: 'opacity 0.3s ease-in-out' };
  const modalContentStyle = { backgroundColor: 'white', padding: '40px', borderRadius: '20px', width: isMobile ? '90%' : '600px', maxHeight: '90vh', overflowY: 'auto', transform: modalVisible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)', opacity: modalVisible ? 1 : 0, transition: 'all 0.3s ease-in-out' };

  return (
    <div style={containerStyle}>
      <div style={headerCardStyle}>
        <div><h1 style={titleStyle}>Equipo de Dirigentes</h1><p style={{color: '#888', margin: '5px 0 0 0', fontSize: '1rem', textAlign: isMobile ? 'center' : 'left'}}>Gestión de adultos y documentación</p></div>
        <div style={controlsContainerStyle}>
            <input type="text" placeholder="🔍 Buscar dirigente..." style={searchInputStyle} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button style={btnPrimaryStyle} onClick={() => handleOpenModal()}>+ Nuevo Dirigente</button>
        </div>
      </div>

      <div style={gridStyle}>
          {dirigentesFiltrados.map(dir => (
              <div key={dir.id} style={cardStyle} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  {/* CABECERA TARJETA */}
                  <div style={{padding: '20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee', display:'flex', alignItems:'center', gap:'15px'}}>
                      <div style={{width:'50px', height:'50px', borderRadius:'50%', backgroundColor: dir.rama ? ramaColors[dir.rama.tipo] : '#ccc', display:'flex', justifyContent:'center', alignItems:'center', fontSize:'1.5rem', color:'white', fontWeight:'bold', boxShadow:'0 2px 5px rgba(0,0,0,0.1)'}}>
                          {dir.nombres.charAt(0)}
                      </div>
                      <div>
                          <h3 style={{margin: '0', color: '#333', fontSize:'1.1rem'}}>{dir.nombres} {dir.apellidos}</h3>
                          <div style={{fontSize:'0.8rem', color:'#666'}}>{dir.cargo || 'Dirigente'} • {dir.rama ? dir.rama.nombre : 'Sin Rama'}</div>
                      </div>
                  </div>

                  <div style={{padding: '20px', flex: 1}}>
                      {/* DATOS CONTACTO */}
                      <div style={{marginBottom: '15px'}}>
                          <div style={{fontSize:'0.8rem', color:'#888'}}>📧 {dir.email || '-'}</div>
                          <div style={{fontSize:'0.8rem', color:'#888'}}>📞 {dir.telefono || '-'}</div>
                      </div>

                      {/* CHECKLIST DOCUMENTOS */}
                      <div style={{backgroundColor:'#fcfcfc', padding:'10px', borderRadius:'8px', border:'1px solid #eee'}}>
                          <div style={{fontSize:'0.75rem', fontWeight:'bold', color:'#00B4D8', marginBottom:'5px', textTransform:'uppercase'}}>Documentación</div>
                          <DocCheck label="Cert. Antecedentes" checked={dir.docAntecedentes} />
                          <DocCheck label="Cert. Inhabilidad" checked={dir.docInhabilidad} />
                          <DocCheck label="Curriculum Vitae" checked={dir.docCurriculum} />
                          <DocCheck label="Curriculum Scout" checked={dir.docCurriculumScout} />
                          <DocCheck label="Cert. Nacimiento" checked={dir.docNacimiento} />
                      </div>
                  </div>

                  {/* ACCIONES */}
                  <div style={{padding: '15px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap:'10px'}}>
                      <button onClick={() => handleOpenModal(dir)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem'}} title="Editar">✏️</button>
                      <button onClick={() => handleDelete(dir.id)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem', color:'#ED1C24'}} title="Eliminar">🗑️</button>
                  </div>
              </div>
          ))}
      </div>

      {showModal && (
        <div style={modalOverlayStyle} onClick={(e) => { if(e.target === e.currentTarget) handleCloseModal() }}>
            <div style={modalContentStyle}>
                <h2 style={{color: '#222', marginTop: 0, marginBottom: '25px', textAlign: 'center'}}>{isEditing ? 'Editar Dirigente' : 'Nuevo Dirigente'}</h2>
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                    <div style={{display: isMobile ? 'block' : 'flex', gap: '15px'}}>
                        <input name="nombres" value={formData.nombres} onChange={handleInputChange} placeholder="Nombres" style={{padding: '12px', flex:1, borderRadius: '8px', border: '1px solid #ddd', width: isMobile ? '100%' : 'auto', boxSizing: 'border-box', marginBottom: isMobile ? '15px' : '0'}} required />
                        <input name="apellidos" value={formData.apellidos} onChange={handleInputChange} placeholder="Apellidos" style={{padding: '12px', flex:1, borderRadius: '8px', border: '1px solid #ddd', width: isMobile ? '100%' : 'auto', boxSizing: 'border-box'}} required />
                    </div>

                    <div style={{display: isMobile ? 'block' : 'flex', gap: '15px'}}>
                        <input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" style={{padding: '12px', flex:1, borderRadius: '8px', border: '1px solid #ddd', width: isMobile ? '100%' : 'auto', boxSizing: 'border-box', marginBottom: isMobile ? '15px' : '0'}} />
                        <input name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="Teléfono" style={{padding: '12px', flex:1, borderRadius: '8px', border: '1px solid #ddd', width: isMobile ? '100%' : 'auto', boxSizing: 'border-box'}} />
                    </div>

                    <div style={{display: 'flex', gap: '15px'}}>
                        <input name="cargo" value={formData.cargo} onChange={handleInputChange} placeholder="Cargo (Ej: Responsable)" style={{padding: '12px', flex:1, borderRadius: '8px', border: '1px solid #ddd'}} />
                        <select name="ramaId" value={formData.ramaId} onChange={handleInputChange} style={{padding: '12px', flex:1, borderRadius: '8px', border: '1px solid #ddd'}}>
                            <option value="">-- Asignar Rama --</option>
                            {ramas.map(r => (<option key={r.id} value={r.id}>{r.nombre}</option>))}
                        </select>
                    </div>

                    <div style={{backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '10px', border: '1px solid #eee'}}>
                        <label style={{display:'block', fontSize:'0.9rem', color:'#00B4D8', fontWeight:'bold', marginBottom:'10px'}}>Control de Documentación:</label>
                        <div style={{display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px'}}>
                            <label style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer'}}><input type="checkbox" name="docAntecedentes" checked={formData.docAntecedentes} onChange={handleInputChange} /> Cert. Antecedentes</label>
                            <label style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer'}}><input type="checkbox" name="docInhabilidad" checked={formData.docInhabilidad} onChange={handleInputChange} /> Cert. Inhabilidad</label>
                            <label style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer'}}><input type="checkbox" name="docCurriculum" checked={formData.docCurriculum} onChange={handleInputChange} /> Curriculum Vitae</label>
                            <label style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer'}}><input type="checkbox" name="docCurriculumScout" checked={formData.docCurriculumScout} onChange={handleInputChange} /> Curriculum Scout</label>
                            <label style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer'}}><input type="checkbox" name="docNacimiento" checked={formData.docNacimiento} onChange={handleInputChange} /> Cert. Nacimiento</label>
                        </div>
                    </div>

                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '10px'}}>
                        <button type="button" onClick={handleCloseModal} style={{padding: '12px 25px', border: '1px solid #ccc', background: '#f8f9fa', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#555'}}>Cancelar</button>
                        <button type="submit" style={btnPrimaryStyle}>Guardar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

export default Equipo;