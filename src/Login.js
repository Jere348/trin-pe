import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from './assets/logo.png';
import './App.css';

function Login() {
  const navigate = useNavigate();
  const [esRegistro, setEsRegistro] = useState(false);

  // Memorias para los campos del formulario
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [celular, setCelular] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');

  // Función que se ejecuta al presionar "Registrarme" o "Iniciar Sesión"
  const manejarEnvio = async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    // Decidimos a qué ruta del backend enviar los datos
// Decidimos a qué ruta del backend en la nube enviar los datos
const url = esRegistro 
    ? 'https://trin-pe-backend.onrender.com/api/registro' 
    : 'https://trin-pe-backend.onrender.com/api/login';    // Empaquetamos los datos según el modo
    const datosAEnviar = esRegistro 
      ? { nombre, dni, celular, correo, contrasena } 
      : { correo_dni: correo, contrasena };

    try {
      // Enviamos la petición al servidor (Node.js)
      const respuesta = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosAEnviar),
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        // Si el servidor responde con éxito (Status 200)
        alert(resultado.mensaje);
        if (!esRegistro) {
          navigate('/panel'); // <--- ¡AQUÍ ESTÁ EL CAMBIO CLAVE!
        } else {
          setEsRegistro(false); // Si fue registro exitoso, lo pasamos a la pantalla de login
        }
      } else {
        // Si hay error (ej. DNI duplicado, contraseña incorrecta)
        alert('Error: ' + resultado.error);
      }
    } catch (error) {
      alert('Error de conexión. Asegúrate de que el servidor Backend esté encendido.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img src={logoImg} alt="Logo" className="login-logo" />
        <h2 className="login-title">{esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>

        {/* Agregamos el evento onSubmit al formulario */}
        <form className="login-form" onSubmit={manejarEnvio}>
          {esRegistro && (
            <>
              <div className="input-group">
                <label>Nombre Completo</label>
                <input type="text" placeholder="Ej: Juan Pérez" required={esRegistro} value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div className="input-group">
                <label>DNI</label>
                <input type="text" placeholder="Número de 8 dígitos" required={esRegistro} value={dni} onChange={(e) => setDni(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Número de Celular</label>
                <input type="text" placeholder="999 999 999" required={esRegistro} value={celular} onChange={(e) => setCelular(e.target.value)} />
              </div>
            </>
          )}

          <div className="input-group">
            <label>{esRegistro ? 'Correo Electrónico' : 'Correo / DNI'}</label>
            <input type="text" placeholder={esRegistro ? "usuario@gmail.com" : "usuario@gmail.com o DNI"} required value={correo} onChange={(e) => setCorreo(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input type="password" placeholder="••••••••" required value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
          </div>

          {!esRegistro ? (
            <div className="login-buttons-row">
              <button type="submit" className="btn-ciudadano">Ciudadano</button>
              <button type="button" className="btn-admin" onClick={() => navigate('/admin')}>Admin</button>
            </div>
          ) : (
            <button type="submit" className="btn-ciudadano" style={{ width: '100%' }}>Registrarme</button>
          )}
        </form>

        <p className="login-switch-text">
          {esRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          <span onClick={() => setEsRegistro(!esRegistro)}>
            {esRegistro ? ' Inicia sesión aquí' : ' Regístrate aquí'}
          </span>
        </p>

        <button className="btn-volver" onClick={() => navigate('/')}>
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
}

export default Login;