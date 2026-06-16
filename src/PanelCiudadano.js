import React, { useState, useEffect } from 'react';
import './PanelCiudadano.css';

const PanelCiudadano = () => {
  const [vistaActual, setVistaActual] = useState('buscador'); // 'buscador', 'entidades', 'favoritos'
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [listaTramites, setListaTramites] = useState([]);
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState(null);
  
  // NUEVO: Estado para guardar las entidades
  const [listaEntidades, setListaEntidades] = useState([]);

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
  }, []);

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
          
          {/* NUEVO BOTÓN: DIRECTORIO DE ENTIDADES */}
          <button 
            className={`nav-item ${vistaActual === 'entidades' ? 'active' : ''}`} 
            onClick={() => { setVistaActual('entidades'); setTramiteSeleccionado(null); }}
          >
            🏢 Directorio de Entidades
          </button>
          
          <button 
            className={`nav-item ${vistaActual === 'favoritos' ? 'active' : ''}`} 
            onClick={() => setVistaActual('favoritos')}
          >
            ⭐ Mis Guías Guardadas
          </button>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="ciudadano-main">
        <header className="ciudadano-header">
          <h1>Portal de Atención al Ciudadano</h1>
          <div className="ciudadano-avatar">C</div>
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
                      <span className="badge-entidad">{tramite.entidad}</span>
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
          {/* VISTA 2: DIRECTORIO DE ENTIDADES (NUEVO)   */}
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
                            setTerminoBusqueda(ent.sigla); // Filtra el buscador por esta sigla
                            setVistaActual('buscador'); // Lo lleva al buscador
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
          {/* VISTA: DETALLE DEL TRÁMITE                 */}
          {/* ========================================== */}
          {tramiteSeleccionado && (
            <div className="detalle-tramite-container">
              <button className="btn-volver" onClick={() => setTramiteSeleccionado(null)}>
                ← Volver a resultados
              </button>
              
              <div className="detalle-header">
                <span className="badge-entidad">{tramiteSeleccionado.entidad}</span>
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