import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import './PanelAdmin.css';

const PanelAdmin = () => {
  const navigate = useNavigate();
  const [pestañaActiva, setPestañaActiva] = useState('catalogo');
  
  const [vistaCatalogo, setVistaCatalogo] = useState('lista'); 
  const [listaTramites, setListaTramites] = useState([]);
  const [editandoId, setEditandoId] = useState(null); 
  const [busquedaAdmin, setBusquedaAdmin] = useState('');
  const [topBusquedas, setTopBusquedas] = useState([]);

  // ==========================================
  // NUEVO: ESTADOS PARA LAS ENTIDADES
  // ==========================================
  const [listaEntidades, setListaEntidades] = useState([]);
  const [nuevaSigla, setNuevaSigla] = useState('');
  const [nuevoNombreEntidad, setNuevoNombreEntidad] = useState('');
  const [nuevoLogoUrl, setNuevoLogoUrl] = useState('');

  // ==========================================
  // ESTADOS DEL FORMULARIO DE TRÁMITES
  // ==========================================
  const [titulo, setTitulo] = useState('');
  const [codigoInterno, setCodigoInterno] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [entidad, setEntidad] = useState('');
  const [modalidad, setModalidad] = useState('virtual');
  const [costo, setCosto] = useState('');
  const [requisitos, setRequisitos] = useState('');
  const [pasos, setPasos] = useState([{ id: Date.now(), titulo: '', instrucciones: '', archivoUrl: '', subiendo: false }]);

  // ==========================================
  // CARGA DE DATOS INICIALES (AL ABRIR EL PANEL)
  // ==========================================
  const cargarTramitesAdmin = async () => {
    try {
      const respuesta = await fetch('https://trin-pe-backend.onrender.com/api/tramites');
      if (respuesta.ok) setListaTramites(await respuesta.json());
    } catch (error) { console.error("Error al cargar lista:", error); }
  };

  const cargarMetricas = async () => {
    try {
      const respuesta = await fetch('https://trin-pe-backend.onrender.com/api/metricas/top');
      if (respuesta.ok) setTopBusquedas(await respuesta.json());
    } catch (error) { console.error("Error al cargar métricas", error); }
  };

  const cargarEntidades = async () => {
    try {
      const respuesta = await fetch('https://trin-pe-backend.onrender.com/api/entidades');
      if (respuesta.ok) setListaEntidades(await respuesta.json());
    } catch (error) { console.error("Error al cargar entidades", error); }
  };

  useEffect(() => {
    cargarTramitesAdmin();
    cargarMetricas();
    cargarEntidades(); // Cargamos las entidades al inicio
  }, []);

  const obtenerListaSegura = (datos) => {
    if (!datos) return [];
    return typeof datos === 'string' ? JSON.parse(datos) : datos;
  };

  const tramitesFiltrados = listaTramites.filter((tramite) => {
    const busquedaMinuscula = busquedaAdmin.toLowerCase();
    return tramite.titulo.toLowerCase().includes(busquedaMinuscula) || tramite.entidad.toLowerCase().includes(busquedaMinuscula);
  });

  // ==========================================
  // LÓGICA DE ENTIDADES (CRUD)
  // ==========================================
  const guardarEntidad = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch('https://trin-pe-backend.onrender.com/api/entidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sigla: nuevaSigla,
          nombre_completo: nuevoNombreEntidad,
          logo_url: nuevoLogoUrl
        })
      });
      if (respuesta.ok) {
        alert('🏢 Entidad agregada con éxito');
        setNuevaSigla('');
        setNuevoNombreEntidad('');
        setNuevoLogoUrl('');
        cargarEntidades(); // Refrescamos la lista
      }
    } catch (error) {
      alert('Error de conexión al guardar entidad');
    }
  };

  const eliminarEntidad = async (id) => {
    const confirmar = window.confirm('⚠️ ¿Seguro que deseas eliminar esta entidad? No afectará a los trámites que ya la usan, pero ya no aparecerá en la lista para nuevos trámites.');
    if (!confirmar) return;

    try {
      const respuesta = await fetch(`https://trin-pe-backend.onrender.com/api/entidades/${id}`, {
        method: 'DELETE'
      });
      if (respuesta.ok) {
        cargarEntidades(); // Refrescamos la lista
      }
    } catch (error) {
      alert('Error al eliminar entidad');
    }
  };

  // ==========================================
  // FUNCIONES DE EDICIÓN Y ELIMINACIÓN DE TRÁMITES
  // ==========================================
  const limpiarFormulario = () => {
    setEditandoId(null);
    setTitulo(''); setCodigoInterno(''); setDescripcion(''); setEntidad(''); 
    setCosto(''); setRequisitos(''); 
    setPasos([{ id: Date.now(), titulo: '', instrucciones: '', archivoUrl: '', subiendo: false }]);
  };

  const abrirParaCrear = () => {
    limpiarFormulario();
    setVistaCatalogo('formulario');
  };

  const abrirParaEditar = (tramite) => {
    setEditandoId(tramite.id);
    setTitulo(tramite.titulo);
    setCodigoInterno(tramite.codigo_interno || '');
    setDescripcion(tramite.descripcion);
    setEntidad(tramite.entidad);
    setModalidad(tramite.modalidad);
    setCosto(tramite.costo);
    
    const listaReq = obtenerListaSegura(tramite.requisitos);
    setRequisitos(listaReq.join('\n'));
    
    const listaPasos = obtenerListaSegura(tramite.pasos);
    setPasos(listaPasos.length > 0 ? listaPasos : [{ id: Date.now(), titulo: '', instrucciones: '', archivoUrl: '', subiendo: false }]);
    
    setVistaCatalogo('formulario');
  };

  const eliminarTramite = async (id) => {
    const confirmar = window.confirm('⚠️ ¿Estás seguro de que deseas eliminar este trámite de forma permanente?');
    if (!confirmar) return;

    try {
      const respuesta = await fetch(`https://trin-pe-backend.onrender.com/api/tramites/${id}`, { method: 'DELETE' });
      if (respuesta.ok) {
        alert('🗑️ Trámite eliminado correctamente');
        cargarTramitesAdmin(); 
      }
    } catch (error) {
      alert('Error al eliminar el trámite');
    }
  };

  // ==========================================
  // LÓGICA DE PASOS Y SUBIDA DE ARCHIVOS
  // ==========================================
  const agregarPaso = () => setPasos([...pasos, { id: Date.now(), titulo: '', instrucciones: '', archivoUrl: '', subiendo: false }]);
  const eliminarPaso = (id) => { if (pasos.length > 1) setPasos(pasos.filter((paso) => paso.id !== id)); };
  
  const actualizarPaso = (id, campo, valorNuevo) => {
    setPasos((pasosPrevios) => pasosPrevios.map((paso) => paso.id === id ? { ...paso, [campo]: valorNuevo } : paso));
  };

  const subirPDF = async (evento, idDelPaso) => {
    const archivo = evento.target.files[0];
    if (!archivo) return;

    actualizarPaso(idDelPaso, 'subiendo', true);
    const nombreUnico = `${Date.now()}-${archivo.name}`;

    try {
      const { error } = await supabase.storage.from('formatos-tramites').upload(nombreUnico, archivo);
      if (error) throw error;
      const { data: publicURLData } = supabase.storage.from('formatos-tramites').getPublicUrl(nombreUnico);
      
      actualizarPaso(idDelPaso, 'archivoUrl', publicURLData.publicUrl);
      alert('✅ Archivo subido con éxito a la nube');
    } catch (error) {
      alert(`❌ Error real de Supabase: ${error.message}`);
    } finally {
      actualizarPaso(idDelPaso, 'subiendo', false);
    }
  };

  const guardarTramite = async (e) => {
    e.preventDefault();
    const arrayRequisitos = requisitos.split('\n').filter(req => req.trim() !== '');
    const paqueteDeDatos = {
      titulo, codigo_interno: codigoInterno, descripcion, entidad, modalidad,
      costo: parseFloat(costo) || 0, requisitos: arrayRequisitos, pasos 
    };

    const url = editandoId ? `https://trin-pe-backend.onrender.com/api/tramites/${editandoId}` : 'https://trin-pe-backend.onrender.com/api/tramites';
    const metodo = editandoId ? 'PUT' : 'POST';

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paqueteDeDatos)
      });
      if (respuesta.ok) {
        alert(editandoId ? '✏️ ¡Trámite actualizado!' : '✅ ¡Guía publicada con éxito!');
        cargarTramitesAdmin(); 
        setVistaCatalogo('lista'); 
      } else {
        const errorData = await respuesta.json();
        alert('❌ Error al guardar: ' + errorData.error);
      }
    } catch (error) { alert('⚠️ Error de conexión.'); }
  };

  const exportarCSV = () => {
    if (listaTramites.length === 0) {
      alert("No hay trámites en el catálogo para exportar.");
      return;
    }
    const cabeceras = ["ID", "Código", "Título", "Entidad", "Modalidad", "Costo (S/)"];
    const filas = listaTramites.map(t => [
      t.id, t.codigo_interno || 'N/A', `"${t.titulo}"`, `"${t.entidad}"`, t.modalidad, t.costo
    ]);
    const contenidoCSV = [cabeceras.join(","), ...filas.map(f => f.join(","))].join("\n");
    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.setAttribute("href", url);
    enlace.setAttribute("download", `Reporte_Tramites_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-logo"><h2>Trámite Inteligente</h2></div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${pestañaActiva === 'metricas' ? 'active' : ''}`} onClick={() => setPestañaActiva('metricas')}>📊 Dashboard de Métricas</button>
          <button className={`nav-item ${pestañaActiva === 'catalogo' ? 'active' : ''}`} onClick={() => setPestañaActiva('catalogo')}>📝 Gestión de Catálogo</button>
          {/* NUEVO BOTÓN PARA ENTIDADES */}
          <button className={`nav-item ${pestañaActiva === 'entidades' ? 'active' : ''}`} onClick={() => setPestañaActiva('entidades')}>🏢 Gestión de Entidades</button>
          <button className={`nav-item ${pestañaActiva === 'alertas' ? 'active' : ''}`} onClick={() => setPestañaActiva('alertas')}>🔔 Alertas del Sistema</button>
        </nav>
        <div className="sidebar-footer"><button className="btn-logout" onClick={() => navigate('/')}>🚪 Salir</button></div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1 className="header-title">Panel de Gestión Interna</h1>
          <div className="admin-avatar">A</div>
        </header>

        <div className="admin-content">
          {/* ========================================== */}
          {/* PESTAÑA 1: DASHBOARD DE MÉTRICAS           */}
          {/* ========================================== */}
          {pestañaActiva === 'metricas' && (
            <div className="admin-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="section-title" style={{ color: '#1e3a8a', margin: 0 }}>Métricas de Búsqueda</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select className="admin-dropdown-filter">
                    <option>Filtro: Último Mes</option>
                    <option>Filtro: Últimos 7 Días</option>
                    <option>Filtro: Todo el tiempo</option>
                  </select>
                  <button className="btn-edit" onClick={cargarMetricas}>🔄</button>
                </div>
              </div>

              <div className="metrics-cards-container">
                <div className="metric-card">
                  <div className="metric-value">
                    {topBusquedas.reduce((suma, item) => suma + Number(item.cantidad), 0).toLocaleString()}
                  </div>
                  <div className="metric-label">Búsquedas Totales (Top)</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">
                    {topBusquedas.length > 0 ? topBusquedas[0].termino.toUpperCase() : '---'}
                  </div>
                  <div className="metric-label">Trámite más consultado</div>
                </div>
              </div>

              <div className="admin-card" style={{ marginTop: '20px' }}>
                <h3 style={{ marginTop: 0 }}>🏆 Top 10: Términos detallados</h3>
                {topBusquedas.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Aún no hay datos suficientes de búsqueda.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                    {topBusquedas.map((item, index) => {
                      const maxCantidad = topBusquedas[0].cantidad;
                      const porcentaje = (item.cantidad / maxCantidad) * 100;
                      return (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <span style={{ width: '25px', fontWeight: 'bold', color: '#64748b' }}>#{index + 1}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                              <span style={{ fontWeight: '600', textTransform: 'capitalize', color: '#1e293b' }}>"{item.termino}"</span>
                              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>{item.cantidad}</span>
                            </div>
                            <div style={{ width: '100%', backgroundColor: '#f1f5f9', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                              <div style={{ width: `${porcentaje}%`, backgroundColor: '#1e3a8a', height: '100%', borderRadius: '4px', transition: 'width 1s ease-out' }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <hr className="form-divider" style={{ margin: '30px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><h2 className="section-title" style={{ color: '#1e3a8a', margin: 0 }}>Exportar Catálogo</h2></div>
                <select className="admin-dropdown-filter">
                  <option>DB Estándar</option>
                  <option>DB Respaldos</option>
                </select>
              </div>
              <div style={{ marginTop: '15px' }}>
                <button className="btn-export-green" onClick={exportarCSV}>⬇️ Exportar Reporte a CSV</button>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* PESTAÑA 2: GESTIÓN DE CATÁLOGO             */}
          {/* ========================================== */}
          {pestañaActiva === 'catalogo' && (
            <div className="admin-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="section-title">Gestión de Catálogo</h2>
                {vistaCatalogo === 'lista' && (
                  <button className="btn-primary-admin" onClick={abrirParaCrear}>+ Crear Nuevo Trámite</button>
                )}
              </div>

              {vistaCatalogo === 'lista' ? (
                <>
                  <div className="admin-search-container">
                    <input 
                      type="text" className="admin-search-input" placeholder="🔍 Buscar trámite por título o entidad..." 
                      value={busquedaAdmin} onChange={(e) => setBusquedaAdmin(e.target.value)}
                    />
                  </div>
                  <div className="tramites-list-grid">
                    {tramitesFiltrados.length === 0 ? (
                      <p style={{color: '#64748b', textAlign: 'center', padding: '20px'}}>No se encontraron trámites.</p>
                    ) : (
                      tramitesFiltrados.map((tramite) => (
                        <div key={tramite.id} className="admin-tramite-card">
                          <div>
                            <span className="card-entity">{tramite.entidad}</span>
                            <h4 style={{margin: '10px 0', fontSize: '18px', color: '#1e293b'}}>{tramite.titulo}</h4>
                            <span style={{fontSize: '13px', color: '#64748b', fontWeight: 'bold'}}>ID: {tramite.id} | Costo: S/ {tramite.costo}</span>
                          </div>
                          <div className="card-actions">
                            <button className="btn-edit" onClick={() => abrirParaEditar(tramite)}>✏️ Editar</button>
                            <button className="btn-delete" onClick={() => eliminarTramite(tramite.id)}>🗑️</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
              <div className="admin-card form-card">
                <button type="button" style={{background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '15px', fontWeight: 'bold'}} onClick={() => setVistaCatalogo('lista')}>
                  ← Volver a la lista
                </button>
                <h3>{editandoId ? '✏️ Editando Guía de Trámite' : '✨ Crear Nueva Guía de Trámite'}</h3>
                
                <form className="admin-form" onSubmit={guardarTramite}>
                  <h4 className="form-subtitle">1. Datos Generales</h4>
                  <div className="input-row">
                    <div className="input-group" style={{ flex: 2 }}>
                      <label>Título</label>
                      <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label>Código Interno</label>
                      <input type="text" value={codigoInterno} onChange={(e) => setCodigoInterno(e.target.value)} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Descripción</label>
                    <textarea rows="3" required className="admin-textarea" value={descripcion} onChange={(e) => setDescripcion(e.target.value)}></textarea>
                  </div>
                  <div className="input-row">
                    <div className="input-group">
                      <label>Entidad Responsable</label>
                      {/* MAGIA: EL SELECT AHORA LEE DE LA BASE DE DATOS */}
                      <select required value={entidad} onChange={(e) => setEntidad(e.target.value)}>
                        <option value="">Selecciona una entidad...</option>
                        {listaEntidades.map((ent) => (
                          <option key={ent.id} value={ent.sigla}>{ent.sigla} - {ent.nombre_completo}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Modalidad</label>
                      <select value={modalidad} onChange={(e) => setModalidad(e.target.value)}>
                        <option value="virtual">💻 Virtual</option>
                        <option value="presencial">🏢 Presencial</option>
                        <option value="mixto">🔄 Mixto</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Costo Oficial (S/)</label>
                      <input type="number" step="0.10" value={costo} onChange={(e) => setCosto(e.target.value)} />
                    </div>
                  </div>

                  <hr className="form-divider" />
                  <h4 className="form-subtitle">2. Requisitos Previos</h4>
                  <div className="input-group">
                    <textarea rows="4" placeholder="Escribe un requisito por línea" className="admin-textarea" value={requisitos} onChange={(e) => setRequisitos(e.target.value)}></textarea>
                  </div>

                  <hr className="form-divider" />
                  <h4 className="form-subtitle">3. Guía Paso a Paso</h4>
                  {pasos.map((paso, index) => (
                    <div key={paso.id} className="step-builder-card">
                      <div className="step-header">
                        <span className="step-badge">Paso {index + 1}</span>
                        {pasos.length > 1 && <button type="button" className="btn-remove-step" onClick={() => eliminarPaso(paso.id)}>🗑️ Eliminar paso</button>}
                      </div>
                      <div className="input-group">
                        <label>Título del Paso</label>
                        <input type="text" required value={paso.titulo} onChange={(e) => actualizarPaso(paso.id, 'titulo', e.target.value)} />
                      </div>
                      <div className="input-group">
                        <label>Instrucciones</label>
                        <textarea rows="2" required className="admin-textarea" value={paso.instrucciones} onChange={(e) => actualizarPaso(paso.id, 'instrucciones', e.target.value)}></textarea>
                      </div>
                      <div className="input-group" style={{ backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '6px', marginTop: '10px' }}>
                        <label>📄 Adjuntar formato para este paso (PDF)</label>
                        <input type="file" accept=".pdf" className="file-input" onChange={(e) => subirPDF(e, paso.id)} disabled={paso.subiendo} />
                        {paso.subiendo && <span style={{ color: '#2563eb', fontSize: '14px', marginTop: '5px' }}>⏳ Subiendo archivo a la nube...</span>}
                        {paso.archivoUrl && <span style={{ color: '#10b981', fontSize: '14px', marginTop: '5px', fontWeight: 'bold', display: 'block' }}>✅ Archivo cargado en la base de datos</span>}
                      </div>
                    </div>
                  ))}

                  <button type="button" className="btn-add-step" onClick={agregarPaso}>+ Agregar siguiente paso</button>
                  <hr className="form-divider" />
                  <button type="submit" className="btn-primary-admin btn-large">
                    {editandoId ? '💾 Guardar Cambios' : '💾 Publicar Guía en el Buscador'}
                  </button>
                </form>
              </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* PESTAÑA 3: GESTIÓN DE ENTIDADES (NUEVO)      */}
          {/* ========================================== */}
          {pestañaActiva === 'entidades' && (
            <div className="admin-section">
              <h2 className="section-title">Catálogo de Entidades del Estado</h2>
              <p style={{color: '#64748b', marginBottom: '20px'}}>
                Agrega nuevas instituciones públicas para que estén disponibles al crear trámites.
              </p>

              {/* Formulario para agregar entidad */}
              <div className="admin-card form-card" style={{ marginBottom: '30px' }}>
                <form style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }} onSubmit={guardarEntidad}>
                  <div className="input-group" style={{ flex: 1, margin: 0 }}>
                    <label>Sigla (Ej: SUNEDU)</label>
                    <input type="text" required value={nuevaSigla} onChange={(e) => setNuevaSigla(e.target.value)} />
                  </div>
                  <div className="input-group" style={{ flex: 3, margin: 0 }}>
                    <label>Nombre Completo (Ej: Superintendencia Nacional...)</label>
                    <input type="text" required value={nuevoNombreEntidad} onChange={(e) => setNuevoNombreEntidad(e.target.value)} />
                  </div>
                  <div className="input-group" style={{ flex: 3, margin: 0 }}>
                    <label>URL del Logo / Foto</label>
                    <input type="text" value={nuevoLogoUrl} onChange={(e) => setNuevoLogoUrl(e.target.value)} placeholder="https://.../logo.png" />
                  </div>
                  <button type="submit" className="btn-primary-admin" style={{ padding: '12px 20px', height: 'max-content' }}>
                    + Agregar
                  </button>
                </form>
              </div>

              {/* Lista de entidades registradas */}
              <div className="tramites-list-grid">
                {listaEntidades.length === 0 ? (
                  <p style={{color: '#64748b', textAlign: 'center'}}>No hay entidades registradas. Comienza agregando una.</p>
                ) : (
                  listaEntidades.map((ent) => (
                    <div key={ent.id} className="admin-tramite-card" style={{ padding: '15px 20px' }}>
                      <div>
                        <h4 style={{margin: '0', fontSize: '18px', color: '#1e293b'}}>{ent.sigla}</h4>
                        <span style={{fontSize: '14px', color: '#64748b'}}>{ent.nombre_completo}</span>
                      </div>
                      <button className="btn-delete" onClick={() => eliminarEntidad(ent.id)}>🗑️</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* PESTAÑA 4: ALERTAS                         */}
          {/* ========================================== */}
          {pestañaActiva === 'alertas' && (
            <div className="admin-section">
              <h2 className="section-title">Alertas del Sistema</h2>
              <p style={{color: '#64748b'}}>No hay alertas pendientes en este momento.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default PanelAdmin;