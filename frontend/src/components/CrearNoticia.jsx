import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { authFetch } from '../helpers/authFetch';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

// IMPORTAMOS EL VISUALIZADOR DE REDES SOCIALES
import SocialEmbed from './SocialEmbed'; 

function CrearNoticia() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // --- ESTADOS ---
  const [titulo, setTitulo] = useState('');
  const [bajada, setBajada] = useState('');
  const [contenido, setContenido] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [enlaceSocial, setEnlaceSocial] = useState(''); // Estado para el link social
  const [autor, setAutor] = useState('');
  const [tipo, setTipo] = useState('INSTITUCIONAL');
  const [cargandoImagen, setCargandoImagen] = useState(false);

  // Configuración Barra Herramientas Editor
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'clean']
    ],
  };

  // --- LÓGICA DE IMAGEN ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB límite
         Swal.fire('Archivo muy grande', 'Máximo 2MB por favor', 'warning');
         return;
      }
      setCargandoImagen(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenUrl(reader.result);
        setCargandoImagen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
      setImagenUrl('');
      if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const esImagenSubida = imagenUrl.startsWith('data:');

  // --- ENVIAR AL BACKEND ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!contenido || contenido === '<p><br></p>') {
        Swal.fire('Atención', 'Falta el contenido detallado', 'warning');
        return;
    }
    if (!imagenUrl) {
        Swal.fire('Atención', 'Falta la imagen de portada', 'warning');
        return;
    }

    const nuevaNoticia = { 
        titulo, 
        bajada, 
        contenido, 
        imagenUrl, 
        autor, 
        tipo,
        enlaceSocial // Enviamos también el link social
    };

    try {
        const response = await authFetch('http://localhost:8080/api/noticias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaNoticia)
        });

        if (response.ok) {
            Swal.fire('¡Éxito!', 'Noticia publicada correctamente', 'success');
            navigate('/'); 
        } else {
            Swal.fire('Error', 'No se pudo publicar', 'error');
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Fallo de conexión con el servidor', 'error');
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '30px auto', background: 'white', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#2C3E50', marginBottom: '25px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        📢 Publicar Nueva Noticia
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* 1. TÍTULO */}
        <div>
            <label style={{fontWeight: 'bold', display:'block', marginBottom:'8px', color:'#34495E'}}>Título</label>
            <input 
              type="text" value={titulo} onChange={e => setTitulo(e.target.value)} required
              placeholder="Título llamativo..."
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #BDC3C7', fontSize: '1.1rem' }}
            />
        </div>

        {/* 2. BAJADA */}
        <div>
            <label style={{fontWeight: 'bold', display:'block', marginBottom:'8px', color:'#34495E'}}>Resumen Corto</label>
            <textarea 
              value={bajada} onChange={e => setBajada(e.target.value)} required maxLength="300"
              placeholder="Lo que se verá en la tarjeta antes de hacer clic..."
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #BDC3C7', height: '80px', resize:'none', fontFamily:'inherit' }}
            />
        </div>

        {/* 3. CATEGORÍA Y AUTOR */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{fontWeight: 'bold', display:'block', marginBottom:'8px', color:'#34495E'}}>Categoría</label>
                <select value={tipo} onChange={e => setTipo(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #BDC3C7', background:'white' }}>
                    <option value="INSTITUCIONAL">Institucional</option>
                    <option value="RAMA">Rama (Unidad)</option>
                    <option value="EVENTO">Evento</option>
                    <option value="AVISO">Aviso Urgente</option>
                    <option value="HISTORIA">Historia / Mística</option>
                </select>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{fontWeight: 'bold', display:'block', marginBottom:'8px', color:'#34495E'}}>Autor</label>
                <input 
                  type="text" value={autor} onChange={e => setAutor(e.target.value)} required
                  placeholder="Ej: Akela"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #BDC3C7' }}
                />
            </div>
        </div>

        {/* 4. IMAGEN DE PORTADA */}
        <div style={{ background: '#F8F9F9', padding: '15px', borderRadius: '10px', border: '1px dashed #BDC3C7' }}>
            <label style={{fontWeight: 'bold', display:'block', marginBottom:'10px', color:'#34495E'}}>Imagen de Portada</label>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleImageUpload} 
                />

                {!esImagenSubida && (
                    <>
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current.click()}
                            style={{ 
                                padding: '10px 20px', backgroundColor: '#3498DB', color: 'white', border: 'none', 
                                borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                            }}
                        >
                            📁 Subir Foto
                        </button>
                        <span style={{color: '#7F8C8D'}}>o pega un link:</span>
                        <input 
                            type="text" value={imagenUrl} onChange={e => setImagenUrl(e.target.value)}
                            placeholder="https://..."
                            style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #BDC3C7' }}
                        />
                    </>
                )}

                {esImagenSubida && (
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%'}}>
                        <span style={{color: '#27AE60', fontWeight: 'bold'}}>✅ Imagen cargada desde PC</span>
                        <button 
                            type="button" 
                            onClick={handleRemoveImage}
                            style={{ 
                                padding: '8px 15px', backgroundColor: '#E74C3C', color: 'white', border: 'none', 
                                borderRadius: '5px', cursor: 'pointer', marginLeft: 'auto'
                            }}
                        >
                            🗑️ Borrar
                        </button>
                    </div>
                )}
            </div>
            
            {cargandoImagen && <p style={{color: '#E67E22', textAlign:'center'}}>Procesando...</p>}
            {imagenUrl && (
                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                    <img 
                        src={imagenUrl} 
                        alt="Portada" 
                        style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} 
                    />
                </div>
            )}
        </div>

        {/* 5. REDES SOCIALES (CON VISTA PREVIA) */}
        <div style={{ background: '#FDF2E9', padding: '15px', borderRadius: '10px', border: '1px solid #FAE5D3' }}>
            <label style={{fontWeight: 'bold', display:'block', marginBottom:'8px', color:'#D35400'}}>
                🔗 Redes Sociales (Opcional)
            </label>
            <input 
              type="text" 
              value={enlaceSocial} 
              onChange={e => setEnlaceSocial(e.target.value)}
              placeholder="Pega aquí el link de Instagram, YouTube, X, TikTok..."
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #F5CBA7' }}
            />
            
            {/* AQUÍ ESTÁ LA VISTA PREVIA EN VIVO */}
            {enlaceSocial && (
                <div style={{ marginTop: '15px' }}>
                    <p style={{textAlign: 'center', fontSize: '0.9rem', color: '#7F8C8D', marginBottom: '10px'}}>👇 Así se verá la tarjeta:</p>
                    <div style={{ pointerEvents: 'none', opacity: 0.9 }}> {/* Bloqueamos clics para que no te salgas del form */}
                        <SocialEmbed url={enlaceSocial} />
                    </div>
                </div>
            )}
        </div>

        {/* 6. EDITOR DE TEXTO */}
        <div>
            <label style={{fontWeight: 'bold', display:'block', marginBottom:'10px', color:'#E74C3C'}}>Contenido Detallado</label>
            <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                <ReactQuill 
                  theme="snow" 
                  value={contenido} 
                  onChange={setContenido} 
                  modules={modules}
                  style={{ height: '300px', marginBottom: '50px' }} 
                />
            </div>
        </div>

        {/* BOTÓN PUBLICAR */}
        <button 
          type="submit"
          style={{ 
            marginTop: '20px', padding: '15px', backgroundColor: '#27AE60', color: 'white', 
            border: 'none', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
            transition: 'transform 0.2s', boxShadow: '0 4px 10px rgba(39, 174, 96, 0.3)'
          }}
        >
          🚀 Publicar Noticia
        </button>

      </form>
    </div>
  );
}

export default CrearNoticia;