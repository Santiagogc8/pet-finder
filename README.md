# 🐾 Pet Finder App

Una Single Page Application (SPA) diseñada para ayudar a reunir mascotas perdidas con sus dueños. Permite a los usuarios reportar avistamientos, publicar mascotas perdidas y contactar a otros usuarios de forma segura.

---

## 🔗 Enlaces Importantes

- **📱 Aplicación Desplegada:** https://vanilla-pet-finder.onrender.com
- **📄 Documentación de la API:** https://documenter.getpostman.com/view/48981749/2sB3dTtnrn

---

## 🚀 Características Principales

* **Autenticación Segura:** Registro e inicio de sesión con tokens y recuperación de contraseña vía email.
* **Geolocalización:** Reporte de mascotas basado en ubicación geográfica.
* **Búsqueda Inteligente:** Encuentra mascotas cercanas a ti.
* **Reportes en Tiempo Real:** Sistema de emails transaccionales para notificar avistamientos.

## 🛠️ Stack Tecnológico

**Frontend:**
* TypeScript
* Web Components (Nativos)
* Router basado en History API
* CSS con Shadow DOM

**Backend:**
* Node.js
* Sequelize (PostgreSQL)
* **Integraciones:** Algolia (Búsqueda), Resend (Emails)

---

## 💻 Instalación y Uso Local

1.  **Clonar el repositorio**
    ```bash
    git clone https://github.com/Santiagogc8/pet-finder.git
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**
    Crea un archivo `.env` en la raíz basado en el `.env.example`:
    ```env
    DATABASE_URL=...
    ALGOLIA_API_KEY=...
    RESEND_API_KEY=...
    ```

4.  **Iniciar el proyecto**
    ```bash
    npm run dev
    ```