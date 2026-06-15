import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Barra de Navegación / Navbar */}
      <nav className="navbar">
        <div className="nav-logo">TRIN.PE</div>
        <ul className="nav-links">
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#proyecto">El Proyecto</a></li>
          <li><a href="#calculos">Módulo de Ingeniería</a></li>
        </ul>
      </nav>

      {/* Encabezado Principal / Hero Section */}
      <header className="hero-section">
        <h1>Bienvenidos a TRIN.PE</h1>
        <p>Plataforma de Ingeniería y Gestión Web Avanzada</p>
        <a href="#calculos" className="btn-principal">Comenzar</a>
      </header>

      {/* Sección del 60% Funcional (Aquí irá la lógica de tu aplicación) */}
      <section id="calculos" className="contenido-section">
        <h2>Módulo Funcional - Sprint 1</h2>
        <p>Aquí implementaremos el núcleo lógico de la aplicación web según el backlog.</p>
        
        {/* Espacio para el formulario o calculadora de tu carrera */}
        <div className="card-funcional">
          <h3>[Área de Trabajo de Ingeniería]</h3>
          <p>Pronto: Formulario interactivo y procesamiento de datos.</p>
        </div>
      </section>
    </div>
  );
}

export default App;