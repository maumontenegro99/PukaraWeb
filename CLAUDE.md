# CLAUDE.md — PukaraWeb

Contexto para retomar el proyecto en una sesión nueva. Léelo completo antes de tocar código.

## Qué es

Plataforma web del **Grupo Guía y Scout Pukara Weche** (Chile, asociado a la AGSCh). Es un proyecto personal y voluntario del dueño del repo para su grupo scout. Son **tres servicios conectados en una sola app**:

| Servicio | Ruta | Para quién | Acceso |
|---|---|---|---|
| **Portal de noticias** | `/`, `/noticias`, `/noticias/:id` | Familias, interesados, otros grupos | Público |
| **Biblioteca** | `/biblioteca`, `/biblioteca/autorizaciones` | Todos | Público, sin cuentas |
| **Panel del grupo** | `/admin/*` | Dirigentes y administración | Login (JWT) |

Conexiones entre ellos: las noticias se publican en el panel y aparecen en el portal; los documentos se suben en el panel y se descargan en la biblioteca; un evento marcado "pide autorización" aparece en la biblioteca, los apoderados suben la autorización **firmada a mano** (PDF/JPG/PNG) validada con el RUT del niño, y esas autorizaciones llegan **solo** al panel (`/admin/autorizaciones`), nunca se muestran en la biblioteca.

Decisiones ya tomadas por el usuario (no volver a preguntar): autorizaciones solo como PDF firmado (no aceptación digital); biblioteca abierta sin cuentas de apoderado; botón "Biblioteca" en el encabezado del portal igual que el de acceso al panel; Tailwind + shadcn/ui para el frontend; H2 como base de desarrollo; modo oscuro en los tres servicios.

## Cómo trabajar con el usuario

- **Escribe siempre en español**, incluidos los mensajes cortos de avance entre herramientas.
- Después de cambios visuales, **levanta la app y ábrela en el navegador** (`Start-Process "http://localhost:5173/..."`) para que el usuario la vea.
- Revisa visualmente con capturas (ver "Capturas" abajo) antes de dar algo por terminado.
- No commitees `.vscode/settings.json` (ajustes locales de la extensión Java).

## Stack

- **Backend** (`backend/`): Java 17 (se ejecuta con JDK 21), Spring Boot 3.5.8, Spring Data JPA, Spring Security + JWT (jjwt 0.11.5), Lombok, Maven wrapper. MySQL en producción, **H2 en desarrollo y pruebas**.
- **Frontend** (`frontend/`): React 19 + Vite 7, **JavaScript (sin TypeScript)**, React Router 7 (modo declarativo con `BrowserRouter`), Tailwind CSS v4, shadcn/ui (estilo `radix-nova`, base Radix, íconos `lucide-react`), sonner, DOMPurify, react-quill-new (editor de noticias), fuente Archivo variable.

## Levantar el proyecto

```bash
# Backend con H2 (no requiere MySQL; los datos persisten en backend/data/, ignorado por git)
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173
```

- Usuario del panel: `admin` / `admin123` (lo crea `config/DataInitializer`). Debe cambiarse antes de producción.
- Consola H2: http://localhost:8080/h2-console — JDBC `jdbc:h2:file:./data/pukaraweb-dev`, usuario `sa`, sin contraseña. Solo existe en el perfil `dev`.
- Datos de prueba: `DevDataSeeder` (ramas, miembros, dirigentes, inventario, eventos, noticias) y `BibliotecaDevSeeder` (documentos PDF generados). Solo se cargan si la base está vacía. Para reiniciar: detener el backend y borrar `backend/data/`.
- Pruebas: `./mvnw test` usa el perfil `test` (H2 en memoria). No requiere MySQL.
- Frontend: `npx vite build` y `npx eslint src`. Error de lint conocido y aceptado por ahora: `set-state-in-effect` en `context/AuthContext.jsx` (código original). Los avisos `react-refresh/only-export-components` en `components/ui/*` y archivos que exportan constantes son esperables.
- `VITE_API_URL` define la URL del backend (por defecto `http://localhost:8080`, ver `src/lib/api.js`).

## Backend: estructura y convenciones

Conviven dos estilos:

- **Legado, por capa técnica**: `controller/`, `service/`, `repository/`, `model/`. Entidades JPA expuestas directo en la API, `@Autowired` por campo, sin validación, `POST` con `id` para editar. Módulos: ramas, miembros, apoderados, dirigentes, adultos (sin uso), inventario (sin uso), materiales, categorías, ubicaciones, eventos, ubicaciones-eventos, noticias, usuarios, auth.
- **Nuevo, por dominio** (usar este estilo para todo código nuevo):
  - `comun/` — `AlmacenArchivos` (guarda archivos en `pukara.archivos.dir`, valida el tipo por los primeros bytes, nombre en disco = UUID), `ArchivoGuardado` (`@Embeddable` con metadatos), `Descargas` (respuesta con `Content-Disposition` y `nosniff`), `ErroresApi` (`@RestControllerAdvice` que responde `ProblemDetail`; **al crear un módulo nuevo, agrega su paquete a `basePackages`**).
  - `biblioteca/` — `Documento`, `AutorizacionFirmada`, servicios, `BibliotecaController` (`/api/biblioteca/**`) y `AutorizacionesController` (`/api/autorizaciones/**`), DTOs como `record` en `BibliotecaDtos`, `BibliotecaDevSeeder`.
  - `equipo/` — documentación de dirigentes: `DocumentoDirigente` (un archivo por tipo y dirigente), `TipoDocumentoDirigente` (al subir o borrar marca la casilla booleana correspondiente en `Dirigente`), `DocumentacionController` (`/api/dirigentes/{id}/documentos/{tipo}`).
  - Convenciones: inyección por constructor, DTO `record` (nunca entidades en la API), `ResponseStatusException` con mensajes en español para el usuario final, `@Transactional` en servicios.
- `DirigenteService.eliminar` borra primero los archivos de documentación. `EventoService.guardar` conserva `requiereAutorizacion` si el cliente no lo envía.
- Seguridad (`security/SecurityConfig`): públicos `/api/auth/**`, `GET /api/noticias/**`, `GET /api/biblioteca/**` y `POST /api/biblioteca/autorizaciones`; todo lo demás exige token. `DevH2ConsoleSecurity` abre `/h2-console` solo en `dev`. **Todavía no hay control por roles**: cualquier usuario con sesión ve todo, incluidos los certificados de antecedentes de dirigentes.
- Límite de subida: 10 MB (`spring.servlet.multipart.*`, con `resolve-lazily=true` para que el error llegue a `ErroresApi`).

## Frontend: estructura y convenciones

```
src/
  App.jsx                 rutas: PortalLayout, BibliotecaLayout, /login, /admin (PrivateRoute + AdminLayout)
  index.css               tokens de marca (claro y .dark), utilidades propias (font-display, animate-banderin,
                          animate-aparecer, fondo-*), aparición automática de tablas/tarjetas/avisos al cargar
  layouts/                PortalLayout, BibliotecaLayout, AdminLayout (sidebar de shadcn)
  pages/portal/           PortalHome, Noticias, NoticiaDetalle
  pages/biblioteca/       BibliotecaInicio, EnviarAutorizacion
  pages/admin/            AdminInicio, AdminDocumentos, AdminAutorizaciones, AdminNoticias, EditorNoticia
  pages/                  Ramas, Miembros, Equipo (dirigentes), Inventario, Eventos, Login (ya migradas)
  components/ui/          shadcn (no editar a mano salvo necesidad; se agregan con `npx shadcn@latest add`)
  components/admin/       AppSidebar, NavUser, Encabezado, RamaBadge, ConfirmarEliminar, SelectConNuevo,
                          DocumentacionDirigente
  components/brand/       Banderines, BanderinRama, FondoFacetado
  context/                AuthContext (token en localStorage), TemaContext (claro/oscuro/sistema)
  lib/                    api.js, panel.js (api(), useDatosPanel(), abrirArchivoProtegido(), calcularEdad, incluye),
                          biblioteca.js, documentacion.js, ramas.js, utils.js (cn)
```

- Llamadas del panel: `api(ruta, { method, body })` de `lib/panel.js` (añade el token, acepta `FormData`, lanza `Error` con el `detail` del backend). Carga de varias rutas: `useDatosPanel({ clave: '/api/...' })` → `{ clave, estado, recargar }`.
- Archivos protegidos (autorizaciones, documentos de dirigentes): `abrirArchivoProtegido(ruta)`.
- Reglas de shadcn que se siguen: formularios con `FieldGroup`/`Field`, `gap-*` en vez de `space-*`, colores semánticos (`bg-primary`, `text-muted-foreground`), íconos en botones con `data-icon`, diálogos siempre con título, `Empty`/`Alert`/`Skeleton`/`Badge` en vez de markup propio, notificaciones con `toast` de sonner.
- Textos de la interfaz en español, voz activa, sin emojis como íconos, errores que dicen qué pasó y qué hacer.
- ESLint marca como "sin uso" un componente recibido como parámetro desestructurado (`icon: Icon`); la solución usada es asignarlo a una constante con mayúscula dentro del cuerpo.

### Identidad visual

- Colores: celeste del pañolín `--celeste #16afd6` (fondos y botones), `--celeste-ink` para texto y enlaces (contraste suficiente), `--grafito #1d2429` (insignia), `--contraste` (grafito en claro, casi blanco en oscuro; lo usan los banderines). Colores de estandarte por rama en `lib/ramas.js` y `--color-rama-*`.
- Tipografía: Archivo variable; títulos con `font-display` (condensado, 800, mayúsculas), como el rótulo de la insignia.
- Motivo propio: **banderines** (la guirnalda celeste/grafito/gris del campamento). `FondoFacetado` = foto del grupo vista a través de un vidrio de triángulos, con reflejo y grano animados.
- **Privacidad**: la foto del hero y del login se usa **ya difuminada desde el archivo** (`assets/fondo-scout-difuminado.jpg`) para que los rostros no sean recuperables. `fondo-scout.jpg` (nítida) sigue en el repo pero no se importa en ningún lado: no volver a usarla en la app.
- Modo oscuro: clase `.dark` en `<html>`; `index.html` la aplica antes de pintar según `localStorage.tema`. Selector en los tres encabezados y en el login (`components/SelectorTema`).
- Transiciones: `TransicionRuta` vuelve a montar el contenido con `animate-aparecer` al cambiar el `pathname`. Todo respeta `prefers-reduced-motion`.

## Pendientes (en orden sugerido)

1. **Fase 1 de seguridad** (lo más urgente antes de publicar):
   - `GET /api/usuarios/perfil` devuelve la entidad `Usuario` con el hash de la contraseña → usar un DTO.
   - Aplicar roles (`ADMIN`, `DIRIGENTE_GUIADORA`, `APODERADO` ya existen en `Rol`): restringir documentación de dirigentes y autorizaciones.
   - Sacar secretos del código: clave JWT en `JwtUtil`, `root/root` de MySQL, `admin/admin123` (y que no se imprima en consola).
   - Mass assignment: las entidades legadas reciben JSON directo y `POST` con `id` sobrescribe.
   - `Rama.miembros` tiene `cascade = ALL` (borrar una rama borra sus miembros).
   - `JwtFilter` lanza excepción con tokens vencidos o mal formados en vez de responder 401.
   - Límite de envíos por minuto en `POST /api/biblioteca/autorizaciones` (es público).
2. Mensajes claros al borrar registros con dependencias (evento con autorizaciones, miembro con autorizaciones): hoy responde un error genérico.
3. Imágenes de noticias: hoy van en base64 dentro de la base (`Noticia.imagenUrl` LONGTEXT) → moverlas a `AlmacenArchivos`.
4. **Módulo de pagos** (cuotas, campamentos). Usar la skill `webshop-payments`.
5. Migrar el backend legado al estilo por dominio (DTOs, validación con `@Valid`, `PUT` para editar) y eliminar `Adulto` e `Inventario`, que no se usan.
6. Dividir el bundle del frontend (`React.lazy` para el panel) y agregar Flyway para migraciones.
7. Autorización antigua de prueba con nombre "Jorge P?rez" en la base de desarrollo (oculta; se puede borrar desde la consola H2).

## Particularidades del entorno (Windows)

- Hay dos shells: PowerShell y Git Bash. En Git Bash:
  - Los heredoc largos con tildes o comillas a veces fallan al interpretarse → usa la herramienta Write o un script `.py` en el scratchpad.
  - Rutas como `/admin/...` pasadas a programas se convierten a rutas de Windows (MSYS) → `export MSYS_NO_PATHCONV=1`.
  - `curl -d` con tildes envía mal la codificación y deja texto roto en la base → para escribir datos por la API usa Python con `urllib` y JSON en UTF-8.
- **Capturas de pantalla** para revisar la UI: Edge headless desde PowerShell con `Start-Process ... -PassThru` y `WaitForExit(45000)`. Para páginas del panel, crear temporalmente `frontend/public/_p_x.html` con `<script>localStorage.setItem('token','...');location.replace('/admin/...')</script>` y **borrarlo después**. Edge headless tiene un ancho mínimo de ~500 px: para móvil, usar un iframe de 390 px dentro de una página.
- Para detener el backend: buscar el proceso en el puerto 8080 y confirmar que su línea de comando contiene `PukaraWebApplication` antes de matarlo.

## Skills útiles instaladas (globales)

`springboot-engineering`, `rest-api-standards`, `frontend-integration`, `webshop-payments`, `frontend-design`, `shadcn`, `web-design-guidelines`, `accessibility`, `ui-ux-pro-max`, `design-system-patterns`, `find-skills`.
