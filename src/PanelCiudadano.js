import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PanelCiudadano.css';

const PanelCiudadano = () => {
  const navigate = useNavigate();
  const [vistaActual, setVistaActual] = useState('buscador'); 
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [listaTramites, setListaTramites] = useState([]);
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState(null);
  const [listaEntidades, setListaEntidades] = useState([]);
  
  const [usuario, setUsuario] = useState(null);
  const [listaFavoritos, setListaFavoritos] = useState([]);

  // ==========================================
  // NUEVO: ESTADOS PARA EL MODAL DE REPORTES
  // ==========================================
  const [mostrarModalReporte, setMostrarModalReporte] = useState(false);
  const [motivoReporte, setMotivoReporte] = useState('Información desactualizada');
  const [descripcionReporte, setDescripcionReporte] = useState('');

  // ==========================================
  // NUEVO: FUNCIÓN PARA REPORTAR ERRORES DEL SISTEMA (AUTOMÁTICO)
  // ==========================================
  const reportarErrorAutomatico = async (motivoError, detalle) => {
    try {
      await fetch('https://trin-pe-backend.onrender.com/api/alertas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'ERROR_SISTEMA',
          motivo: motivoError,
          descripcion: detalle
        })
      });
    } catch (e) { console.error("Fallo crítico al reportar error", e); }
  };

  useEffect(() => {
    // 1. Cargar trámites (CON SENSOR DE ERRORES)
    fetch('https://trin-pe-backend.onrender.com/api/tramites')
      .then(res => {
        if (!res.ok) throw new Error('Error en el servidor de base de datos');
        return res.json();
      })
      .then(data => setListaTramites(data))
      .catch(err => {
        console.error("Error trámites:", err);
        // ¡Se dispara la alerta automática al Admin!
        reportarErrorAutomatico('Fallo de conexión a la Base de Datos', err.message);
      });

    // 2. Cargar entidades
    fetch('https://trin-pe-backend.onrender.com/api/entidades')
      .then(res => res.ok ? res.json() : [])
      .then(data => setListaEntidades(data))
      .catch(err => console.error("Error entidades:", err));

    // 3. Verificar sesión
    const usuarioGuardado = localStorage.getItem('usuarioCiudadano');
    if (usuarioGuardado) {
      const datosUsuario = JSON.parse(usuarioGuardado);
      setUsuario(datosUsuario);
      cargarFavoritos(datosUsuario.id);
    }
  }, []);

  const cargarFavoritos = async (idUsuario) => {
    try {
      const res = await fetch(`https://trin-pe-backend.onrender.com/api/favoritos/${idUsuario}`);
      if (res.ok) setListaFavoritos(await res.json());
    } catch (error) { console.error("Error al cargar favoritos", error); }
  };

  const toggleFavorito = async (tramite, evento) => {
    if (evento) evento.stopPropagation();
    if (!usuario) {
      alert("Debes iniciar sesión para guardar tus guías favoritas.");
      navigate('/');
      return;
    }
    const esFavorito = listaFavoritos.some(f => f.id === tramite.id);
    try {
      if (esFavorito) {
        await fetch(`https://trin-pe-backend.onrender.com/api/favoritos/${usuario.id}/${tramite.id}`, { method: 'DELETE' });
      } else {
        await fetch(`https://trin-pe-backend.onrender.com/api/favoritos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario_id: usuario.id, tramite_id: tramite.id })
        });
      }
      cargarFavoritos(usuario.id);
    } catch (error) { console.error("Error al modificar favoritos", error); }
  };

  const esTramiteFavorito = (idTramite) => listaFavoritos.some(f => f.id === idTramite);

  const registrarBusquedaSilenciosa = async () => {
    if (terminoBusqueda.trim().length < 2) return;
    try {
      await fetch('https://trin-pe-backend.onrender.com/api/metricas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termino: terminoBusqueda })
      });
    } catch (error) { console.error("Error métrica"); }
  };

  const tramitesFiltrados = listaTramites.filter(t => 
    t.titulo.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
    t.entidad.toLowerCase().includes(terminoBusqueda.toLowerCase())
  );

  const obtenerListaSegura = (datos) => {
    if (!datos) return [];
    return typeof datos === 'string' ? JSON.parse(datos) : datos;
  };

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioCiudadano');
    setUsuario(null);
    setListaFavoritos([]);
    alert("Sesión cerrada");
  };

  // ==========================================
  // NUEVO: FUNCIÓN PARA ENVIAR REPORTE DEL CIUDADANO
  // ==========================================
  const enviarReporte = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch('https://trin-pe-backend.onrender.com/api/alertas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'REPORTE_CIUDADANO',
          tramite_id: tramiteSeleccionado.id,
          motivo: motivoReporte,
          descripcion: descripcionReporte
        })
      });
      if (respuesta.ok) {
        alert('✅ Gracias por tu reporte. Nuestro equipo lo revisará en breve.');
        setMostrarModalReporte(false);
        setDescripcionReporte('');
      }
    } catch (error) {
      alert('Error de conexión al enviar el reporte.');
    }
  };

  return (
    <div className="ciudadano-layout">
      <aside className="ciudadano-sidebar">
        <div className="sidebar-logo"><h2>Trámite Fácil</h2></div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${vistaActual === 'buscador' ? 'active' : ''}`} onClick={() => { setVistaActual('buscador'); setTramiteSeleccionado(null); }}>
            🔍 Buscador Principal
          </button>
          <button className={`nav-item ${vistaActual === 'entidades' ? 'active' : ''}`} onClick={() => { setVistaActual('entidades'); setTramiteSeleccionado(null); }}>
            🏢 Directorio de Entidades
          </button>
          <button className={`nav-item ${vistaActual === 'favoritos' ? 'active' : ''}`} onClick={() => { setVistaActual('favoritos'); setTramiteSeleccionado(null); }}>
            ⭐ Mis Guías Guardadas
          </button>
        </nav>
        {usuario && (
          <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
            <button onClick={cerrarSesion} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>🚪 Cerrar Sesión</button>
          </div>
        )}
      </aside>

      <main className="ciudadano-main">
        <header className="ciudadano-header">
          <h1>Portal de Atención al Ciudadano</h1>
          <div className="ciudadano-avatar" style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'none', width: 'auto' }}>
             <span style={{ color: '#1e293b', fontWeight: '600' }}>{usuario ? `Hola, ${usuario.nombre.split(' ')[0]}` : 'Invitado'}</span>
             <div style={{ backgroundColor: '#1e3a8a', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {usuario ? usuario.nombre.charAt(0).toUpperCase() : 'C'}
             </div>
          </div>
        </header>

        <div className="ciudadano-content">
          
          {vistaActual === 'buscador' && !tramiteSeleccionado && (
            <div className="buscador-section">
              <div className="search-box-container">
                <h2>¿Qué trámite necesitas realizar hoy?</h2>
                <div className="search-bar">
                  <input type="text" placeholder="Ej. Sacar pasaporte, renovar DNI, multas..." value={terminoBusqueda} onChange={(e) => setTerminoBusqueda(e.target.value)} />
                  <button className="btn-search" onClick={registrarBusquedaSilenciosa}>Buscar</button>
                </div>
              </div>
              <div className="resultados-grid">
                {terminoBusqueda && tramitesFiltrados.length === 0 ? (
                  <p style={{textAlign: 'center', color: '#64748b', marginTop: '20px'}}>No encontramos resultados para tu búsqueda.</p>
                ) : (
                  tramitesFiltrados.map(tramite => (
                    <div key={tramite.id} className="tramite-card-citizen" onClick={() => setTramiteSeleccionado(tramite)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="badge-entidad">{tramite.entidad}</span>
                        <button onClick={(e) => toggleFavorito(tramite, e)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', padding: 0 }} title="Guardar en favoritos">
                          {esTramiteFavorito(tramite.id) ? '⭐' : '☆'}
                        </button>
                      </div>
                      <h3>{tramite.titulo}</h3>
                      <p className="tramite-desc-short">{tramite.descripcion}</p>
                      <div className="tramite-footer">
                        <span>Costo: S/ {tramite.costo}</span>
                        <span style={{color: '#3b82f6', fontWeight: 'bold'}}>Ver guía ➔</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {vistaActual === 'entidades' && !tramiteSeleccionado && (
            <div className="entidades-section">
              <h2 style={{ color: '#1e293b', marginBottom: '5px' }}>Directorio de Instituciones</h2>
              <p style={{ color: '#64748b', marginBottom: '25px' }}>Explora todas las entidades del Estado y los trámites que administran.</p>
              <div className="entidades-grid">
                {listaEntidades.length === 0 ? (
                  <p>Cargando entidades...</p>
                ) : (
                  listaEntidades.map(ent => (
                    <div key={ent.id} className="entidad-card-visual">
                      <img src={ent.logo_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Flag_of_Peru_%28state%29.svg/800px-Flag_of_Peru_%28state%29.svg.png"} alt={`Logo de ${ent.sigla}`} className="entidad-card-img" style={{ objectFit: 'contain', padding: '10px', backgroundColor: '#f8fafc' }} onError={(e) => { e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Flag_of_Peru_%28state%29.svg/800px-Flag_of_Peru_%28state%29.svg.png"; }} />
                      <div className="entidad-card-body">
                        <h3 className="entidad-sigla">{ent.sigla}</h3>
                        <p className="entidad-nombre">{ent.nombre_completo}</p>
                        <hr className="entidad-divider" />
                        <button className="btn-ver-tramites" onClick={() => { setTerminoBusqueda(ent.sigla); setVistaActual('buscador'); }}>Ver sus trámites ➔</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {vistaActual === 'favoritos' && !tramiteSeleccionado && (
            <div className="buscador-section">
              <h2 style={{ color: '#1e293b', marginBottom: '5px' }}>Mis Guías Guardadas</h2>
              {!usuario ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '20px' }}>
                  <span style={{ fontSize: '40px' }}>🔒</span>
                  <h3 style={{ color: '#1e293b' }}>Inicia sesión para guardar trámites</h3>
                  <p style={{ color: '#64748b', marginBottom: '20px' }}>Crea tu cuenta gratis para no perder tus guías favoritas y acceder a ellas desde cualquier dispositivo.</p>
                  <button onClick={() => navigate('/')} className="btn-search">Ir a Iniciar Sesión</button>
                </div>
              ) : listaFavoritos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <span style={{ fontSize: '40px' }}>⭐</span>
                  <p>Aún no tienes trámites guardados.</p>
                </div>
              ) : (
                <div className="resultados-grid" style={{ marginTop: '20px' }}>
                  {listaFavoritos.map(tramite => (
                    <div key={tramite.id} className="tramite-card-citizen" onClick={() => setTramiteSeleccionado(tramite)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="badge-entidad">{tramite.entidad}</span>
                        <button onClick={(e) => toggleFavorito(tramite, e)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', padding: 0 }}>⭐</button>
                      </div>
                      <h3>{tramite.titulo}</h3>
                      <p className="tramite-desc-short">{tramite.descripcion}</p>
                      <div className="tramite-footer">
                        <span>Costo: S/ {tramite.costo}</span>
                        <span style={{color: '#3b82f6', fontWeight: 'bold'}}>Ver guía ➔</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tramiteSeleccionado && (
            <div className="detalle-tramite-container">
              <button className="btn-volver" onClick={() => setTramiteSeleccionado(null)}>← Volver a resultados</button>
              
              <div className="detalle-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge-entidad">{tramiteSeleccionado.entidad}</span>
                  {/* NUEVO: CONTENEDOR DE ACCIONES (ESTRELLA + REPORTE) */}
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button 
                      onClick={() => setMostrarModalReporte(true)}
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      🚩 Reportar error
                    </button>
                    <button onClick={() => toggleFavorito(tramiteSeleccionado)} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer' }} title={esTramiteFavorito(tramiteSeleccionado.id) ? "Quitar de favoritos" : "Guardar en favoritos"}>
                      {esTramiteFavorito(tramiteSeleccionado.id) ? '⭐' : '☆'}
                    </button>
                  </div>
                </div>
                <h2>{tramiteSeleccionado.titulo}</h2>
                <p className="detalle-descripcion">{tramiteSeleccionado.descripcion}</p>
                <div className="detalle-meta">
                  <div className="meta-box"><strong>Modalidad:</strong> {tramiteSeleccionado.modalidad}</div>
                  <div className="meta-box"><strong>Costo:</strong> S/ {tramiteSeleccionado.costo}</div>
                </div>
              </div>

              <div className="detalle-body">
                <div className="requisitos-section">
                  <h3>📋 Requisitos Previos</h3>
                  <ul>
                    {obtenerListaSegura(tramiteSeleccionado.requisitos).map((req, i) => <li key={i}>{req}</li>)}
                  </ul>
                </div>
                <div className="pasos-section">
                  <h3>🚶‍♂️ Guía Paso a Paso</h3>
                  {obtenerListaSegura(tramiteSeleccionado.pasos).map((paso, index) => (
                    <div key={index} className="paso-card">
                      <div className="paso-numero">{index + 1}</div>
                      <div className="paso-contenido">
                        <h4>{paso.titulo}</h4>
                        <p>{paso.instrucciones}</p>
                        {paso.archivoUrl && <a href={paso.archivoUrl} target="_blank" rel="noopener noreferrer" className="btn-descargar-pdf">📄 Descargar Formato Oficial</a>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* NUEVO: MODAL HTML PARA EL REPORTE            */}
          {/* ========================================== */}
          {mostrarModalReporte && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginTop: 0, color: '#dc2626' }}>🚩 Reportar este trámite</h3>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Ayúdanos a mejorar. Si la información de este trámite es incorrecta, dínoslo aquí.</p>
                
                <form onSubmit={enviarReporte} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Motivo principal:</label>
                    <select value={motivoReporte} onChange={(e) => setMotivoReporte(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option value="Información desactualizada">Información desactualizada</option>
                      <option value="El costo es incorrecto">El costo es incorrecto</option>
                      <option value="Faltan requisitos">Faltan requisitos importantes</option>
                      <option value="El link/PDF no funciona">El enlace o PDF no funciona</option>
                      <option value="Otro motivo">Otro motivo</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Descripción breve (Opcional):</label>
                    <textarea rows="3" value={descripcionReporte} onChange={(e) => setDescripcionReporte(e.target.value)} placeholder="Danos más detalles..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="button" onClick={() => setMostrarModalReporte(false)} style={{ flex: 1, padding: '10px', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                    <button type="submit" style={{ flex: 1, padding: '10px', border: 'none', backgroundColor: '#dc2626', color: 'white', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>Enviar Reporte</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default PanelCiudadano;