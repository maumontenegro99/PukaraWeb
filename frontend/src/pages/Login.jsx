import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import miFondoLocal from '../assets/fondo-scout.jpg'; 
import insignia from '../assets/insignia.png'; 

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos
    
    const result = await login(username, password);
    
    if (result.success) {
        // Redirigir al Home con suavidad
        navigate('/');
    } else {
        setError(result.message);
    }
  };

  // --- ESTILOS PURIFICADOS ---
  const pageBackgroundStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1,
    backgroundImage: `url(${miFondoLocal})`,
    backgroundSize: 'cover', backgroundPosition: 'center',
    filter: 'blur(3px) brightness(0.7)', transform: 'scale(1.1)'
  };

  const containerStyle = {
    height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
    fontFamily: "'Montserrat', sans-serif"
  };

  const cardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '40px 50px',
    borderRadius: '20px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '400px',
    animation: 'fadeInUp 0.5s ease-out' // Animación de entrada
  };

  const inputStyle = {
    width: '100%', padding: '12px 15px', margin: '10px 0',
    borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box',
    fontSize: '1rem', outline: 'none', transition: 'border 0.3s'
  };

  const buttonStyle = {
    width: '100%', padding: '12px', marginTop: '20px',
    backgroundColor: '#00B4D8', color: 'white', border: 'none',
    borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold',
    cursor: 'pointer', transition: 'transform 0.1s, background 0.2s'
  };

  return (
    <>
      <div style={pageBackgroundStyle}></div>
      <div style={containerStyle}>
        
        <div style={cardStyle}>
            <img src={insignia} alt="Logo" style={{width: '80px', marginBottom: '20px'}} />
            <h2 style={{color: '#222', margin: '0 0 5px 0'}}>PUKARA WECHE</h2>
            <p style={{color: '#666', fontSize:'0.9rem', marginBottom: '30px'}}>Plataforma de Gestión</p>

            <form onSubmit={handleLogin}>
                <div style={{textAlign:'left'}}>
                    <label style={{fontSize:'0.8rem', fontWeight:'bold', color:'#555'}}>Usuario / RUT</label>
                    <input 
                        type="text" 
                        placeholder="Ej: admin"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={inputStyle}
                        required
                    />
                </div>

                <div style={{textAlign:'left', marginTop:'15px'}}>
                    <label style={{fontSize:'0.8rem', fontWeight:'bold', color:'#555'}}>Contraseña</label>
                    <input 
                        type="password" 
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                        required
                    />
                </div>

                {error && (
                    <div style={{color: 'red', fontSize:'0.85rem', marginTop:'15px', backgroundColor:'#ffe6e6', padding:'8px', borderRadius:'5px'}}>
                        ⚠️ {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    style={buttonStyle}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0096B4'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00B4D8'}
                >
                    INGRESAR
                </button>
            </form>
        </div>

      </div>
      {/* Definición de la animación CSS en línea para no crear archivo CSS aparte */}
      <style>{`
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

export default Login;