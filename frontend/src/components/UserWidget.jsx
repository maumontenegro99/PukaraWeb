import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authFetch } from '../helpers/AuthFetch';
import Swal from 'sweetalert2'; 

function UserWidget() {
  const { logout } = useAuth();
  
  // ESTADOS DEL WIDGET
  const [isHovered, setIsHovered] = useState(false);
  const [userData, setUserData] = useState({ nombreCompleto: '', username: '', rol: '' });
  
  // REF PARA EL TEMPORIZADOR (La clave para solucionar tu problema)
  const hoverTimeout = useRef(null);

  // ESTADOS DEL MODAL PERFIL
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({ nombreCompleto: '', password: '' });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
        const res = await authFetch('http://localhost:8080/api/usuarios/perfil');
        if (res.ok) {
            const data = await res.json();
            setUserData(data);
            setFormData({ nombreCompleto: data.nombreCompleto, password: '' });
        }
    } catch (error) {
        console.error("Error cargando perfil", error);
    }
  };

  const handleLogout = () => {
      logout();
  };

  // --- LÓGICA DE HOVER "PURIFICADA" (SOLUCIÓN AL PROBLEMA) ---
  const handleMouseEnter = () => {
      // Si había una orden de cerrar, la cancelamos porque el mouse volvió
      if (hoverTimeout.current) {
          clearTimeout(hoverTimeout.current);
      }
      setIsHovered(true);
  };

  const handleMouseLeave = () => {
      // No cerramos de inmediato. Esperamos 300ms por si el usuario solo está moviendo el mouse al menú
      hoverTimeout.current = setTimeout(() => {
          setIsHovered(false);
      }, 300);
  };

  // --- MANEJO DEL MODAL ---
  const handleOpenModal = () => {
      setFormData({ nombreCompleto: userData.nombreCompleto, password: '' }); 
      setShowProfileModal(true);
      setTimeout(() => setModalVisible(true), 10);
  };

  const handleCloseModal = () => {
      setModalVisible(false);
      setTimeout(() => setShowProfileModal(false), 300);
  };

  const handleSaveProfile = async (e) => {
      e.preventDefault();
      try {
          const res = await authFetch('http://localhost:8080/api/usuarios/perfil', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
          });
          if (res.ok) {
              const updatedUser = await res.json();
              setUserData(updatedUser);
              handleCloseModal();
              Swal.fire({ icon: 'success', title: 'Perfil Actualizado', timer: 1500, showConfirmButton: false });
          }
      } catch (error) {
          console.error(error);
          alert("Error al actualizar perfil");
      }
  };

  // --- ESTILOS ---
  const widgetContainerStyle = {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      // Importante: Quitamos pointerEvents 'none' si lo hubiera, para asegurar captura del mouse
  };

  const avatarBtnStyle = {
      width: '60px', height: '60px', borderRadius: '50%',
      backgroundColor: '#222', color: 'white',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontSize: '1.5rem', cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
      transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      transform: isHovered ? 'scale(1.1)' : 'scale(1)',
      zIndex: 2
  };

  const menuStyle = {
      position: 'absolute',
      // ACERCAMOS UN POCO EL MENÚ (Antes 70px, ahora 65px) para reducir la brecha visual
      bottom: '65px', 
      right: '0',
      backgroundColor: 'white',
      padding: '15px',
      borderRadius: '15px',
      boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
      width: '200px',
      transformOrigin: 'bottom right',
      // Animación suave de entrada/salida
      transform: isHovered ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)',
      opacity: isHovered ? 1 : 0,
      // Esto permite hacer clic aunque se esté desvaneciendo (opcional, pero útil)
      pointerEvents: isHovered ? 'auto' : 'none', 
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  };

  const menuItemStyle = {
      display: 'block', padding: '10px', color: '#444', textDecoration: 'none',
      cursor: 'pointer', borderRadius: '8px', transition: 'background 0.2s',
      fontWeight: '500', marginBottom: '5px'
  };

  const logoutBtnStyle = { ...menuItemStyle, color: '#ED1C24', borderTop: '1px solid #eee', marginTop: '5px', paddingTop: '10px' };

  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(3px)', opacity: modalVisible ? 1 : 0, transition: 'opacity 0.3s' };
  const modalContentStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: '400px', boxShadow: '0 15px 35px rgba(0,0,0,0.3)', transform: modalVisible ? 'translateY(0)' : 'translateY(20px)', opacity: modalVisible ? 1 : 0, transition: 'all 0.3s' };

  return (
    <>
      <div 
        style={widgetContainerStyle}
        // APLICAMOS LA NUEVA LÓGICA DE EVENTOS AQUÍ
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
          {/* MENU DESPLEGABLE */}
          <div style={menuStyle}>
              <div style={{fontSize:'0.9rem', fontWeight:'bold', marginBottom:'5px', color: '#00B4D8'}}>
                  Hola, {userData.nombreCompleto || userData.username}
              </div>
              <div style={{fontSize:'0.7rem', color:'#888', marginBottom:'15px', textTransform:'uppercase', letterSpacing:'1px'}}>
                  {userData.rol}
              </div>
              
              <div 
                style={menuItemStyle} 
                onClick={handleOpenModal}
                onMouseEnter={(e) => e.target.style.background = '#f0f8ff'}
                onMouseLeave={(e) => e.target.style.background = 'white'}
              >
                  👤 Ver mi Perfil
              </div>
              
              <div 
                style={logoutBtnStyle} 
                onClick={handleLogout}
                onMouseEnter={(e) => e.target.style.background = '#ffe6e6'}
                onMouseLeave={(e) => e.target.style.background = 'white'}
              >
                  🚪 Cerrar Sesión
              </div>
          </div>

          {/* BOTÓN FLOTANTE */}
          <div style={avatarBtnStyle}>
              {userData.nombreCompleto ? userData.nombreCompleto.charAt(0) : 'U'}
          </div>
      </div>

      {/* MODAL DE PERFIL */}
      {showProfileModal && (
          <div style={modalOverlayStyle} onClick={(e) => { if(e.target === e.currentTarget) handleCloseModal() }}>
              <div style={modalContentStyle}>
                  <h2 style={{marginTop:0, color:'#222'}}>Mi Perfil</h2>
                  <form onSubmit={handleSaveProfile}>
                      <div style={{marginBottom:'15px'}}>
                          <label style={{display:'block', fontSize:'0.8rem', color:'#666'}}>Nombre Completo</label>
                          <input 
                            type="text" 
                            value={formData.nombreCompleto}
                            onChange={(e) => setFormData({...formData, nombreCompleto: e.target.value})}
                            style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #ddd', marginTop:'5px'}} 
                          />
                      </div>
                      <div style={{marginBottom:'20px'}}>
                          <label style={{display:'block', fontSize:'0.8rem', color:'#666'}}>Nueva Contraseña (Opcional)</label>
                          <input 
                            type="password" 
                            placeholder="Dejar vacío para no cambiar"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #ddd', marginTop:'5px'}} 
                          />
                      </div>
                      <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                          <button type="button" onClick={handleCloseModal} style={{padding:'10px 20px', border:'none', background:'#eee', borderRadius:'8px', cursor:'pointer'}}>Cancelar</button>
                          <button type="submit" style={{padding:'10px 20px', border:'none', background:'#00B4D8', color:'white', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>Guardar Cambios</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </>
  );
}

export default UserWidget;