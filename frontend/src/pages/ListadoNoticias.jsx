import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- Importamos tu guardia de seguridad

function ListadoNoticias() {
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // <-- Revisamos si es dirigente/admin

  useEffect(() => {
    // Obtenemos las noticias públicas del Backend
    const fetchNoticias = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/noticias');
        if (response.ok) {
          const data = await response.json();
          // Invertimos el arreglo para ver las más nuevas primero
          setNoticias(data.reverse()); 
        } else {
          console.error("Error al obtener noticias");
        }
      } catch (error) {
        console.error("Error de conexión:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchNoticias();
  }, []);

  // Función para limitar los caracteres de la bajada
  const truncarTexto = (texto, maximo) => {
    if (!texto) return "";
    return texto.length > maximo ? texto.substring(0, maximo) + '...' : texto;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', position: 'relative' }}>
      
      {/* --- ESTILOS RESPONSIVE TREATMENT Y TETRIS (MASONRY) --- */}
      <style>
        {`
          .masonry-grid {
            column-count: 3;
            column-gap: 25px;
          }
          
          .tarjeta-tetris {
            break-inside: avoid;
            margin-bottom: 25px;
            background: #ffffff;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            cursor: pointer;
            border: 1px solid #f0f0f0;
          }

          .tarjeta-tetris:hover {
            transform: translateY(-8px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          }
          
          .boton-flotante {
            position: fixed;
            bottom: 40px;
            right: 40px;
            background-color: #00B4D8; /* Color principal de tu página */
            color: white;
            border: none;
            border-radius: 50%;
            width: 65px;
            height: 65px;
            font-size: 1.8rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            transition: transform 0.2s ease, background-color 0.2s ease;
          }

          .boton-flotante:hover {
            transform: scale(1.1);
            background-color: #0096B4;
          }

          /* Responsive Treatment para celulares */
          @media (max-width: 992px) {
            .masonry-grid { column-count: 2; }
          }
          @media (max-width: 600px) {
            .masonry-grid { column-count: 1; }
            .boton-flotante {
              bottom: 20px;
              right: 20px;
              width: 55px;
              height: 55px;
              font-size: 1.5rem;
            }
          }
        `}
      </style>

      {/* --- SECCIÓN DE CABECERA CON FONDO "FLOTANTE" --- */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        padding: '30px', 
        borderRadius: '15px', 
        marginBottom: '40px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)', 
        textAlign: 'center', 
      }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#2C3E50', fontSize: '2.5rem' }}>
          📰 Últimas Noticias
        </h1>
        <p style={{ margin: 0, fontSize: '1.2rem', color: '#7F8C8D' }}>
          Mantente al tanto de las novedades de nuestro grupo.
        </p>
      </div>

      {/* --- RENDERIZADO CONDICIONAL PURIFICADO --- */}
      {cargando ? (
        <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#7F8C8D', backgroundColor: 'rgba(255,255,255,0.9)', padding: '20px', borderRadius: '10px' }}>
          Cargando novedades...
        </p>
      ) : noticias.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '20px', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '30px', borderRadius: '15px' }}>
            <p style={{ fontSize: '1.2rem', color: '#7F8C8D', margin: 0 }}>Aún no hay noticias publicadas.</p>
        </div>
      ) : (
        <div className="masonry-grid">
          {noticias.map((noticia) => (
            <div key={noticia.id} className="tarjeta-tetris">
              
              {/* TÍTULO ARRIBA */}
              <div style={{ padding: '20px 20px 15px 20px', borderBottom: '1px solid #f5f5f5' }}>
                <h3 style={{ margin: 0, color: '#2C3E50', fontSize: '1.3rem', lineHeight: '1.4' }}>
                  {noticia.titulo}
                </h3>
                <span style={{ display: 'inline-block', marginTop: '10px', fontSize: '0.8rem', color: 'white', backgroundColor: '#3498DB', padding: '3px 10px', borderRadius: '15px', fontWeight: 'bold' }}>
                  {noticia.tipo}
                </span>
              </div>

              {/* IMAGEN DE PORTADA */}
              {noticia.imagenUrl && (
                <img 
                  src={noticia.imagenUrl} 
                  alt={noticia.titulo} 
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} 
                />
              )}

              {/* CONTENIDO / BAJADA LIMITADA */}
              <div style={{ padding: '20px' }}>
                <p style={{ margin: '0 0 15px 0', color: '#555', fontSize: '1rem', lineHeight: '1.6' }}>
                  {truncarTexto(noticia.bajada, 120)}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#95A5A6', fontWeight: 'bold' }}>
                    ✍️ {noticia.autor}
                  </span>
                  <button style={{ background: 'transparent', border: 'none', color: '#27AE60', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>
                    Leer más →
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* --- BOTÓN FLOTANTE SÓLO PARA ADMINISTRADORES --- */}
      {isAuthenticated && (
        <button 
          className="boton-flotante" 
          onClick={() => navigate('/crear-noticia')}
          title="Crear Nueva Noticia"
        >
          🖌️
        </button>
      )}

    </div>
  );
}

export default ListadoNoticias;