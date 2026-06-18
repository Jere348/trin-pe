import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PanelCiudadano.css';

const PanelCiudadano = () => {
  const navigate = useNavigate();
  const [vistaActual, setVistaActual] = useState('buscador'); // 'buscador', 'entidades', 'favoritos'
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [listaTramites, setListaTramites] = useState([]);
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState(null);
  const [listaEntidades, setListaEntidades] = useState([]);
  
  // ==========================================
  // NUEVO: ESTADOS PARA USUARIO Y FAVORITOS
  // ==========================================
  const [usuario, setUsuario] = useState(null);
  const [listaFavoritos, setListaFavoritos] = useState([]);

  // Cargar datos al iniciar
  useEffect(() => {
    // 1. Cargar trámites
    fetch('https://trin-pe-backend.onrender.com/api/tramites')
      .then(res => res.ok ? res.json() : [])
      .then(data => setListaTramites(data))
      .catch(err => console.error("Error trámites:", err));

    // 2. Cargar entidades
    fetch('https://trin-pe-backend.onrender.com/api/entidades')
      .then(res => res.ok ? res.json() : [])
      .then(data => setListaEntidades(data))
      .catch(err => console.error("Error entidades:", err));

    // 3. NUEVO: Verificar si hay un usuario logueado en la memoria
    const usuarioGuardado = localStorage.getItem('usuarioCiudadano');
    if (usuarioGuardado) {
      const datosUsuario = JSON.parse(usuarioGuardado);
      setUsuario(datosUsuario);
      cargarFavoritos(datosUsuario.id);
    }
  }, []);

  // ==========================================
  // NUEVO: LÓGICA DE FAVORITOS
  // ==========================================
  const cargarFavoritos = async (idUsuario) => {
    try {
      const res = await fetch(`https://trin-pe-backend.onrender.com/api/favoritos/${idUsuario}`);
      if (res.ok) {
        const data = await res.json();
        setListaFavoritos(data);
      }
    } catch (error) {
      console.error("Error al cargar favoritos", error);
    }
  };

  const toggleFavorito = async (tramite, evento) => {
    if (evento) evento.stopPropagation(); // Evita que al hacer clic en la estrella se abra el trámite

    if (!usuario) {
      alert("Debes iniciar sesión para guardar tus guías favoritas.");
      navigate('/'); // Lo mandamos al login
      return;
    }

    const esFavorito = listaFavoritos.some(f => f.id === tramite.id);

    try {
      if (esFavorito) {
        // Quitar de favoritos
        await fetch(`https://trin-pe-backend.onrender.com/api/favoritos/${usuario.id}/${tramite.id}`, { method: 'DELETE' });
      } else {
        // Agregar a favoritos
        await fetch(`https://trin-pe-backend.onrender.com/api/favoritos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario_id: usuario.id, tramite_id: tramite.id })
        });
      }
      // Recargar la lista para que la estrella se pinte o despinte sola
      cargarFavoritos(usuario.id);
    } catch (error) {
      console.error("Error al modificar favoritos", error);
    }
  };

  // Función auxiliar para saber si pintar la estrella vacía o llena
  const esTramiteFavorito = (idTramite) => {
    return listaFavoritos.some(f => f.id === idTramite);
  };

  // Función espía para métricas
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

  return (
    <div className="ciudadano-layout">
      {/* MENÚ LATERAL */}
      <aside className="ciudadano-sidebar">
        <div className="sidebar-logo"><h2>Trámite Fácil</h2></div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${vistaActual === 'buscador' ? 'active' : ''}`} 
            onClick={() => { setVistaActual('buscador'); setTramiteSeleccionado(null); }}
          >
            🔍 Buscador Principal
          </button>
          
          <button 
            className={`nav-item ${vistaActual === 'entidades' ? 'active' : ''}`} 
            onClick={() => { setVistaActual('entidades'); setTramiteSeleccionado(null); }}
          >
            🏢 Directorio de Entidades
          </button>
          
          <button 
            className={`nav-item ${vistaActual === 'favoritos' ? 'active' : ''}`} 
            onClick={() => { setVistaActual('favoritos'); setTramiteSeleccionado(null); }}
          >
            ⭐ Mis Guías Guardadas
          </button>
        </nav>
        
        {/* NUEVO: BOTÓN DE CERRAR SESIÓN SI ESTÁ LOGUEADO */}
        {usuario && (
          <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
            <button onClick={cerrarSesion} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>
              🚪 Cerrar Sesión
            </button>
          </div>
        )}
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="ciudadano-main">
        <header className="ciudadano-header">
          <h1>Portal de Atención al Ciudadano</h1>
          <div className="ciudadano-avatar" style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'none', width: 'auto' }}>
             {/* NUEVO: MOSTRAMOS EL NOMBRE SI ESTÁ LOGUEADO */}
             <span style={{ color: '#1e293b', fontWeight: '600' }}>
               {usuario ? `Hola, ${usuario.nombre.split(' ')[0]}` : 'Invitado'}
             </span>
             <div style={{ backgroundColor: '#1e3a8a', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {usuario ? usuario.nombre.charAt(0).toUpperCase() : 'C'}
             </div>
          </div>
        </header>

        <div className="ciudadano-content">
          
          {/* ========================================== */}
          {/* VISTA 1: BUSCADOR DE TRÁMITES              */}
          {/* ========================================== */}
          {vistaActual === 'buscador' && !tramiteSeleccionado && (
            <div className="buscador-section">
              <div className="search-box-container">
                <h2>¿Qué trámite necesitas realizar hoy?</h2>
                <div className="search-bar">
                  <input 
                    type="text" 
                    placeholder="Ej. Sacar pasaporte, renovar DNI, multas..." 
                    value={terminoBusqueda}
                    onChange={(e) => setTerminoBusqueda(e.target.value)}
                  />
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
                        {/* NUEVO: ESTRELLA DE FAVORITO */}
                        <button 
                          onClick={(e) => toggleFavorito(tramite, e)}
                          style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', padding: 0 }}
                          title="Guardar en favoritos"
                        >
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

          {/* ========================================== */}
          {/* VISTA 2: DIRECTORIO DE ENTIDADES           */}
          {/* ========================================== */}
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
                      <img 
                        src={ent.logo_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Flag_of_Peru_%28state%29.svg/800px-Flag_of_Peru_%28state%29.svg.png"} 
                        alt={`Logo de ${ent.sigla}`} 
                        className="entidad-card-img"
                        style={{ objectFit: 'contain', padding: '10px', backgroundColor: '#f8fafc' }}
                        onError={(e) => {
                          e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Flag_of_Peru_%28state%29.svg/800px-Flag_of_Peru_%28state%29.svg.png";
                        }}
                      />
                      <div className="entidad-card-body">
                        <h3 className="entidad-sigla">{ent.sigla}</h3>
                        <p className="entidad-nombre">{ent.nombre_completo}</p>
                        <hr className="entidad-divider" />
                        <button 
                          className="btn-ver-tramites"
                          onClick={() => {
                            setTerminoBusqueda(ent.sigla);
                            setVistaActual('buscador');
                          }}
                        >
                          Ver sus trámites ➔
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* VISTA 3: MIS FAVORITOS (NUEVO)             */}
          {/* ========================================== */}
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
                  <p>Aún no tienes trámites guardados. Navega por el buscador y haz clic en la estrella para guardarlos aquí.</p>
                </div>
              ) : (
                <div className="resultados-grid" style={{ marginTop: '20px' }}>
                  {listaFavoritos.map(tramite => (
                    <div key={tramite.id} className="tramite-card-citizen" onClick={() => setTramiteSeleccionado(tramite)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="badge-entidad">{tramite.entidad}</span>
                        <button 
                          onClick={(e) => toggleFavorito(tramite, e)}
                          style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', padding: 0 }}
                          title="Quitar de favoritos"
                        >
                          ⭐
                        </button>
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

          {/* ========================================== */}
          {/* VISTA: DETALLE DEL TRÁMITE                 */}
          {/* ========================================== */}
          {tramiteSeleccionado && (
            <div className="detalle-tramite-container">
              <button className="btn-volver" onClick={() => setTramiteSeleccionado(null)}>
                ← Volver a resultados
              </button>
              
              <div className="detalle-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge-entidad">{tramiteSeleccionado.entidad}</span>
                  {/* NUEVO: ESTRELLA EN EL DETALLE */}
                  <button 
                    onClick={() => toggleFavorito(tramiteSeleccionado)}
                    style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer' }}
                    title={esTramiteFavorito(tramiteSeleccionado.id) ? "Quitar de favoritos" : "Guardar en favoritos"}
                  >
                    {esTramiteFavorito(tramiteSeleccionado.id) ? '⭐' : '☆'}
                  </button>
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
                    {obtenerListaSegura(tramiteSeleccionado.requisitos).map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
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
                        {paso.archivoUrl && (
                          <a href={paso.archivoUrl} target="_blank" rel="noopener noreferrer" className="btn-descargar-pdf">
                            📄 Descargar Formato Oficial
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default PanelCiudadano;