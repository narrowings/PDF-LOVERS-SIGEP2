export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'SIGEP II API',
    version: '1.0.0',
    description: `
## Sistema de Gestión de Empleo Público - API REST

Esta API implementa el módulo de **Hoja de Vida del Servidor Público** compatible con SIGEP II.

### Seguridad
- Autenticación via **JWT Bearer** (access token 15min + refresh token 7d)
- Rate limiting en todos los endpoints
- Validación de entrada con Zod
- Protección contra inyección SQL via Prisma ORM (queries parametrizadas)
- PAM: roles con fecha de expiración

### Roles
| Rol | Descripción |
|-----|-------------|
| \`SERVIDOR_PUBLICO\` | Acceso a su propia hoja de vida |
| \`JEFE_TALENTO_HUMANO\` | Administra usuarios y valida información |
    `,
    //contact: { name: 'Universidad Autónoma de Occidente', email: 'soporte@uao.edu.co' },
    license: { name: 'MIT' },
  },
  servers: [
    { url: 'http://localhost:3001', description: 'Desarrollo' },
    { url: 'https://api.sigep2.uao.edu.co', description: 'Producción' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingrese el access token obtenido en /auth/login',
      },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['tipoDocumento', 'numeroDocumento', 'password'],
        properties: {
          tipoDocumento: {
            type: 'string',
            enum: ['CEDULA_CIUDADANIA', 'CEDULA_EXTRANJERIA', 'PASAPORTE', 'TARJETA_IDENTIDAD'],
          },
          numeroDocumento: { type: 'string', example: '10000002' },
          password: { type: 'string', format: 'password' },
        },
      },
      TokenResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          rol: { type: 'string' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          errors: { type: 'object' },
        },
      },
    },
  },
  tags: [
    { name: 'Autenticación', description: 'Login, logout, recuperación y cambio de contraseña' },
    { name: 'Hoja de Vida', description: 'Gestión de hoja de vida del servidor público' },
    { name: 'Usuarios - JTH', description: 'Administración de usuarios (solo Jefe de Talento Humano)' },
  ],
};
