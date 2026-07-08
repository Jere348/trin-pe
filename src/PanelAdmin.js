import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, clearSession, getUser } from './api';
import { useToast } from './Toast';
import { supabase } from './supabase';
import { LayoutDashboard, FileText, Building2, Bell, LogOut, Shield, Download, RefreshCw, Search, Trash2, Edit2, CheckCircle, Plus, ArrowLeft, Star } from 'lucide-react';
import './PanelAdmin.css';

const PanelAdmin = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const usuarioActual = getUser();
  
  const [pestañaActiva, setPestañaActiva] = useState('catalogo');
  const [vistaCatalogo, setVistaCatalogo] = useState('lista'); 
  const [listaTramites, setListaTramites] = useState([]);
  const [editandoId, setEditandoId] = useState(null); 
  const [topBusquedas, setTopBusquedas] = useState([]);

  const [listaEntidades, setListaEntidades] = useState([]);
  const [nuevaSigla, setNuevaSigla] = useState('');
  const [nuevoNombreEntidad, setNuevoNombreEntidad] = useState('');
  const [nuevoLogoUrl, setNuevoLogoUrl] = useState('');
  const [editandoEntidadId, setEditandoEntidadId] = useState(null);

  const [titulo, setTitulo] = useState('');
  const [codigoInterno, setCodigoInterno] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [entidad, setEntidad] = useState('');
  const [modalidad, setModalidad] = useState('Virtual');
  const [costo, setCosto] = useState('');
  const [requisitos, setRequisitos] = useState('');
  const [pasos, setPasos] = useState([{ id: Date.now(), titulo: '', instrucciones: '', archivoUrl: '', subiendo: false }]);

  const [listaAlertas, setListaAlertas] = useState([]);
  const [busquedaCatalogo, setBusquedaCatalogo] = useState('');
  const [busquedaEntidades, setBusquedaEntidades] = useState('');

  const cargarTramitesAdmin = async () => {
    try {
      const respuesta = await apiFetch('/api/tramites');
      if (respuesta.ok) setListaTramites(await respuesta.json());
    } catch (error) { console.error("Error al cargar lista:", error); }
  };

  const cargarMetricas = async () => {
    try {
      const respuesta = await apiFetch('/api/metricas/top');
      if (respuesta.ok) setTopBusquedas(await respuesta.json());
    } catch (error) { console.error("Error al cargar métricas", error); }
  };

  const cargarEntidades = async () => {
    try {
      const respuesta = await apiFetch('/api/entidades');
      if (respuesta.ok) setListaEntidades(await respuesta.json());
    } catch (error) { console.error("Error al cargar entidades", error); }
  };

  const cargarAlertas = async () => {
    try {
      const respuesta = await apiFetch('/api/alertas');
      if (respuesta.ok) setListaAlertas(await respuesta.json());
    } catch (error) { console.error("Error al cargar alertas", error); }
  };

  useEffect(() => {
    if (!usuarioActual || !['Admin', 'Administrador'].includes(usuarioActual.rol)) {
      clearSession();
      navigate('/login');
      return;
    }
    cargarTramitesAdmin();
    cargarMetricas();
    cargarEntidades();
    cargarAlertas();
  }, [navigate, usuarioActual]);

  const obtenerListaSegura = (datos) => {
    if (!datos) return [];
    return typeof datos === 'string' ? JSON.parse(datos) : datos;
  };

  const guardarEntidad = async (e) => {
    e.preventDefault();
    const url = editandoEntidadId ? `/api/entidades/${editandoEntidadId}` : '/api/entidades';
    const metodo = editandoEntidadId ? 'PUT' : 'POST';

    try {
      const respuesta = await apiFetch(url, {
        method: metodo,
        body: JSON.stringify({ sigla: nuevaSigla, nombre_completo: nuevoNombreEntidad, logo_url: nuevoLogoUrl })
      });
      if (respuesta.ok) {
        showToast(editandoEntidadId ? 'Entidad actualizada.' : 'Entidad creada.', 'success');
        setEditandoEntidadId(null); setNuevaSigla(''); setNuevoNombreEntidad(''); setNuevoLogoUrl('');
        cargarEntidades();
      } else {
        showToast('No se pudo guardar la entidad.', 'error');
      }
    } catch (error) { showToast('Error de conexión al guardar entidad.', 'error'); }
  };

  const abrirEdicionEntidad = (ent) => {
    setEditandoEntidadId(ent.id);
    setNuevaSigla(ent.sigla);
    setNuevoNombreEntidad(ent.nombre_completo);
    setNuevoLogoUrl(ent.logo_url || '');
  };

  const eliminarEntidad = async (id) => {
    const confirmar = window.confirm('⚠️ ¿Seguro que deseas eliminar esta entidad? No afectará a los trámites que ya la usan.');
    if (!confirmar) return;
    try {
      const respuesta = await apiFetch(`/api/entidades/${id}`, { method: 'DELETE' });
      if (respuesta.ok) {
        showToast('Entidad eliminada.', 'success');
        cargarEntidades();
      } else {
        showToast('No se pudo eliminar la entidad.', 'error');
      }
    } catch (error) { showToast('Error al eliminar entidad.', 'error'); }
  };

  const limpiarFormulario = () => {
    setEditandoId(null); setTitulo(''); setCodigoInterno(''); setDescripcion(''); setEntidad(''); 
    setCosto(''); setRequisitos(''); 
    setPasos([{ id: Date.now(), titulo: '', instrucciones: '', archivoUrl: '', subiendo: false }]);
  };

  const abrirParaCrear = () => { limpiarFormulario(); setVistaCatalogo('formulario'); };

  const abrirParaEditar = (tramite) => {
    setEditandoId(tramite.id); setTitulo(tramite.titulo); setCodigoInterno(tramite.codigo_interno || '');
    setDescripcion(tramite.descripcion); setEntidad(tramite.entidad); setModalidad(tramite.modalidad || 'Virtual'); setCosto(tramite.costo);
    const listaReq = obtenerListaSegura(tramite.requisitos); 
    setRequisitos(listaReq.map(r => r.descripcion || r).join('\n'));
    const listaPasos = obtenerListaSegura(tramite.pasos); 
    setPasos(listaPasos.length > 0 ? listaPasos : [{ id: Date.now(), titulo: '', instrucciones: '', archivoUrl: '', subiendo: false }]);
    setVistaCatalogo('formulario');
  };

  const eliminarTramite = async (id) => {
    const confirmar = window.confirm('⚠️ ¿Estás seguro de que deseas eliminar este trámite permanentemente?');
    if (!confirmar) return;
    try {
      const respuesta = await apiFetch(`/api/tramites/${id}`, { method: 'DELETE' });
      if (respuesta.ok) {
        showToast('Trámite eliminado correctamente.', 'success');
        cargarTramitesAdmin();
      } else {
        showToast('No se pudo eliminar el trámite.', 'error');
      }
    } catch (error) { showToast('Error al eliminar el trámite.', 'error'); }
  };

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
      showToast('Archivo subido con éxito a la nube.', 'success');
    } catch (error) { 
      showToast(`Error de Supabase: ${error.message}`, 'error'); 
    } finally { 
      actualizarPaso(idDelPaso, 'subiendo', false); 
    }
  };

  const guardarTramite = async (e) => {
    e.preventDefault();
    const arrayRequisitos = requisitos.split('\n').filter(req => req.trim() !== '');
    const paqueteDeDatos = { titulo, codigo_interno: codigoInterno, descripcion, entidad, modalidad, costo: parseFloat(costo) || 0, requisitos: arrayRequisitos, pasos };
    const url = editandoId ? `/api/tramites/${editandoId}` : '/api/tramites';
    const metodo = editandoId ? 'PUT' : 'POST';
    try {
      const respuesta = await apiFetch(url, { method: metodo, body: JSON.stringify(paqueteDeDatos) });
      if (respuesta.ok) {
        showToast(editandoId ? 'Trámite actualizado.' : 'Guía publicada con éxito.', 'success');
        cargarTramitesAdmin(); setVistaCatalogo('lista'); 
      } else { 
        const errorData = await respuesta.json(); 
        showToast('Error al guardar: ' + errorData.error, 'error'); 
      }
    } catch (error) { showToast('Error de conexión.', 'error'); }
  };

  const exportarCSV = () => {
    if (listaTramites.length === 0) { showToast('No hay trámites para exportar.', 'warning'); return; }
    const cabeceras = ["ID", "Código", "Título", "Entidad", "Modalidad", "Costo (S/)"];
    const filas = listaTramites.map(t => [t.id, t.codigo_interno || 'N/A', `"${t.titulo}"`, `"${t.entidad}"`, t.modalidad || 'Virtual', t.costo]);
    const contenidoCSV = [cabeceras.join(","), ...filas.map(f => f.join(","))].join("\n");
    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.setAttribute("href", url);
    enlace.setAttribute("download", `Reporte_Tramites_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(enlace); enlace.click(); document.body.removeChild(enlace);
  };

  const resolverAlerta = async (id) => {
    try {
      const respuesta = await apiFetch(`/api/alertas/${id}/resolver`, { method: 'PUT' });
      if (respuesta.ok) {
        showToast('Alerta resuelta.', 'success');
        cargarAlertas();
      } else {
        showToast('Error al resolver la alerta.', 'error');
      }
    } catch (error) { showToast('Error al procesar alerta.', 'error'); }
  };

  const alertasPendientes = listaAlertas.filter(a => a.estado === 'PENDIENTE').length;

  if (!usuarioActual || !['Admin', 'Administrador'].includes(usuarioActual.rol)) {
    return null;
  }

  return (
    <div className="admin-page">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="shield-icon"><Shield size={32} /></div>
          <h2>Trámite Inteligente</h2>
          <span>Panel Interno</span>
        </div>
        <nav className="sidebar-menu">
          <button className={`menu-item ${pestañaActiva === 'metricas' ? 'active' : ''}`} onClick={() => setPestañaActiva('metricas')}>
            <LayoutDashboard size={20} /> Dashboard de Métricas
          </button>
          <button className={`menu-item ${pestañaActiva === 'catalogo' ? 'active' : ''}`} onClick={() => setPestañaActiva('catalogo')}>
            <FileText size={20} /> Gestión de Catálogo
          </button>
          <button className={`menu-item ${pestañaActiva === 'entidades' ? 'active' : ''}`} onClick={() => setPestañaActiva('entidades')}>
            <Building2 size={20} /> Gestión de Entidades
          </button>
          <button className={`menu-item ${pestañaActiva === 'alertas' ? 'active' : ''}`} onClick={() => { setPestañaActiva('alertas'); cargarAlertas(); }}>
            <Bell size={20} /> Alertas y Reportes {alertasPendientes > 0 && <span style={{ background: 'var(--error)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', marginLeft: 'auto' }}>{alertasPendientes}</span>}
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="menu-item logout" onClick={() => { clearSession(); showToast('Sesión cerrada.', 'success'); navigate('/'); }}>
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="admin-header-row">
          <h1>Gestión Interna</h1>
          <div className="admin-avatar-btn">
            {usuarioActual?.nombre?.charAt(0).toUpperCase() || 'A'}
          </div>
        </header>

        <div className="admin-content">
          {pestañaActiva === 'metricas' && (
            <div>
              <div className="panel-header-row">
                <h2 className="panel-title"><LayoutDashboard size={24}/> Métricas de Búsqueda</h2>
                <button className="btn-secondary" onClick={cargarMetricas}><RefreshCw size={16}/> Actualizar</button>
              </div>

              <div className="metrics-grid">
                <div className="metric-card-modern">
                  <div className="metric-icon-wrapper blue">
                    <Search size={28} />
                  </div>
                  <div className="metric-info">
                    <h3>Búsquedas Totales (Top)</h3>
                    <div className="metric-value">
                      {topBusquedas.reduce((suma, item) => suma + Number(item.cantidad), 0).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="metric-card-modern">
                  <div className="metric-icon-wrapper purple">
                    <Star size={28} />
                  </div>
                  <div className="metric-info">
                    <h3>Trámite más consultado</h3>
                    <div className="metric-value" style={{ fontSize: 20 }}>
                      {topBusquedas.length > 0 ? topBusquedas[0].termino.toUpperCase() : '---'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-panel-card">
                <h3 className="panel-title" style={{ marginBottom: 20 }}>Top 10 Búsquedas</h3>
                {topBusquedas.length === 0 ? (
                  <p style={{ color: 'var(--text-light)' }}>Aún no hay datos suficientes.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {topBusquedas.map((item, index) => {
                      const maxCantidad = topBusquedas[0].cantidad;
                      const porcentaje = (item.cantidad / maxCantidad) * 100;
                      return (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <span style={{ width: '25px', fontWeight: 'bold', color: 'var(--text-light)' }}>#{index + 1}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>"{item.termino}"</span>
                              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{item.cantidad} consultas</span>
                            </div>
                            <div className="progress-bar-wrapper">
                              <div className="progress-bar-fill" style={{ width: `${porcentaje}%` }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="admin-panel-card">
                <div className="panel-header-row" style={{ marginBottom: 0 }}>
                  <h3 className="panel-title">Exportar Catálogo de Trámites</h3>
                  <button className="btn-primary" style={{ background: 'var(--success)' }} onClick={exportarCSV}>
                    <Download size={18}/> Exportar a CSV
                  </button>
                </div>
              </div>
            </div>
          )}

          {pestañaActiva === 'catalogo' && vistaCatalogo === 'lista' && (
            <div className="admin-panel-card">
              <div className="panel-header-row">
                <h2 className="panel-title"><FileText size={24}/> Directorio de Trámites</h2>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ padding: '6px 12px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '20px', display: 'flex', alignItems: 'center', minWidth: 250 }}>
                    <Search size={16} color="var(--text-light)" />
                    <input type="text" placeholder="Buscar por título o código..." value={busquedaCatalogo} onChange={(e) => setBusquedaCatalogo(e.target.value)} style={{ border: 'none', outline: 'none', marginLeft: 8, width: '100%', fontSize: '14px' }} />
                  </div>
                  <button className="btn-primary" onClick={abrirParaCrear}>
                    <Plus size={18}/> Nuevo trámite
                  </button>
                </div>
              </div>
              
              <div className="modern-table-wrapper">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Título</th>
                      <th>Entidad</th>
                      <th>Costo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaTramites
                      .filter(t => t.titulo?.toLowerCase().includes(busquedaCatalogo.toLowerCase()) || t.codigo_interno?.toLowerCase().includes(busquedaCatalogo.toLowerCase()))
                      .map(t => (
                      <tr key={t.id}>
                        <td style={{ color: 'var(--text-light)', fontWeight: 600 }}>{t.codigo_interno || '-'}</td>
                        <td style={{ fontWeight: 600 }}>{t.titulo}</td>
                        <td>{t.entidad}</td>
                        <td>S/ {t.costo}</td>
                        <td>
                          <div className="action-group">
                            <button className="btn-icon-action edit" onClick={() => abrirParaEditar(t)} title="Editar"><Edit2 size={16}/></button>
                            <button className="btn-icon-action delete" onClick={() => eliminarTramite(t.id)} title="Eliminar"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {pestañaActiva === 'catalogo' && vistaCatalogo === 'formulario' && (
            <div className="admin-panel-card">
              <div className="panel-header-row">
                <h2 className="panel-title">{editandoId ? 'Editar Trámite' : 'Crear Nuevo Trámite'}</h2>
                <button className="btn-secondary" onClick={() => setVistaCatalogo('lista')}>
                  <ArrowLeft size={16} /> Volver
                </button>
              </div>

              <form onSubmit={guardarTramite}>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Título del Trámite</label>
                    <input className="form-input" required value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Código Interno</label>
                    <input className="form-input" value={codigoInterno} onChange={(e) => setCodigoInterno(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Entidad Responsable</label>
                    <select className="form-input" required value={entidad} onChange={(e) => setEntidad(e.target.value)}>
                      <option value="">Selecciona una entidad...</option>
                      {listaEntidades.map(ent => (
                        <option key={ent.id} value={ent.sigla}>{ent.nombre_completo}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Costo Oficial (S/)</label>
                    <input className="form-input" type="number" step="0.1" required value={costo} onChange={(e) => setCosto(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Modalidad</label>
                    <select className="form-input" value={modalidad} onChange={(e) => setModalidad(e.target.value)}>
                      <option value="Presencial">Presencial</option>
                      <option value="Virtual">Virtual</option>
                      <option value="Mixto">Mixto</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Descripción General</label>
                    <textarea className="form-input" rows="3" required value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                  </div>
                  <div className="form-group full-width">
                    <label>Requisitos (Uno por línea)</label>
                    <textarea className="form-input" rows="4" required value={requisitos} onChange={(e) => setRequisitos(e.target.value)} placeholder="DNI original&#10;Recibo de luz..." />
                  </div>
                </div>

                <div className="panel-header-row" style={{ marginTop: 32 }}>
                  <h3 className="panel-title" style={{ fontSize: 18 }}>Pasos del Trámite</h3>
                  <button type="button" className="btn-secondary" onClick={agregarPaso}>+ Añadir paso</button>
                </div>

                {pasos.map((paso, index) => (
                  <div key={paso.id} className="paso-builder-card">
                    <button type="button" className="btn-icon-action delete btn-remove-paso" onClick={() => eliminarPaso(paso.id)}><Trash2 size={16}/></button>
                    <div className="form-group">
                      <label>Paso {index + 1}: Título</label>
                      <input className="form-input" required value={paso.titulo} onChange={(e) => actualizarPaso(paso.id, 'titulo', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginTop: 16 }}>
                      <label>Instrucciones detalladas</label>
                      <textarea className="form-input" rows="2" required value={paso.instrucciones} onChange={(e) => actualizarPaso(paso.id, 'instrucciones', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginTop: 16 }}>
                      <label>Formato/Anexo (PDF)</label>
                      <input type="file" accept=".pdf" className="form-input" onChange={(e) => subirPDF(e, paso.id)} disabled={paso.subiendo} />
                      {paso.subiendo && <small style={{ color: 'var(--accent)', marginTop: 4, display: 'block' }}>Subiendo a la nube...</small>}
                      {paso.archivoUrl && <a href={paso.archivoUrl} target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: 8, fontSize: 13, color: 'var(--success)' }}>Formato adjunto (Ver)</a>}
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn-primary">
                    <CheckCircle size={18}/> Guardar e Implementar
                  </button>
                </div>
              </form>
            </div>
          )}

          {pestañaActiva === 'entidades' && (
            <div className="admin-panel-card">
              <div className="panel-header-row" style={{ alignItems: 'flex-start' }}>
                <div>
                  <h2 className="panel-title"><Building2 size={24}/> Gestión de Entidades Públicas</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 24, marginTop: 8 }}>Registra los ministerios, organismos y municipalidades que administran trámites.</p>
                </div>
                <div style={{ padding: '6px 12px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '20px', display: 'flex', alignItems: 'center', minWidth: 250, marginTop: 4 }}>
                  <Search size={16} color="var(--text-light)" />
                  <input type="text" placeholder="Buscar entidad o sigla..." value={busquedaEntidades} onChange={(e) => setBusquedaEntidades(e.target.value)} style={{ border: 'none', outline: 'none', marginLeft: 8, width: '100%', fontSize: '14px' }} />
                </div>
              </div>
              
              <form onSubmit={guardarEntidad} className="form-grid" style={{ background: 'var(--background)', padding: 24, borderRadius: 16, marginBottom: 32 }}>
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input className="form-input" required value={nuevoNombreEntidad} onChange={(e) => setNuevoNombreEntidad(e.target.value)} placeholder="Ej. Registro Nacional de Identificación" />
                </div>
                <div className="form-group">
                  <label>Sigla o Abreviatura</label>
                  <input className="form-input" required value={nuevaSigla} onChange={(e) => setNuevaSigla(e.target.value)} placeholder="Ej. RENIEC" />
                </div>
                <div className="form-group full-width">
                  <label>URL del Logo Institucional</label>
                  <input className="form-input" required value={nuevoLogoUrl} onChange={(e) => setNuevoLogoUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="form-group full-width" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  {editandoEntidadId && <button type="button" className="btn-secondary" onClick={() => { setEditandoEntidadId(null); setNuevaSigla(''); setNuevoNombreEntidad(''); setNuevoLogoUrl(''); }}>Cancelar</button>}
                  <button type="submit" className="btn-primary">
                    <CheckCircle size={18}/> {editandoEntidadId ? 'Actualizar Entidad' : 'Registrar Entidad'}
                  </button>
                </div>
              </form>
              
              <div className="modern-table-wrapper">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Logo</th>
                      <th>Sigla</th>
                      <th>Nombre Completo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaEntidades
                      .filter(ent => ent.nombre_completo?.toLowerCase().includes(busquedaEntidades.toLowerCase()) || ent.sigla?.toLowerCase().includes(busquedaEntidades.toLowerCase()))
                      .map(ent => (
                      <tr key={ent.id}>
                        <td><img src={ent.logo_url} alt="Logo" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'contain', background: 'var(--white)' }} /></td>
                        <td style={{ fontWeight: 600 }}>{ent.sigla}</td>
                        <td>{ent.nombre_completo}</td>
                        <td>
                          <div className="action-group">
                            <button className="btn-icon-action edit" onClick={() => abrirEdicionEntidad(ent)} title="Editar"><Edit2 size={16}/></button>
                            <button className="btn-icon-action delete" onClick={() => eliminarEntidad(ent.id)} title="Eliminar"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {pestañaActiva === 'alertas' && (
            <div className="admin-panel-card">
              <h2 className="panel-title"><Bell size={24}/> Alertas y Reportes Ciudadanos</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24, marginTop: 8 }}>Revisa los reportes de información desactualizada enviados por los usuarios.</p>

              {listaAlertas.length === 0 ? (
                <p>No hay alertas registradas en el sistema.</p>
              ) : (
                <div className="modern-table-wrapper">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Trámite Afectado</th>
                        <th>Motivo del Reporte</th>
                        <th>Descripción</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaAlertas.map(alerta => (
                        <tr key={alerta.id} style={{ background: alerta.estado === 'PENDIENTE' ? 'rgba(239,68,68,0.02)' : 'transparent' }}>
                          <td style={{ fontWeight: 600 }}>{alerta.tramites ? `${alerta.tramites.codigo_interno || 'SIN-CODIGO'} - ${alerta.tramites.titulo}` : 'Trámite Eliminado'}</td>
                          <td><span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--primary)' }}>{alerta.motivo}</span></td>
                          <td>{alerta.descripcion}</td>
                          <td>{new Date(alerta.creado_en).toLocaleDateString()}</td>
                          <td>
                            <span className="badge" style={{ background: alerta.estado === 'PENDIENTE' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', color: alerta.estado === 'PENDIENTE' ? '#F59E0B' : 'var(--success)' }}>
                              {alerta.estado}
                            </span>
                          </td>
                          <td>
                            {alerta.estado === 'PENDIENTE' && (
                              <button className="btn-icon-action check" onClick={() => resolverAlerta(alerta.id)} title="Marcar como resuelto">
                                <CheckCircle size={20}/>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PanelAdmin;
