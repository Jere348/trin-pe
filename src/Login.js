import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from './assets/logo.png';
import { apiFetch, saveSession } from './api';
import { useToast } from './Toast';
import './App.css';

function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [modo, setModo] = useState('ciudadano');
  const [cargando, setCargando] = useState(false);

  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [celular, setCelular] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [terminos, setTerminos] = useState(false);
  const [privacidad, setPrivacidad] = useState(false);
  const [modalTerminos, setModalTerminos] = useState(false);
  const [modalPrivacidad, setModalPrivacidad] = useState(false);
  
  const [pasoVerificacion, setPasoVerificacion] = useState(false);
  const [codigoVerificacion, setCodigoVerificacion] = useState('');

  const esRegistro = modo === 'registro';
  const esAdmin = modo === 'admin';

  const limpiarClave = () => setContrasena('');

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (esRegistro && (!terminos || !privacidad)) {
      showToast('Por favor, acepta los términos y políticas para poder registrarte.', 'error');
      return;
    }
    setCargando(true);

    const datosAEnviar = esRegistro
      ? { nombre, dni, celular, correo, contrasena }
      : { correo_dni: correo, contrasena };

    try {
      const endpoint = esRegistro ? '/api/registro/solicitar-codigo' : '/api/login';
      const respuesta = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(datosAEnviar),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        showToast(resultado.error || 'No pudimos completar la solicitud.', 'error');
        setCargando(false);
        return;
      }

      if (esRegistro) {
        if (resultado.codigo_prueba) {
          showToast(`Modo Demo (Render bloquea correos): Tu código es ${resultado.codigo_prueba}`, 'success');
        } else {
          showToast('Código enviado. Revisa tu correo.', 'success');
        }
        setPasoVerificacion(true);
        setCargando(false);
        return;
      }

      const rol = resultado.usuario?.rol || 'Ciudadano';
      const quiereAdmin = esAdmin;
      const tieneRolAdmin = ['Admin', 'Administrador'].includes(rol);

      if (quiereAdmin && !tieneRolAdmin) {
        showToast('Acceso denegado. No eres administrador.', 'error');
        setCargando(false);
        return;
      }

      if (!quiereAdmin && tieneRolAdmin) {
        showToast('Usa el acceso administrador para esta cuenta.', 'warning');
        limpiarClave();
        setCargando(false);
        return;
      }

      saveSession({ usuario: resultado.usuario, token: resultado.token });
      localStorage.setItem('usuarioCiudadano', JSON.stringify(resultado.usuario));
      showToast(`Bienvenido, ${resultado.usuario.nombre}.`, 'success');
      navigate(quiereAdmin ? '/admin' : '/panel');
    } catch (error) {
      showToast('No hay conexion con el servidor en este momento.', 'error');
    } finally {
      setCargando(false);
    }
  };

  const manejarVerificacion = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const respuesta = await apiFetch('/api/registro/verificar', {
        method: 'POST',
        body: JSON.stringify({ correo, codigo: codigoVerificacion }),
      });
      const resultado = await respuesta.json();
      
      if (!respuesta.ok) {
        showToast(resultado.error || 'Código incorrecto o expirado.', 'error');
        setCargando(false);
        return;
      }
      
      showToast('Cuenta creada y verificada con éxito. Ya puedes iniciar sesión.', 'success');
      setPasoVerificacion(false);
      setModo('ciudadano');
      limpiarClave();
      setCodigoVerificacion('');
    } catch (error) {
      showToast('No hay conexion con el servidor.', 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <section className="login-aside">
          <img src={logoImg} alt="Logo TRIN.PE" className="login-logo" />
          <span className="section-label">Acceso seguro</span>
          <h1>Elige como quieres entrar a Trin-Pe</h1>
          <p>
            El ciudadano consulta y guarda guias. El administrador gestiona el catalogo,
            entidades, reportes y metricas internas.
          </p>
          <div className="login-feature-list">
            <span>Catalogo centralizado</span>
            <span>Favoritos por usuario</span>
            <span>Panel interno protegido</span>
          </div>
        </section>

        <section className="login-card">
          <div className="login-tabs" role="tablist" aria-label="Tipo de acceso">
            <button
              type="button"
              className={modo === 'ciudadano' ? 'active' : ''}
              onClick={() => setModo('ciudadano')}
            >
              Ciudadano
            </button>
            <button
              type="button"
              className={modo === 'admin' ? 'active' : ''}
              onClick={() => setModo('admin')}
            >
              Administrador
            </button>
            <button
              type="button"
              className={modo === 'registro' ? 'active' : ''}
              onClick={() => setModo('registro')}
            >
              Registro
            </button>
          </div>

          <h2 className="login-title">
            {esRegistro ? 'Crear cuenta ciudadana' : esAdmin ? 'Ingreso administrador' : 'Ingreso ciudadano'}
          </h2>
          <p className="login-subtitle">
            {esRegistro
              ? 'Registra tus datos para guardar guias y reportar informacion.'
              : esAdmin
                ? 'Usa una cuenta con rol Admin o Administrador.'
                : 'Entra con tu correo o DNI para continuar.'}
          </p>

          {pasoVerificacion ? (
            <form className="login-form" onSubmit={manejarVerificacion}>
              <div className="input-group">
                <label>Código de verificación</label>
                <input
                  type="text"
                  placeholder="Ej: 123456"
                  required
                  maxLength="6"
                  pattern="\d{6}"
                  value={codigoVerificacion}
                  onChange={(e) => setCodigoVerificacion(e.target.value.replace(/\D/g, ''))}
                  style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '20px', fontWeight: 'bold' }}
                />
                <p style={{ fontSize: '12.5px', color: '#555', marginTop: '10px' }}>
                  Hemos enviado un código a <strong>{correo}</strong>.<br/>Puede tardar un par de minutos.
                </p>
              </div>
              <button type="submit" className="btn-ciudadano" disabled={cargando || codigoVerificacion.length !== 6}>
                {cargando ? 'Verificando...' : 'Completar registro'}
              </button>
              <div className="login-actions" style={{ marginTop: '15px' }}>
                <button type="button" onClick={() => setPasoVerificacion(false)}>Volver a corregir datos</button>
              </div>
            </form>
          ) : (
            <form className="login-form" onSubmit={manejarEnvio}>
              {esRegistro && (
                <>
                  <div className="input-group">
                    <label>Nombre completo</label>
                    <input type="text" placeholder="Ej: Juan Perez" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
                  </div>
                  <div className="input-row compact">
                    <div className="input-group">
                      <label>DNI</label>
                      <input type="text" placeholder="8 digitos" required pattern="\d{8}" maxLength="8" minLength="8" title="El DNI debe tener exactamente 8 números" value={dni} onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))} />
                    </div>
                    <div className="input-group">
                      <label>Celular</label>
                      <input type="text" placeholder="9 digitos" required pattern="\d{9}" maxLength="9" minLength="9" title="El Celular debe tener exactamente 9 números" value={celular} onChange={(e) => setCelular(e.target.value.replace(/\D/g, ''))} />
                    </div>
                  </div>
                </>
              )}

            <div className="input-group">
              <label>{esRegistro ? 'Correo electronico' : 'Correo o DNI'}</label>
              <input
                type="text"
                placeholder={esRegistro ? 'usuario@gmail.com' : 'usuario@gmail.com o DNI'}
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Contrasena</label>
              <input
                type="password"
                placeholder="********"
                required
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
              />
            </div>

            {esRegistro && (
              <div className="checkbox-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start', marginTop: '5px', marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 'normal', color: '#555', flexDirection: 'row' }}>
                  <input type="checkbox" required checked={terminos} onChange={(e) => setTerminos(e.target.checked)} style={{ width: 'auto', margin: 0 }} />
                  <span>Acepto los <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalTerminos(true); }} style={{ color: '#0056b3', textDecoration: 'underline' }}>términos y condiciones</span></span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 'normal', color: '#555', flexDirection: 'row' }}>
                  <input type="checkbox" required checked={privacidad} onChange={(e) => setPrivacidad(e.target.checked)} style={{ width: 'auto', margin: 0 }} />
                  <span>Acepto la <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalPrivacidad(true); }} style={{ color: '#0056b3', textDecoration: 'underline' }}>política de privacidad de datos</span></span>
                </label>
              </div>
            )}

            <button type="submit" className={esAdmin ? 'btn-admin-submit' : 'btn-ciudadano'} disabled={cargando || (esRegistro && (!terminos || !privacidad))}>
              {cargando ? 'Procesando...' : esRegistro ? 'Crear cuenta' : esAdmin ? 'Entrar al panel admin' : 'Entrar al portal'}
            </button>
          </form>
          )}

          <div className="login-actions">
            {!esRegistro ? (
              <button type="button" onClick={() => setModo('registro')}>Crear cuenta ciudadana</button>
            ) : (
              !pasoVerificacion && <button type="button" onClick={() => setModo('ciudadano')}>Ya tengo cuenta</button>
            )}
            <button type="button" onClick={() => navigate('/')}>Volver al inicio</button>
          </div>
        </section>
      </div>

      {modalTerminos && (
        <div className="report-modal-backdrop" onClick={() => setModalTerminos(false)} style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="report-modal" onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>Términos y Condiciones</h3>
            <p style={{ lineHeight: '1.6', color: '#555' }}>Bienvenido a Trámite Inteligente Perú. Al utilizar nuestra plataforma, aceptas cumplir con nuestros términos de servicio. El uso de la plataforma es bajo tu propia responsabilidad. Nos reservamos el derecho de modificar estos términos en cualquier momento. La información proporcionada tiene fines orientativos y no sustituye la asesoría legal oficial de las entidades gubernamentales.</p>
            <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setModalTerminos(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#0056b3', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {modalPrivacidad && (
        <div className="report-modal-backdrop" onClick={() => setModalPrivacidad(false)} style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="report-modal" onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>Política de Privacidad de Datos</h3>
            <p style={{ lineHeight: '1.6', color: '#555' }}>En Trámite Inteligente Perú nos tomamos muy en serio tu privacidad. Los datos personales que proporciones (como DNI, correo electrónico y celular) se utilizarán exclusivamente para gestionar tu cuenta y mejorar tu experiencia.</p>
            <p style={{ lineHeight: '1.6', color: '#555' }}>No compartiremos tu información con terceros sin tu consentimiento expreso, en estricto cumplimiento con la Ley de Protección de Datos Personales del Perú.</p>
            <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setModalPrivacidad(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#0056b3', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
