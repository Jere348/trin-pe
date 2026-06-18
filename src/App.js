import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './Login';
import './App.css';
import logoImg from './assets/logo.png';
import heroImg from './assets/hero.jpg';
import perfil1 from './assets/perfil1.png';
import perfil2 from './assets/perfil2.png';
import perfil3 from './assets/perfil3.png';
import PanelCiudadano from './PanelCiudadano';
import PanelAdmin from './PanelAdmin';

function Inicio() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');

  const formularioLleno = nombre.trim() !== '' && correo.trim() !== '' && mensaje.trim() !== '';

  return (
    <div className="App">

      {/* ── NAVEGACIÓN ─────────────────────────────────── */}
      <nav className="navbar">
        <img src={logoImg} alt="Logo TRIN.PE" className="logo-img" />
        <ul className="nav-links">
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#comofunciona">Cómo funciona</a></li>
          <li><a href="#beneficios">Beneficios</a></li>
          <li><a href="#testimonios">Testimonios</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
        <button className="btn-login" onClick={() => navigate('/login')}>
          Iniciar sesión
        </button>
      </nav>

      {/* ── HERO SECTION ───────────────────────────────── */}
      <header id="inicio" className="hero-section">
        <div className="hero-text">
          <div className="hero-eyebrow">Plataforma de trámites gubernamentales</div>
          <h1>
            Simplifica tus trámites<br />
            en <em>Perú</em>, sin complicaciones
          </h1>
          <p>
            Toda la información actualizada que necesitas, paso a paso y en un solo lugar.
            Sin colas, sin confusión.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/login')}>
              Buscar trámite
            </button>
            <button className="btn-secondary" onClick={() => navigate('/login')}>
              Ver catálogo
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>+2,400</strong>
              <span>Trámites guiados</span>
            </div>
            <div className="hero-stat">
              <strong>98%</strong>
              <span>Satisfacción</span>
            </div>
            <div className="hero-stat">
              <strong>–60%</strong>
              <span>Menos tiempo</span>
            </div>
          </div>
        </div>
        <div className="hero-image-container">
          <img src={heroImg} alt="Trámites en Perú" className="hero-img-real" />
        </div>
      </header>

      {/* ── CÓMO FUNCIONA ──────────────────────────────── */}
      <section id="comofunciona" className="steps-section">
        <div className="section-header">
          <span className="section-label">El proceso</span>
          <h2>Completa tu trámite en 3 pasos</h2>
          <p>Sin sorpresas ni formularios interminables. Te llevamos de la mano.</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-info">
              <h3>Busca tu trámite</h3>
              <p>Encuentra el trámite que necesitas de forma rápida con nuestro buscador inteligente.</p>
            </div>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-info">
              <h3>Sigue los pasos</h3>
              <p>Te guiamos paso a paso con requisitos exactos, costos actualizados y tiempos reales.</p>
            </div>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-info">
              <h3>Completa sin errores</h3>
              <p>Validaciones automáticas para que tu trámite no sea rechazado. Ahorra tiempo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFICIOS ─────────────────────────────────── */}
      <section id="beneficios" className="benefits-section">
        <div className="section-header">
          <span className="section-label">¿Por qué elegirnos?</span>
          <h2>Todo lo que necesitas, sin lo que no</h2>
          <p>Diseñado para ciudadanos, no para burócratas.</p>
        </div>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">✅</div>
            <h3>Menos errores</h3>
            <p>Alertas y validaciones automáticas para evitar rechazos en ventanilla.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">⏱️</div>
            <h3>Tiempo real estimado</h3>
            <p>Conoce cuánto tardará tu trámite antes de comenzar, sin sorpresas.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">📋</div>
            <h3>Guía paso a paso</h3>
            <p>Instrucciones claras y en lenguaje sencillo en cada etapa del proceso.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🏛️</div>
            <h3>Fuentes oficiales</h3>
            <p>Información verificada y actualizada directamente de entidades del Estado.</p>
          </div>
        </div>
      </section>

      {/* ── BANNER CTA ─────────────────────────────────── */}
      <section className="cta-section">
        <h2>¿Listo para simplificar tus trámites?</h2>
        <p>Únete a miles de ciudadanos que ya ahorran tiempo con TRIN.PE</p>
        <button className="btn-cta" onClick={() => navigate('/login')}>
          Empezar ahora — es gratis
        </button>
      </section>

      {/* ── TESTIMONIOS ────────────────────────────────── */}
      <section id="testimonios" className="testimonials-section">
        <div className="section-header">
          <span className="section-label">Testimonios</span>
          <h2>Lo que dicen nuestros usuarios</h2>
        </div>
        <div className="testimonials-grid">

          <div className="testimonial-card">
            <img src={perfil1} alt="José R." className="avatar-img" />
            <div className="testimonial-stars">★★★★★</div>
            <p>"Muy útil y fácil de usar. Me ayudó a ahorrar mucho tiempo en mis trámites. Ya no tengo que ir a la municipalidad tres veces."</p>
            <span className="testimonial-author">José R.</span><br />
            <span className="testimonial-role">Emprendedor, Lima</span>
          </div>

          <div className="testimonial-card">
            <img src={perfil2} alt="María G." className="avatar-img" />
            <div className="testimonial-stars">★★★★★</div>
            <p>"Las guías son claras y las alertas me evitaron muchos errores. Pude hacer mi trámite de primera sin que me rechacen nada."</p>
            <span className="testimonial-author">María G.</span><br />
            <span className="testimonial-role">Contadora, Arequipa</span>
          </div>

          <div className="testimonial-card">
            <img src={perfil3} alt="Carlos M." className="avatar-img" />
            <div className="testimonial-stars">★★★★★</div>
            <p>"Ahora sé exactamente cuánto tiempo tardará mi trámite antes de empezar. Me organizo mucho mejor. Muy recomendado."</p>
            <span className="testimonial-author">Carlos M.</span><br />
            <span className="testimonial-role">Ingeniero, Trujillo</span>
          </div>

        </div>
      </section>

      {/* ── FORMULARIO DE CONTACTO ─────────────────────── */}
      <section id="contacto" className="contact-section">
        <div className="contact-text">
          <span className="section-label">Contacto</span>
          <h2>¿Tienes dudas?</h2>
          <p>
            Estamos aquí para ayudarte. Escríbenos y te respondemos
            en menos de 24 horas hábiles.
          </p>
          <div className="contact-info-items">
            <div className="contact-info-item">
              <span className="contact-info-icon">📧</span>
              soporte@trin.pe
            </div>
            <div className="contact-info-item">
              <span className="contact-info-icon">🕐</span>
              Lun – Vie, 8am – 6pm
            </div>
            <div className="contact-info-item">
              <span className="contact-info-icon">📍</span>
              Lima, Perú
            </div>
          </div>
        </div>
        <form className="contact-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>
          <textarea
            placeholder="¿En qué podemos ayudarte?"
            rows="5"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
          ></textarea>
          <button
            type="button"
            className={`btn-send ${formularioLleno ? 'btn-active' : ''}`}
            disabled={!formularioLleno}
          >
            {formularioLleno ? 'Enviar mensaje →' : 'Completa el formulario'}
          </button>
        </form>
      </section>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <img src={logoImg} alt="Logo Trámite Inteligente" className="logo-img-small" />
            <p className="brand-tagline">
              La plataforma más completa para gestionar tus trámites
              gubernamentales en Perú.
            </p>
            <div className="social-icons">
              <span className="icon" title="Facebook">FB</span>
              <span className="icon" title="Instagram">IG</span>
              <span className="icon" title="LinkedIn">LI</span>
            </div>
          </div>

          <div className="footer-links">
            <h4>Plataforma</h4>
            <ul>
              <li><a href="#inicio">Inicio</a></li>
              <li><a href="#catalogo">Catálogo</a></li>
              <li><a href="#comofunciona">Cómo funciona</a></li>
              <li><a href="#beneficios">Beneficios</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Soporte</h4>
            <ul>
              <li><a href="#faq">Preguntas frecuentes</a></li>
              <li><a href="#contacto">Contacto</a></li>
              <li><a href="#terminos">Términos y condiciones</a></li>
              <li><a href="#privacidad">Privacidad</a></li>
            </ul>
          </div>

          <div className="footer-social footer-links">
            <h4>Institucional</h4>
            <ul>
              <li><a href="#nosotros">Sobre nosotros</a></li>
              <li><a href="#prensa">Prensa</a></li>
              <li><a href="#alianzas">Alianzas</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">© 2026 Trámite Inteligente Perú · Todos los derechos reservados.</p>
          <div className="footer-badges">
            <span className="footer-badge">🔒 Datos seguros</span>
            <span className="footer-badge">🏛️ Información oficial</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/panel" element={<PanelCiudadano />} />
        <Route path="/admin" element={<PanelAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;