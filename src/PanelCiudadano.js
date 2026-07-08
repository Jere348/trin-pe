import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, clearSession, getSession, getUser } from './api';
import { useToast } from './Toast';
import { Search, Building2, Bookmark, LogOut, ArrowLeft, AlertTriangle, Star, Settings, Volume2, Type, Eye } from 'lucide-react';
import './PanelCiudadano.css';
import logoImg from './assets/logo.png';
import Chatbot from './Chatbot';

const FALLBACK_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Flag_of_Peru_%28state%29.svg/800px-Flag_of_Peru_%28state%29.svg.png';

const parseList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const PanelCiudadano = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [vistaActual, setVistaActual] = useState('buscador');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [listaTramites, setListaTramites] = useState([]);
  const [listaEntidades, setListaEntidades] = useState([]);
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [listaFavoritos, setListaFavoritos] = useState([]);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [mostrarModalReporte, setMostrarModalReporte] = useState(false);
  const [motivoReporte, setMotivoReporte] = useState('Informacion desactualizada');
  const [descripcionReporte, setDescripcionReporte] = useState('');

  const [configA11y, setConfigA11y] = useState({
    altoContraste: localStorage.getItem('a11y_contraste') === 'true',
    textoGrande: localStorage.getItem('a11y_texto') === 'true',
    lectorVoz: localStorage.getItem('a11y_voz') === 'true',
  });

  useEffect(() => {
    if (configA11y.altoContraste) document.body.classList.add('a11y-high-contrast');
    else document.body.classList.remove('a11y-high-contrast');

    if (configA11y.textoGrande) document.body.classList.add('a11y-large-text');
    else document.body.classList.remove('a11y-large-text');

    localStorage.setItem('a11y_contraste', configA11y.altoContraste);
    localStorage.setItem('a11y_texto', configA11y.textoGrande);
    localStorage.setItem('a11y_voz', configA11y.lectorVoz);
  }, [configA11y]);

  const toggleA11y = (key) => {
    setConfigA11y(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const leerEnVozAlta = (texto) => {
    if (!configA11y.lectorVoz || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-PE';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const detenerVoz = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  const reportarErrorAutomatico = async (motivoError, detalle) => {
    try {
      await apiFetch('/api/alertas', {
        method: 'POST',
        body: JSON.stringify({
          tipo: 'ERROR_SISTEMA',
          motivo: motivoError,
          descripcion: detalle,
        }),
      });
    } catch (error) {
      console.error('No se pudo registrar la alerta automatica', error);
    }
  };

  const cargarFavoritos = async (idUsuario) => {
    try {
      const respuesta = await apiFetch(`/api/favoritos/${idUsuario}`);
      if (respuesta.ok) {
        setListaFavoritos(await respuesta.json());
      }
    } catch (error) {
      console.error('Error al cargar favoritos', error);
    }
  };

  useEffect(() => {
    apiFetch('/api/tramites')
      .then((res) => {
        if (!res.ok) throw new Error('Error en el servidor de base de datos');
        return res.json();
      })
      .then((data) => setListaTramites(data))
      .catch((err) => {
        reportarErrorAutomatico('Fallo de conexion a la base de datos', err.message);
        showToast('No pudimos cargar los tramites.', 'error');
      });

    apiFetch('/api/entidades')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setListaEntidades(data))
      .catch(() => showToast('No pudimos cargar las entidades.', 'error'));

    const sesion = getSession();
    const datosUsuario = getUser();
    if (sesion?.token && datosUsuario) {
      setUsuario(datosUsuario);
      cargarFavoritos(datosUsuario.id);
    }
    setCargandoSesion(false);
  }, [showToast]);

  const terminoNormalizado = terminoBusqueda.toLowerCase().trim();
  const tramitesFiltrados = useMemo(() => {
    return listaTramites.filter((tramite) => {
      if (!terminoNormalizado) return true;
      return (
        tramite.titulo?.toLowerCase().includes(terminoNormalizado) ||
        tramite.entidad?.toLowerCase().includes(terminoNormalizado) ||
        tramite.descripcion?.toLowerCase().includes(terminoNormalizado)
      );
    });
  }, [listaTramites, terminoNormalizado]);

  const esTramiteFavorito = (idTramite) => listaFavoritos.some((favorito) => favorito.id === idTramite);

  const registrarBusquedaSilenciosa = async () => {
    if (terminoBusqueda.trim().length < 2) return;
    try {
      await apiFetch('/api/metricas', {
        method: 'POST',
        body: JSON.stringify({ termino: terminoBusqueda }),
      });
    } catch (error) {
      console.error('No se pudo registrar la busqueda');
    }
  };

  const toggleFavorito = async (tramite, evento) => {
    if (evento) evento.stopPropagation();
    if (!usuario) {
      showToast('Inicia sesion para guardar guias favoritas.', 'warning');
      navigate('/login');
      return;
    }

    const yaEsFavorito = esTramiteFavorito(tramite.id);
    try {
      if (yaEsFavorito) {
        await apiFetch(`/api/favoritos/${usuario.id}/${tramite.id}`, { method: 'DELETE' });
        showToast('Guia retirada de favoritos.', 'success');
      } else {
        const respuesta = await apiFetch('/api/favoritos', {
          method: 'POST',
          body: JSON.stringify({ usuario_id: usuario.id, tramite_id: tramite.id }),
        });

        if (!respuesta.ok) {
          const data = await respuesta.json();
          showToast(data.error || 'No se pudo guardar el favorito.', 'error');
          return;
        }
        showToast('Guia guardada en favoritos.', 'success');
      }
      cargarFavoritos(usuario.id);
    } catch (error) {
      showToast('No se pudo actualizar favoritos.', 'error');
    }
  };

  const cerrarSesion = () => {
    clearSession();
    setUsuario(null);
    setListaFavoritos([]);
    showToast('Sesion cerrada correctamente.', 'success');
    navigate('/');
  };

  const enviarReporte = async (e) => {
    e.preventDefault();
    if (!tramiteSeleccionado) return;

    try {
      const respuesta = await apiFetch('/api/alertas', {
        method: 'POST',
        body: JSON.stringify({
          tipo: 'REPORTE_CIUDADANO',
          tramite_id: tramiteSeleccionado.id,
          motivo: motivoReporte,
          descripcion: descripcionReporte,
        }),
      });

      if (!respuesta.ok) {
        showToast('No se pudo enviar el reporte.', 'error');
        return;
      }

      showToast('Gracias por tu reporte. Lo revisaremos pronto.', 'success');
      setMostrarModalReporte(false);
      setDescripcionReporte('');
    } catch (error) {
      showToast('Error de conexion al enviar el reporte.', 'error');
    }
  };

  if (cargandoSesion) {
    return (
      <div className="loading-screen">
        <h2>Cargando tu perfil...</h2>
        <p>Conectando con Tramite Inteligente</p>
      </div>
    );
  }

  return (
    <div className="ciudadano-page">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src={logoImg} alt="Logo TrinPe" />
          <h2>Trámite Inteligente</h2>
          <span>Portal Ciudadano</span>
        </div>
        <nav className="sidebar-menu">
          <button className={`menu-item ${vistaActual === 'buscador' ? 'active' : ''}`} onClick={() => { setVistaActual('buscador'); setTramiteSeleccionado(null); }}>
            <Search size={20} /> Buscador principal
          </button>
          <button className={`menu-item ${vistaActual === 'entidades' ? 'active' : ''}`} onClick={() => { setVistaActual('entidades'); setTramiteSeleccionado(null); }}>
            <Building2 size={20} /> Directorio de entidades
          </button>
          <button className={`menu-item ${vistaActual === 'favoritos' ? 'active' : ''}`} onClick={() => { setVistaActual('favoritos'); setTramiteSeleccionado(null); detenerVoz(); }}>
            <Bookmark size={20} /> Mis guías guardadas
          </button>
          <button className={`menu-item ${vistaActual === 'configuracion' ? 'active' : ''}`} onClick={() => { setVistaActual('configuracion'); setTramiteSeleccionado(null); detenerVoz(); }}>
            <Settings size={20} /> Configuración
          </button>
        </nav>
        {usuario && (
          <div className="sidebar-footer">
            <button className="menu-item logout" onClick={cerrarSesion}>
              <LogOut size={20} /> Cerrar sesión
            </button>
          </div>
        )}
      </aside>

      <main className="main-content">
        {vistaActual === 'buscador' && !tramiteSeleccionado && (
          <>
            <div className="search-hero">
              <h1>Encuentra tu trámite al instante</h1>
              <p>Busca por nombre, entidad responsable o palabras clave y ahorra tiempo en colas.</p>
              <div className="search-wrapper">
                <Search className="search-icon" size={24} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Ej. Sacar pasaporte, renovar DNI, multas..."
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                  onBlur={registrarBusquedaSilenciosa}
                />
              </div>
            </div>

            <div className="section-title">
              <Search size={24} /> {terminoBusqueda ? 'Resultados de búsqueda' : 'Trámites destacados'}
            </div>

            <div className="tramites-grid">
              {terminoBusqueda && tramitesFiltrados.length === 0 ? (
                <p>No encontramos resultados para tu búsqueda.</p>
              ) : (
                tramitesFiltrados.map((tramite) => (
                  <div key={tramite.id} className="tramite-card">
                    <div className="tramite-header">
                      <span className="entidad-badge">
                        <Building2 size={14} /> {tramite.entidad}
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); toggleFavorito(tramite); }} className={`btn-icon ${esTramiteFavorito(tramite.id) ? 'favorito' : ''}`} title="Guardar">
                        <Star size={20} fill={esTramiteFavorito(tramite.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <h3 className="tramite-title">{tramite.titulo}</h3>
                    <p className="tramite-desc">{tramite.descripcion}</p>
                    <div className="tramite-footer">
                      <span className={`badge ${tramite.modalidad.toLowerCase()}`}>{tramite.modalidad}</span>
                      <span className="costo-pill">S/ {tramite.costo}</span>
                    </div>
                    <button className="btn-ver-mas" onClick={() => setTramiteSeleccionado(tramite)}>
                      Ver guía paso a paso <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

          {vistaActual === 'entidades' && !tramiteSeleccionado && (
            <>
              <div className="section-title">
                <Building2 size={24} /> Directorio de Entidades Públicas
              </div>
              <div className="tramites-grid">
                {listaEntidades.length === 0 ? (
                  <p>Cargando entidades...</p>
                ) : (
                  listaEntidades.map((entidad) => (
                    <div key={entidad.id} className="tramite-card" style={{ textAlign: 'center', alignItems: 'center' }}>
                      <img src={entidad.logo_url || FALLBACK_LOGO} alt={`Logo`} style={{ width: 64, height: 64, borderRadius: '50%', marginBottom: 16 }} onError={(e) => { e.target.src = FALLBACK_LOGO; }} />
                      <h3 className="tramite-title">{entidad.sigla}</h3>
                      <p className="tramite-desc" style={{ textAlign: 'center' }}>{entidad.nombre_completo}</p>
                      <button className="btn-ver-mas" onClick={() => { setTerminoBusqueda(entidad.sigla); setVistaActual('buscador'); }}>
                        <Search size={16} /> Buscar sus trámites
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {vistaActual === 'favoritos' && !tramiteSeleccionado && (
            <>
              <div className="section-title">
                <Bookmark size={24} /> Mis trámites guardados
              </div>
              {!usuario ? (
                <div className="search-hero" style={{ background: 'var(--white)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                  <Bookmark size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
                  <h2 style={{ color: 'var(--primary)' }}>Inicia sesión para guardar trámites</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>Crea tu cuenta gratis para no perder tus guías favoritas.</p>
                  <button onClick={() => navigate('/login')} className="btn-ver-mas" style={{ background: 'var(--primary)', color: 'var(--white)', maxWidth: '200px', margin: '0 auto' }}>
                    Ir al acceso
                  </button>
                </div>
              ) : listaFavoritos.length === 0 ? (
                <p>Aún no tienes trámites guardados. Usa la estrella para guardar uno.</p>
              ) : (
                <div className="tramites-grid">
                  {listaFavoritos.map((tramite) => (
                    <div key={tramite.id} className="tramite-card">
                      <div className="tramite-header">
                        <span className="entidad-badge"><Building2 size={14}/> {tramite.entidad}</span>
                        <button onClick={(e) => { e.stopPropagation(); toggleFavorito(tramite); }} className="btn-icon favorito" title="Quitar">
                          <Star size={20} fill="currentColor" />
                        </button>
                      </div>
                      <h3 className="tramite-title">{tramite.titulo}</h3>
                      <p className="tramite-desc">{tramite.descripcion}</p>
                      <div className="tramite-footer">
                        <span className={`badge ${tramite.modalidad.toLowerCase()}`}>{tramite.modalidad}</span>
                        <span className="costo-pill">S/ {tramite.costo}</span>
                      </div>
                      <button className="btn-ver-mas" onClick={() => setTramiteSeleccionado(tramite)}>
                        Ver guía paso a paso <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tramiteSeleccionado && (
            <div className="detalle-wrapper">
              <div className="detalle-header">
                <div>
                  <button className="btn-volver" onClick={() => { setTramiteSeleccionado(null); detenerVoz(); }}>
                    <ArrowLeft size={16} /> Volver a resultados
                  </button>
                  <h1>{tramiteSeleccionado.titulo}</h1>
                  <div className="detalle-meta">
                    <span className="entidad-badge">
                      {entidadInfo?.logo_url && <img src={entidadInfo.logo_url} alt="Logo" />}
                      {entidadInfo?.nombre_completo || tramiteSeleccionado.entidad}
                    </span>
                    <span className="costo-pill">S/ {tramiteSeleccionado.costo}</span>
                    <span className={`badge ${tramiteSeleccionado.modalidad?.toLowerCase()}`}>
                      {tramiteSeleccionado.modalidad}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
                  <button className="btn-reportar" onClick={() => setMostrarModalReporte(true)}>
                    <AlertTriangle size={16} /> Reportar error
                  </button>
                  <button className="btn-primary" onClick={() => toggleFavorito(tramiteSeleccionado)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Star size={16} fill={esTramiteFavorito(tramiteSeleccionado.id) ? 'currentColor' : 'none'} />
                    {esTramiteFavorito(tramiteSeleccionado.id) ? 'Quitar guardado' : 'Guardar guía'}
                  </button>
                </div>
              </div>

              <div className="detalle-grid">
                <div>
                  <div className="detalle-seccion">
                    <h3>¿De qué trata este trámite?</h3>
                    <p>{tramiteSeleccionado.descripcion}</p>
                  </div>
                  <div className="detalle-seccion">
                    <h3>Pasos a seguir</h3>
                    <ol className="lista-items" style={{ padding: 0 }}>
                      {parseList(tramiteSeleccionado.pasos).map((paso, index) => (
                        <li key={index}>
                          <strong>{paso.titulo}</strong>
                          <p style={{ marginTop: 4, color: 'var(--text-secondary)' }}>{paso.instrucciones}</p>
                          {paso.archivoUrl && (
                            <a href={paso.archivoUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 8, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                              Descargar formato oficial ⬇
                            </a>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
                <div>
                  <div className="detalle-seccion">
                    <h3>Requisitos indispensables</h3>
                    <ul className="lista-items" style={{ padding: 0 }}>
                      {parseList(tramiteSeleccionado.requisitos).map((req, index) => (
                        <li key={index}>{typeof req === 'string' ? req : req.descripcion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {mostrarModalReporte && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Reportar este trámite</h3>
                <p>Ayúdanos a mantener la información actualizada.</p>
                <form onSubmit={enviarReporte}>
                  <label style={{ display: 'block', marginBottom: 4, color: 'var(--text-secondary)' }}>Motivo principal</label>
                  <select value={motivoReporte} onChange={(e) => setMotivoReporte(e.target.value)}>
                    <option value="Informacion desactualizada">Información desactualizada</option>
                    <option value="El costo es incorrecto">El costo es incorrecto</option>
                    <option value="Faltan requisitos">Faltan requisitos importantes</option>
                    <option value="El link/PDF no funciona">El enlace o PDF no funciona</option>
                    <option value="Otro motivo">Otro motivo</option>
                  </select>
                  <label style={{ display: 'block', marginBottom: 4, color: 'var(--text-secondary)' }}>Descripción breve</label>
                  <textarea rows="3" value={descripcionReporte} onChange={(e) => setDescripcionReporte(e.target.value)} placeholder="Danos más detalles..." />
                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={() => setMostrarModalReporte(false)}>Cancelar</button>
                    <button type="submit" className="btn-primary">Enviar reporte</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {vistaActual === 'configuracion' && (
            <div className="configuracion-wrapper animate-in">
              <div className="section-title">
                <Settings size={24} /> Configuración de Cuenta y Accesibilidad
              </div>
              
              <div className="detalle-seccion">
                <h3><Eye size={20} /> Accesibilidad Visual</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Ajusta la plataforma para facilitar la lectura.</p>
                
                <div className="config-item">
                  <div className="config-info">
                    <strong>Modo de Alto Contraste</strong>
                    <p>Aumenta el contraste de los colores para mejorar la visibilidad (ideal para daltonismo o cataratas).</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={configA11y.altoContraste} onChange={() => toggleA11y('altoContraste')} />
                    <span className="slider round"></span>
                  </label>
                </div>
                
                <hr style={{ borderTop: '1px solid var(--border)', margin: '16px 0' }} />
                
                <div className="config-item">
                  <div className="config-info">
                    <strong>Texto Grande (Escala 150%)</strong>
                    <p>Aumenta el tamaño de todas las letras de la página.</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={configA11y.textoGrande} onChange={() => toggleA11y('textoGrande')} />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              <div className="detalle-seccion">
                <h3><Volume2 size={20} /> Accesibilidad Auditiva</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Soporte de voz para personas con discapacidad visual o dificultad para leer.</p>
                
                <div className="config-item">
                  <div className="config-info">
                    <strong>Lector de Voz (Text-to-Speech)</strong>
                    <p>Activa un botón en todos los trámites para que la página los lea en voz alta automáticamente.</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={configA11y.lectorVoz} onChange={() => toggleA11y('lectorVoz')} />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </main>
        <Chatbot />
    </div>
  );
};

export default PanelCiudadano;
