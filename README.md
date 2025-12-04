# ⚜️ Pukara Weche - Plataforma de Gestión Scout

![Estado del Proyecto](https://img.shields.io/badge/Estado-En_Desarrollo-blue)
![Scout](https://img.shields.io/badge/Siempre-Listos-purple)

## ⛺ Sobre el Proyecto

Este proyecto nace desde el corazón y la gratitud hacia mi querido **Grupo Scout Pukara Weche**. La misión es simple pero poderosa: poner la tecnología al servicio del escultismo. 

Mi intención es facilitar las tareas administrativas y logísticas que, aunque necesarias, muchas veces consumen el tiempo valioso de nuestros dirigentes. Al digitalizar y organizar la gestión del grupo, buscamos que el equipo pueda enfocar sus energías en lo que realmente importa: educar, jugar, compartir y construir un mundo mejor junto a los niños y jóvenes. Es mi forma de decir "Servir" y dejar nuestro grupo un poco mejor de lo que lo encontramos.

---

## 🚀 ¿Qué hace esta plataforma?

La aplicación funciona como un centro de comando digital para el grupo, ofreciendo soluciones sencillas a problemas cotidianos:

* 🌲 **Gestión de Ramas y Unidades:** Visualización clara de las distintas secciones del grupo (Manada, Compañía, Tropa, Ruta).
* 🧑‍🤝‍🧑 **Control de Miembros:** Registro organizado de beneficiarios (scouts) y sus apoderados, facilitando el contacto y la seguridad.
* 📦 **Inventario y Logística:** ¡Adiós al caos en bodega! Sistema para controlar dónde están las carpas, ollas y materiales de campamento.
* 📅 **Calendario de Eventos:** Planificación centralizada de reuniones, salidas y campamentos.

---

## 🛠️ Especificaciones Técnicas

Este proyecto está construido utilizando una arquitectura moderna de **Monorepo**, separando la lógica de negocio de la interfaz visual para un rendimiento óptimo.

### 🎨 Frontend (La parte visual)
* **React + Vite:** Para una experiencia de usuario ultra rápida y fluida.
* **CSS-in-JS:** Estilos modernos y responsivos (adaptables a celular y PC).
* **Javascript (ES6+):** Lógica de interacción dinámica.

### ⚙️ Backend (El motor)
* **Java + Spring Boot:** Un servidor robusto y seguro para manejar todos los datos.
* **REST API:** Comunicación eficiente entre el servidor y la página web.
* **Base de Datos:** (SQL) Para el almacenamiento seguro de la información del grupo.

---

## 💻 Cómo ejecutar el proyecto (Entorno de Desarrollo)

Como es un proyecto dividido, necesitas correr dos terminales simultáneamente:

**1. Servidor Backend:**
```bash
cd backend
# Comando para iniciar SpringBoot (ejemplo)
./mvnw spring-boot:run

**2. Cliente Frontend:**

cd frontend
npm run dev

"El verdadero camino para conseguir la felicidad pasa por hacer felices a los demás. Intentad dejar este mundo un poco mejor de como os lo encontrasteis." > — Baden-Powell

Desarrollado con ❤️ para Pukara Weche - 2025