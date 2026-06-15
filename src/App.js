import React,{ useState } from 'react';
import './App.css';
import logoImg from './assets/logo.png';
import heroImg from './assets/hero.jpg';
import perfil1 from './assets/perfil1.png'; // Cambia .jpg por .png si es necesario
import perfil2 from './assets/perfil2.png';
import perfil3 from './assets/perfil3.png';

function App() {
  // --- INICIO DEL NUEVO CÓDIGO ---
  // Creamos estados para guardar lo que el usuario escribe
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Verificamos si los 3 campos tienen texto (ninguno está vacío)
  const formularioLleno = nombre.trim() !== '' && correo.trim() !== '' && mensaje.trim() !== '';
  // --- FIN DEL NUEVO CÓDIGO ---

  return (
    <div className="App">
      {/* NAVEGACIÓN */}
      <nav className="navbar">
          <img src={logoImg} alt="Logo TRIN.PE" className="logo-img" />        <ul className="nav-links">
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#catalogo">Catálogo de Trámites</a></li>
          <li><a href="#comofunciona">Cómo funciona</a></li>
          <li><a href="#beneficios">Beneficios</a></li>
          <li><a href="#testimonios">Testimonios</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
        <button className="btn-login">Iniciar sesión</button>
      </nav>

      {/* HERO SECTION */}
      <header id="inicio" className="hero-section">
        <div className="hero-text">
          <h1>Simplifica tus trámites en Perú</h1>
          <p>Toda la información que necesitas, paso a paso y en un solo lugar.</p>
          <div className="hero-buttons">
            <button className="btn-primary">Buscar trámite</button>
            <button className="btn-secondary">Ver catálogo</button>
          </div>
        </div>
        <div className="hero-image-container">
          <img src={heroImg} alt="Trámites en Perú" className="hero-img-real" />
        </div>
      </header>

      {/* CÓMO FUNCIONA */}
      <section id="comofunciona" className="steps-section">
        <h2 className="section-subtitle">CÓMO FUNCIONA - 3 PASOS</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-info">
              <h3>Busca tu trámite</h3>
              <p>Encuentra el trámite que necesitas de forma rápida y sencilla.</p>
            </div>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-info">
              <h3>Sigue los pasos</h3>
              <p>Te guiamos paso a paso con requisitos, costos y tiempos.</p>
            </div>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-info">
              <h3>Completa tu trámite</h3>
              <p>Evita errores y ahorra tiempo con nuestra guía inteligente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* POR QUÉ ELEGIRNOS */}
      <section id="beneficios" className="benefits-section">
        <h2 className="section-subtitle">POR QUÉ ELEGIRNOS?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <h3>Menos errores</h3>
            <p>Alertas y validaciones automáticas para evitar rechazos.</p>
          </div>
          <div className="benefit-card">
            <h3>Predicción de tiempo</h3>
            <p>Conoce el tiempo estimado real de tus trámites.</p>
          </div>
          <div className="benefit-card">
            <h3>Guía paso a paso</h3>
            <p>Explicaciones claras y fáciles de seguir en cada paso.</p>
          </div>
          <div className="benefit-card">
            <h3>Información confiable</h3>
            <p>Datos actualizados de entidades oficiales.</p>
          </div>
        </div>
      </section>

     {/* TESTIMONIOS */}
      <section id="testimonios" className="testimonials-section">
        <h2 className="section-subtitle">TESTIMONIOS</h2>
        <div className="testimonials-grid">
          
          <div className="testimonial-card">
            {/* Reemplazo 1 */}
            <img src={perfil1} alt="José R." className="avatar-img" />
            <p>"Muy útil y fácil de usar. Me ayudó a ahorrar mucho tiempo en mis trámites."</p>
            <span>- José R.</span>
          </div>

          <div className="testimonial-card">
            {/* Reemplazo 2 */}
            <img src={perfil2} alt="María G." className="avatar-img" />
            <p>"Las guías son claras y las alertas me evitaron muchos errores. Excelente plataforma."</p>
            <span>- María G.</span>
          </div>

          <div className="testimonial-card">
            {/* Reemplazo 3 */}
            <img src={perfil3} alt="Carlos M." className="avatar-img" />
            <p>"Ahora sé cuánto tiempo tardará mi trámite. Muy recomendado."</p>
            <span>- Carlos M.</span>
          </div>

        </div>
      </section>

      {/* FORMULARIO DE CONTACTO */}
      <section id="contacto" className="contact-section">
        <div className="contact-text">
          <h2>Tienes dudas?</h2>
          <p>Escríbenos y te ayudamos.</p>
        </div>
        <form className="contact-form">
          <input 
            type="text" 
            placeholder="Nombre" 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input 
            type="email" 
            placeholder="Correo electrónico" 
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <textarea 
            placeholder="Mensaje" 
            rows="4"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
          ></textarea>
          
          {/* El botón ahora cambia de clase si el formulario está lleno */}
          <button 
            type="button" 
            className={`btn-send ${formularioLleno ? 'btn-active' : ''}`}
            disabled={!formularioLleno}
          >
            Enviar mensaje
          </button>
        </form>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-brand">
        <img src={logoImg} alt="Logo Trámite Inteligente" className="logo-img-small" />          <p className="brand-name">Trámite Inteligente Perú</p>
          <p className="copyright">© 2026 Todos los derechos reservados.</p>
        </div>
        <div className="footer-links">
          <h4>ENLACES</h4>
          <ul>
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#catalogo">Catálogo de Trámites</a></li>
            <li><a href="#comofunciona">Cómo funciona</a></li>
            <li><a href="#beneficios">Beneficios</a></li>
            <li><a href="#contacto">Contacto</a></li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>RECURSOS</h4>
          <ul>
            <li><a href="#faq">Preguntas frecuentes</a></li>
            <li><a href="#terminos">Términos y condiciones</a></li>
            <li><a href="#privacidad">Política de privacidad</a></li>
          </ul>
        </div>
        <div className="footer-social">
          <h4>SÍGUENOS</h4>
          <div className="social-icons">
            <span className="icon">FB</span>
            <span className="icon">IG</span>
            <span className="icon">LI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;