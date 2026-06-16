import React, { useState, useEffect } from 'react';
import './PanelCiudadano.css';

const PanelCiudadano = () => {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [tramites, setTramites] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // NUEVA MEMORIA: Para saber qué trámite está viendo el usuario
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState(null);

  const registrarBusquedaSilenciosa = async () => {
    if (terminoBusqueda.trim().length < 2) return; // No registramos letras sueltas

    try {
      await fetch('https://trin-pe-backend.onrender.com/api/metricas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termino: terminoBusqueda })
      });
      // No ponemos 'alert' porque esto debe ser invisible para el ciudadano
    } catch (error) {
      console.error("Error al registrar métrica");
    }
  };

  useEffect(() => {
    const obtenerTramites = async () => {
      try {
        const respuesta = await fetch('https://trin-pe-backend.onrender.com/api/tramites');
        if (respuesta.ok) {
          const data = await respuesta.json();
          setTramites(data);
        }
      } catch (error) {
        console.error("Error de conexión:", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerTramites();
  }, []);

  const tramitesFiltrados = tramites.filter((tramite) => {
    const busquedaMinuscula = terminoBusqueda.toLowerCase();
    const tituloMinuscula = tramite.titulo.toLowerCase();
    const entidadMinuscula = tramite.entidad.toLowerCase();
    return tituloMinuscula.includes(busquedaMinuscula) || entidadMinuscula.includes(busquedaMinuscula);
  });

  // Función de seguridad por si Supabase nos devuelve los datos como texto en lugar de lista
  const obtenerListaSegura = (datos) => {
    if (!datos) return [];
    return typeof datos === 'string' ? JSON.parse(datos) : datos;
  };

  return (
    <div className="panel-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>Trámite Inteligente</h2>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${!tramiteSeleccionado ? 'active' : ''}`} 
            onClick={() => setTramiteSeleccionado(null)}
          >
            🔍 Buscador de Trámites
          </button>
          <button className="nav-item">📁 Catálogo de Entidades</button>
          <button className="nav-item">⭐ Mis Guías Guardadas</button>
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout">🚪 Cerrar sesión</button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="main-content">
        <header className="top-header">
          <h1 className="header-title">Panel Ciudadano</h1>
          <div className="user-avatar">C</div>
        </header>

        <div className="content-wrapper">
          
          {/* LÓGICA DE PANTALLAS: Si hay un trámite seleccionado, mostramos la guía. Si no, el buscador */}
          {tramiteSeleccionado ? (
            
            // ==========================================
            // PANTALLA 2: DETALLE DEL TRÁMITE
            // ==========================================
            <div className="detalle-tramite">
              <button className="btn-volver-buscador" onClick={() => setTramiteSeleccionado(null)}>
                ← Volver al buscador
              </button>
              
              <div className="detalle-header">
                <span className="detalle-entidad">{tramiteSeleccionado.entidad}</span>
                <h2 className="detalle-titulo">{tramiteSeleccionado.titulo}</h2>
                <p className="detalle-descripcion">{tramiteSeleccionado.descripcion}</p>
              </div>

              <div className="detalle-info-grid">
                <div className="info-box">
                  <span className="info-label">Costo Oficial</span>
                  <span className="info-valor">S/ {tramiteSeleccionado.costo}</span>
                </div>
                <div className="info-box">
                  <span className="info-label">Modalidad</span>
                  <span className="info-valor" style={{ textTransform: 'capitalize' }}>
                    {tramiteSeleccionado.modalidad}
                  </span>
                </div>
                <div className="info-box">
                  <span className="info-label">Código</span>
                  <span className="info-valor">{tramiteSeleccionado.codigo_interno || 'N/A'}</span>
                </div>
              </div>

              <div className="detalle-seccion">
                <h3>📝 Requisitos Previos</h3>
                <ul className="requisitos-lista">
                  {obtenerListaSegura(tramiteSeleccionado.requisitos).map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="detalle-seccion">
                <h3>🛤️ Guía Paso a Paso</h3>
                <div className="pasos-timeline">
                  {obtenerListaSegura(tramiteSeleccionado.pasos).map((paso, i) => (
                    <div key={paso.id || i} className="paso-card">
                      <div className="paso-numero">{i + 1}</div>
                      <div className="paso-contenido">
                        <h4>{paso.titulo}</h4>
                        <p>{paso.instrucciones}</p>
                        {/* Si este paso tiene un archivoUrl guardado, mostramos el botón */}
                        {paso.archivoUrl && (
                          <a
                            href={paso.archivoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-descargar-pdf"
                          >
                            📄 Descargar Formato Oficial
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          ) : (

            // ==========================================
            // PANTALLA 1: EL BUSCADOR PREDICTIVO
            // ==========================================
            <>
              <div className="breadcrumbs">
                <span className="crumb">Inicio</span> 
                <span className="separator">&gt;</span> 
                <span className="crumb current">Buscador de Trámites</span>
              </div>

              <h2 className="section-title">Buscador Predictivo</h2>
              
              <div className="search-container">
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Escribe 'DNI' o intenta con otro término..." 
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)} 
                />
                <button className="btn-search" onClick={registrarBusquedaSilenciosa}>Buscar</button>
              </div>

              <div className="results-grid">
                {cargando ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Cargando trámites... ⏳</div>
                ) : tramitesFiltrados.length > 0 ? (
                  tramitesFiltrados.map((tramite) => (
                    // AQUÍ ESTÁ LA MAGIA: Al hacer clic, guardamos el trámite en la memoria
                    <div 
                      key={tramite.id} 
                      className="result-card" 
                      onClick={() => setTramiteSeleccionado(tramite)}
                    >
                      <h3 className="card-title">{tramite.titulo}</h3>
                      <span className="card-entity">{tramite.entidad}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                    No se encontraron trámites para "{terminoBusqueda}"
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
};

export default PanelCiudadano;