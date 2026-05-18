# Diagramas del Sistema SIGEP II

Diagramas como código (Diagrams as Code). Renderizables en cualquier visor de Mermaid o PlantUML.

---

## 1. C4 — Diagrama de Contexto

```plantuml
@startuml C4_Context
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

title Diagrama de Contexto — SIGEP II

Person(sp, "Servidor Público", "Empleado del Estado que gestiona su hoja de vida")
Person(jth, "Jefe de Talento Humano", "Administra usuarios y valida información")

System(sigep2, "SIGEP II", "Sistema de Gestión de Empleo Público")

System_Ext(smtp, "Servicio de Correo (SMTP)", "Envía notificaciones y contraseñas temporales")
System_Ext(funcpub, "Función Pública", "Entidad reguladora del empleo público en Colombia")

Rel(sp, sigep2, "Gestiona su hoja de vida", "HTTPS")
Rel(jth, sigep2, "Administra usuarios y accesos", "HTTPS")
Rel(sigep2, smtp, "Envía correos", "SMTP/TLS")
Rel(sigep2, funcpub, "Referencia normativa")

@enduml
```

---

## 2. C4 — Diagrama de Contenedores

```plantuml
@startuml C4_Containers
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

title Diagrama de Contenedores — SIGEP II

Person(sp, "Servidor Público / JTH")

System_Boundary(sigep2, "SIGEP II") {
  Container(frontend, "Frontend SPA", "React + Vite + TypeScript", "Interfaz de usuario responsiva")
  Container(backend, "Backend API", "Node.js + Express + TypeScript", "API REST con autenticación JWT")
  ContainerDb(db, "Base de Datos", "PostgreSQL 16", "Usuarios, hoja de vida, tokens")
}

System_Ext(smtp, "SMTP")

Rel(sp, frontend, "Accede vía navegador", "HTTPS")
Rel(frontend, backend, "Llamadas REST", "HTTPS + JWT Bearer")
Rel(backend, db, "Consultas ORM", "TCP / Prisma")
Rel(backend, smtp, "Envía correos", "SMTP/TLS")

@enduml
```

---

## 3. C4 — Diagrama de Componentes (Backend)

```plantuml
@startuml C4_Components_Backend
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

title Componentes del Backend — SIGEP II

Container_Boundary(api, "Backend API") {
  Component(authRouter, "Auth Router", "Express Router", "POST /login, /refresh, /logout, /recuperar-password, PATCH /cambiar-password")
  Component(hvRouter, "HojaDeVida Router", "Express Router", "CRUD hoja de vida por sección")
  Component(usuRouter, "Usuario Router", "Express Router", "Gestión de usuarios (JTH)")

  Component(authCtrl, "Auth Controller", "TypeScript", "Orquesta flujos de autenticación")
  Component(hvCtrl, "HojaDeVida Controller", "TypeScript", "Orquesta CRUD de hoja de vida")
  Component(usuCtrl, "Usuario Controller", "TypeScript", "Orquesta administración de usuarios")

  Component(authSvc, "Auth Service", "TypeScript", "Login, JWT, bcrypt, refresh tokens, PAM")
  Component(hvSvc, "HojaDeVida Service", "TypeScript", "Lógica de negocio de hoja de vida")
  Component(usuSvc, "Usuario Service", "TypeScript", "Creación e inhabilitación de usuarios")

  Component(authMw, "Authenticate Middleware", "TypeScript", "Verifica JWT, extrae payload")
  Component(validateMw, "Validate Middleware", "TypeScript", "Validación Zod de request body")
  Component(rateMw, "RateLimit Middleware", "express-rate-limit", "Previene brute-force")

  Component(prisma, "Prisma Client", "ORM", "Queries parametrizadas anti SQL injection")
}

ContainerDb(db, "PostgreSQL")

Rel(authRouter, authCtrl, "delega")
Rel(hvRouter, hvCtrl, "delega")
Rel(usuRouter, usuCtrl, "delega")
Rel(authCtrl, authSvc, "usa")
Rel(hvCtrl, hvSvc, "usa")
Rel(usuCtrl, usuSvc, "usa")
Rel(authSvc, prisma, "consulta")
Rel(hvSvc, prisma, "consulta")
Rel(usuSvc, prisma, "consulta")
Rel(prisma, db, "SQL parametrizado", "TCP")

@enduml
```

---

## 4. Diagrama de Secuencia — Login y Refresh Token (Mermaid)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant FE as Frontend (React)
    participant BE as Backend API
    participant DB as PostgreSQL

    U->>FE: Ingresa tipo doc, número y contraseña
    FE->>BE: POST /auth/login
    BE->>DB: findFirst(tipoDoc, numDoc, activo=true)
    DB-->>BE: Usuario o null
    BE->>BE: bcrypt.compare(password, hash) — timing-safe
    alt Credenciales válidas
        BE->>DB: INSERT RefreshToken
        BE-->>FE: { accessToken, refreshToken, rol }
        FE->>FE: localStorage.set(accessToken, refreshToken)
        FE-->>U: Redirige a /dashboard
    else Inválidas
        BE-->>FE: 401 Unauthorized
        FE-->>U: Muestra error genérico
    end

    Note over FE,BE: Access token expirado (15 min)
    FE->>BE: Petición con token expirado
    BE-->>FE: 401 Unauthorized
    FE->>BE: POST /auth/refresh { refreshToken }
    BE->>DB: findUnique(token) + validar revoked/expiresAt
    alt Refresh válido
        BE->>DB: UPDATE revoked=true (rotación)
        BE->>DB: INSERT nuevo RefreshToken
        BE-->>FE: { accessToken, refreshToken }
        FE->>BE: Reintenta petición original
    else Refresh inválido
        BE-->>FE: 401 Unauthorized
        FE->>FE: Limpia localStorage
        FE-->>U: Redirige a /login
    end
```

---

## 5. Diagrama de Secuencia — Gestión de Hoja de Vida (Mermaid)

```mermaid
sequenceDiagram
    actor SP as Servidor Público
    participant FE as Frontend
    participant BE as Backend API
    participant DB as PostgreSQL

    SP->>FE: Navega a Mi Hoja de Vida
    FE->>BE: GET /hoja-de-vida (Bearer token)
    BE->>BE: authenticate middleware — verifica JWT
    BE->>DB: findUnique(usuarioId) con relaciones
    alt Hoja existente
        DB-->>BE: HojaDeVida completa
        BE-->>FE: 200 { datos personales, formación, experiencias }
    else No existe aún
        DB-->>BE: null
        BE-->>FE: 404
        FE->>FE: Renderiza formulario vacío
    end
    FE-->>SP: Muestra tabs con datos actuales

    SP->>FE: Completa datos personales y guarda
    FE->>BE: PUT /hoja-de-vida/datos-personales
    BE->>BE: validate middleware (Zod schema)
    BE->>DB: upsert HojaDeVida
    DB-->>BE: HojaDeVida actualizada
    BE-->>FE: 200 OK
    FE-->>SP: Muestra mensaje de éxito
```

---

## 6. Diagrama de Clases — Modelo de Dominio (Mermaid)

```mermaid
classDiagram
    class Usuario {
        +String id
        +TipoDocumento tipoDocumento
        +String numeroDocumento
        +String correo
        +String passwordHash
        +RolUsuario rol
        +Boolean activo
        +DateTime fechaFinRol
    }

    class RefreshToken {
        +String id
        +String token
        +String usuarioId
        +DateTime expiresAt
        +Boolean revoked
    }

    class HojaDeVida {
        +String id
        +String usuarioId
        +String primerNombre
        +String primerApellido
        +DateTime fechaNacimiento
        +Genero genero
        +Boolean esPersonaExpPolit
    }

    class DatosDemograficos {
        +String id
        +String hojaDeVidaId
        +String pais
        +TipoZona tipoZona
        +String direccion
        +String complemento
    }

    class DatosContacto {
        +String id
        +String hojaDeVidaId
        +String telefonoCelular
        +String correoPersonal
    }

    class FormacionAcademica {
        +String id
        +NivelAcademico nivelAcademico
        +String institucion
        +String tituloObtenido
        +EstadoEstudio estadoEstudio
        +Boolean verificadoEdFormal
    }

    class ExperienciaLaboral {
        +String id
        +TipoInstitucion tipoInstitucion
        +String nombreEntidad
        +String cargo
        +Boolean trabajoActual
        +DateTime fechaIngreso
    }

    class ExperienciaDocente {
        +String id
        +String institucion
        +NivelAcademico nivelAcademico
        +String materiaImpartida
        +Boolean trabajoActual
    }

    Usuario "1" --> "0..1" HojaDeVida
    Usuario "1" --> "0..*" RefreshToken
    HojaDeVida "1" --> "0..1" DatosDemograficos
    HojaDeVida "1" --> "0..1" DatosContacto
    HojaDeVida "1" --> "0..*" FormacionAcademica
    HojaDeVida "1" --> "0..*" ExperienciaLaboral
    HojaDeVida "1" --> "0..*" ExperienciaDocente
```

---

## 7. Diagrama de Flujo PAM — Gestión de Accesos Privilegiados (Mermaid)

```mermaid
flowchart TD
    A([JTH crea usuario]) --> B[Se asigna rol SERVIDOR_PUBLICO]
    B --> C[Usuario activo=true, fechaFinRol=null]
    C --> D{Usuario se desvincula?}
    D -- No --> E([Continúa operando])
    D -- Sí --> F[JTH registra fechaFin en sistema]
    F --> G{fechaFin <= hoy?}
    G -- Sí --> H[activo=false]
    H --> I[Se revocan todos los RefreshTokens activos]
    I --> J[Próximo login falla con 401]
    G -- No --> K[activo=true, acceso pendiente de expiración]
    K --> L{Login posterior a fechaFin?}
    L -- Sí --> M[Auth Service detecta fechaFinRol <= now]
    M --> J
```
