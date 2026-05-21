# SIGEP II — Sistema de Gestión de Empleo Público

> Proyecto de Curso 2026-1 · Universidad Autónoma de Occidente · Facultad de Ingeniería

Sistema web para la gestión de hojas de vida de servidores públicos del Estado colombiano, compatible funcionalmente con el módulo de Hoja de Vida del SIGEP II administrado por el Departamento Administrativo de la Función Pública.

--- VIDEO DE DEMOSTRACIÓN DEL PRODUCTO ---
https://youtu.be/WYY2vvACWic

## Tabla de Contenidos

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos](#requisitos)
- [Instalación y Puesta en Marcha](#instalación-y-puesta-en-marcha)
- [Variables de Entorno](#variables-de-entorno)
- [Roles y Permisos (PAM)](#roles-y-permisos-pam)
- [Seguridad](#seguridad)
- [API — OpenAPI](#api--openapi)
- [Diagramas](#diagramas)
- [Historias de Usuario Implementadas](#historias-de-usuario-implementadas)

---

## Descripción

SIGEP II implementa los módulos de **Autenticación y Acceso** (HU-001 a HU-005) y **Hoja de Vida del Servidor Público** (HU-006 a HU-015), cubriendo:

- Autenticación con JWT (access + refresh token con rotación)
- Recuperación y cambio de contraseña
- Gestión de usuarios por el Jefe de Talento Humano
- Hoja de vida con datos personales, demográficos, de contacto, formación académica, experiencia laboral y experiencia docente
- Inhabilitación de accesos privilegiados (PAM)

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, React Hook Form, Zod |
| Backend | Node.js 20, Express, TypeScript, Prisma ORM |
| Base de datos | PostgreSQL 16 |
| Autenticación | JWT (jsonwebtoken), bcryptjs |
| Seguridad HTTP | helmet, cors, express-rate-limit |
| Validación | Zod (backend y frontend) |
| Documentación API | OpenAPI 3.0 / Swagger UI |
| Análisis estático (SAST) | ESLint + @typescript-eslint + eslint-plugin-security |
| Contenedores | Docker, Docker Compose |
| Diagramas | PlantUML (C4), Mermaid |

---

## Estructura del Proyecto

```
sigep2/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Modelo de datos
│   │   └── seed.ts                # Datos iniciales
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts        # Cliente Prisma
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── hojaDeVida.controller.ts
│   │   │   └── usuario.controller.ts
│   │   ├── docs/
│   │   │   └── swagger.ts         # Especificación OpenAPI
│   │   ├── middlewares/
│   │   │   ├── authenticate.ts    # JWT verify + roles
│   │   │   ├── errorHandler.ts
│   │   │   ├── notFound.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── validate.ts        # Zod middleware
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── hojaDeVida.routes.ts
│   │   │   └── usuario.routes.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts    # Login, refresh, passwords
│   │   │   ├── hojaDeVida.service.ts
│   │   │   └── usuario.service.ts
│   │   ├── utils/
│   │   │   ├── errors.ts          # Clases de error tipadas
│   │   │   ├── jwt.ts             # Generación y verificación
│   │   │   └── logger.ts          # Winston
│   │   ├── validators/
│   │   │   ├── auth.validators.ts
│   │   │   └── hojaDeVida.validators.ts
│   │   ├── app.ts
│   │   └── index.ts
│   ├── .env.example
│   ├── .eslintrc.json             # ESLint + security plugin (SAST)
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── hv/
│   │   │   │   ├── DatosPersonalesTab.tsx
│   │   │   │   ├── FormacionAcademicaTab.tsx
│   │   │   │   ├── ExperienciaLaboralTab.tsx
│   │   │   │   └── ExperienciaDocenteTab.tsx
│   │   │   ├── layout/
│   │   │   │   └── Layout.tsx
│   │   │   └── shared/
│   │   │       ├── Alert.tsx
│   │   │       ├── ConfirmModal.tsx
│   │   │       ├── FormField.tsx
│   │   │       └── Spinner.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx    # Auth state + JWT refresh
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RecuperarPasswordPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── HojaDeVidaPage.tsx
│   │   │   ├── CambiarPasswordPage.tsx
│   │   │   ├── GestionUsuariosPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── services/
│   │   │   └── api.ts             # Axios + interceptores JWT
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── utils/
│   │   │   └── apiError.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── docs/
│   └── diagrams.md                # UML, C4, secuencias (PlantUML + Mermaid)
│
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## Requisitos

- **Node.js** v20+
- **PostgreSQL** 16+ (o Docker)
- **npm** v10+

---

## Instalación y Puesta en Marcha

### Opción A — Docker Compose (recomendado)

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd sigep2

# 2. Crear archivo de variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con secretos reales

# 3. Levantar todos los servicios
docker compose up -d

# 4. Ejecutar migraciones y seed
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx tsx prisma/seed.ts

# 5. Acceder
# Frontend:  http://localhost:5173
# API docs:  http://localhost:3001/api-docs
```

### Opción B — Desarrollo local

```bash
# Terminal 1 — Base de datos
docker run -d --name sigep2_db \
  -e POSTGRES_USER=sigep_user \
  -e POSTGRES_PASSWORD=sigep_pass \
  -e POSTGRES_DB=sigep2_db \
  -p 5432:5432 postgres:16-alpine

# Terminal 2 — Backend
cd backend
cp .env.example .env          # completar JWT_SECRET y JWT_REFRESH_SECRET
npm install
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
npm run dev

# Terminal 3 — Frontend
cd frontend
npm install
npm run dev
```

---

## Variables de Entorno

Copie `backend/.env.example` a `backend/.env` y configure:

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `DATABASE_URL` | URL de conexión PostgreSQL | ✅ |
| `JWT_SECRET` | Secreto para access tokens (mín. 64 chars aleatorios) | ✅ |
| `JWT_EXPIRES_IN` | Duración access token (ej. `15m`) | ✅ |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens | ✅ |
| `JWT_REFRESH_EXPIRES_IN` | Duración refresh token (ej. `7d`) | ✅ |
| `BCRYPT_ROUNDS` | Rondas de hashing bcrypt (recomendado: 12) | ✅ |
| `ALLOWED_ORIGINS` | Origins CORS permitidos | ✅ |
| `RATE_LIMIT_MAX` | Máx. requests por ventana | opcional |
| `AUTH_RATE_LIMIT_MAX` | Máx. intentos de login por ventana | opcional |

> ⚠️ **Nunca** commitear el archivo `.env` al repositorio.

---

## Roles y Permisos (PAM)

El sistema implementa **Privileged Access Management** mediante:

| Rol | Permisos |
|-----|----------|
| `SERVIDOR_PUBLICO` | Gestionar su propia hoja de vida, cambiar contraseña |
| `JEFE_TALENTO_HUMANO` | Todo lo anterior + crear usuarios, inhabilitar accesos |

La inhabilitación de roles funciona así:
1. El JTH registra una **fecha de fin** para el rol de un funcionario.
2. Si `fechaFin <= ahora`, el sistema desactiva la cuenta y revoca todos sus refresh tokens activos.
3. Cualquier intento de login posterior devuelve `401 Unauthorized`.

---

## Seguridad

| Mecanismo | Implementación |
|-----------|---------------|
| Autenticación | JWT Bearer (access 15min + refresh 7d con rotación) |
| Hashing de contraseñas | bcryptjs (12 rondas por defecto) |
| Inyección SQL | Prisma ORM — todas las queries son parametrizadas |
| Rate limiting | `express-rate-limit` — global (100/15min) y auth (10/15min) |
| Headers de seguridad | `helmet` con CSP configurado |
| CORS | Lista blanca de origins explícita |
| Validación de entradas | Zod en backend (todos los endpoints) y frontend |
| SAST | ESLint + `eslint-plugin-security` — detecta patrones inseguros |
| Respuestas genéricas | Login y recuperación de contraseña no revelan si el usuario existe |
| Timing-safe | bcrypt.compare se ejecuta siempre, incluso si el usuario no existe |

---

## API — OpenAPI

La documentación interactiva está disponible en:

```
http://localhost:3001/api-docs
```

### Endpoints principales

```
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/recuperar-password
PATCH  /api/v1/auth/cambiar-password        🔒
GET    /api/v1/auth/me                      🔒

GET    /api/v1/hoja-de-vida                 🔒
PUT    /api/v1/hoja-de-vida/datos-personales    🔒
PUT    /api/v1/hoja-de-vida/datos-demograficos  🔒
PUT    /api/v1/hoja-de-vida/datos-contacto      🔒
POST   /api/v1/hoja-de-vida/formacion           🔒
PUT    /api/v1/hoja-de-vida/formacion/:id        🔒
DELETE /api/v1/hoja-de-vida/formacion/:id        🔒
[... experiencia-laboral y experiencia-docente con igual patrón]

GET    /api/v1/usuarios                     🔒 JTH
POST   /api/v1/usuarios                     🔒 JTH
PATCH  /api/v1/usuarios/:id/inhabilitar     🔒 JTH
```

🔒 = Requiere `Authorization: Bearer <accessToken>`

---

## Diagramas

Los diagramas de arquitectura se encuentran en [`docs/diagrams.md`](docs/diagrams.md) como código renderizable:

- **C4 Contexto** — relaciones con sistemas externos
- **C4 Contenedores** — Frontend, Backend, PostgreSQL
- **C4 Componentes** — internos del Backend
- **Secuencia** — Login y refresh de tokens
- **Secuencia** — Gestión de hoja de vida
- **Clases** — Modelo de dominio completo
- **Flujo PAM** — Ciclo de vida de accesos privilegiados

---

## Historias de Usuario Implementadas

### Módulo 1 — Autenticación y Acceso

| HU | Descripción | Estado |
|----|-------------|--------|
| HU-001 | Iniciar sesión con tipo y número de documento | ✅ |
| HU-002 | Recuperar contraseña por correo | ✅ |
| HU-003 | Cambiar contraseña con validación de complejidad | ✅ |
| HU-004 | JTH crea usuario inicial para nuevo servidor | ✅ |
| HU-005 | JTH inhabilita rol al desvincularse el funcionario | ✅ |

### Módulo 2 — Hoja de Vida del Servidor Público

| HU | Descripción | Estado |
|----|-------------|--------|
| HU-006 | Registrar datos personales | ✅ |
| HU-007 | Registrar dirección rural con tipo de zona y complemento | ✅ |
| HU-008 | Registrar formación académica | ✅ |
| HU-009 | Registrar experiencia laboral y docente | ✅ |
| HU-010 | Sección Gerencia Pública (estructura preparada) | ⬜ Pendiente |
| HU-011 | Guardar secciones de forma independiente | ✅ |
| HU-012 | Identificar visualmente campos obligatorios con asterisco | ✅ |
| HU-013 | Adjuntar documentos PDF/JPG (estructura preparada) | ⬜ Pendiente |
| HU-014 | Previsualizar documentos adjuntos | ⬜ Pendiente |
| HU-015 | Descargar e imprimir hoja de vida | ⬜ Pendiente |

> Las HU marcadas ⬜ requieren integración con almacenamiento de archivos (S3/MinIO) y generación de PDF, no incluidas en este entregable base.

---

## Licencia

MIT — Proyecto académico Universidad Autónoma de Occidente 2026-1.
