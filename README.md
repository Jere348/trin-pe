# 🚀 Trámite Inteligente (Trin-Pe)

Plataforma integral de digitalización y gestión de trámites estatales peruanos, diseñada para optimizar la interacción entre el ciudadano y las instituciones públicas mediante una interfaz intuitiva, eficiente y basada en datos.

## 🧐 Descripción del Problema
Actualmente, los ciudadanos enfrentan una burocracia fragmentada: información desactualizada, procesos opacos, falta de digitalización y una pobre atención al usuario. El tiempo promedio invertido en consultas manuales es excesivo, generando frustración y una baja tasa de éxito en las gestiones ante entidades públicas (RENIEC, SUNARP, MTC, etc.).

## 💡 Nuestra Solución
**Trin-Pe** es un sistema Full-Stack que centraliza la información de trámites. Ofrece:
* **Buscador Inteligente:** Algoritmo predictivo para encontrar trámites por entidad o palabra clave.
* **Gestión Documental:** Acceso directo a formatos oficiales en la nube (PDF).
* **Panel de Ciudadano:** Perfil personalizado con guías guardadas (favoritos).
* **Panel de Administración (Observabilidad):** Dashboard profesional para gestionar el catálogo y monitorear fallas mediante alertas en tiempo real.

## 🛠️ Stack Tecnológico
* **Frontend:** React.js, React Router, CSS3 (Flexbox/Grid).
* **Backend:** Node.js con Express.js (Arquitectura REST).
* **Base de Datos:** PostgreSQL alojado en Supabase.
* **Storage:** Supabase Storage (Almacenamiento de formatos).
* **Despliegue:** Vercel (Frontend) y Render (Backend).

## 📊 Ciclo de Desarrollo (Sprint 1)
Este proyecto fue desarrollado bajo una metodología ágil en ciclos de trabajo intenso. El enfoque principal del Sprint 1 fue la **robustez y la escalabilidad**:

1. **Arquitectura de Datos:** Diseño de esquemas relacionales para usuarios, trámites, entidades, métricas y reportes.
2. **API RESTful:** Desarrollo de endpoints para operaciones CRUD completas y comunicación eficiente.
3. **Seguridad:** Implementación de encriptación (`bcrypt`) para credenciales y autenticación basada en estado.
4. **Observabilidad:** Implementación de un sistema de detección de fallos y reportes ciudadanos para el Admin.
5. **Despliegue Continuo (CI/CD):** Configuración de repositorios conectados a la nube para despliegue automático.

## 💻 Instalación y Configuración
Para ejecutar este entorno en tu máquina local:

1. **Clonar los repositorios:**
```bash
   git clone [https://github.com/Jere348/trin-pe.git](https://github.com/Jere348/trin-pe.git)
   git clone [https://github.com/Jere348/trin-pe-backend.git](https://github.com/Jere348/trin-pe-backend.git)
