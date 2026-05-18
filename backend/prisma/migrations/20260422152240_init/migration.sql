-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CEDULA_CIUDADANIA', 'CEDULA_EXTRANJERIA', 'PASAPORTE', 'TARJETA_IDENTIDAD');

-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('MASCULINO', 'FEMENINO', 'NO_BINARIO', 'PREFIERO_NO_DECIR');

-- CreateEnum
CREATE TYPE "NivelAcademico" AS ENUM ('BACHILLERATO', 'TECNICO', 'TECNOLOGO', 'PREGRADO', 'POSTGRADO', 'MAESTRIA', 'DOCTORADO', 'POSTDOCTORADO');

-- CreateEnum
CREATE TYPE "TipoInstitucion" AS ENUM ('PUBLICA', 'PRIVADA', 'MIXTA');

-- CreateEnum
CREATE TYPE "EstadoEstudio" AS ENUM ('EN_PROCESO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "TipoZona" AS ENUM ('URBANA', 'RURAL');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('SERVIDOR_PUBLICO', 'JEFE_TALENTO_HUMANO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "tipoDocumento" "TipoDocumento" NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'SERVIDOR_PUBLICO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaFinRol" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HojaDeVida" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "primerNombre" TEXT NOT NULL,
    "segundoNombre" TEXT,
    "primerApellido" TEXT NOT NULL,
    "segundoApellido" TEXT,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "genero" "Genero" NOT NULL,
    "distritoMilitar" TEXT,
    "claseLM" TEXT,
    "numeroLM" TEXT,
    "esPersonaExpPolit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HojaDeVida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatosDemograficos" (
    "id" TEXT NOT NULL,
    "hojaDeVidaId" TEXT NOT NULL,
    "pais" TEXT NOT NULL DEFAULT 'COLOMBIA',
    "departamento" TEXT,
    "municipio" TEXT,
    "tipoZona" "TipoZona" NOT NULL DEFAULT 'URBANA',
    "direccion" TEXT,
    "complemento" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatosDemograficos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatosContacto" (
    "id" TEXT NOT NULL,
    "hojaDeVidaId" TEXT NOT NULL,
    "telefonoFijo" TEXT,
    "telefonoCelular" TEXT,
    "correoPersonal" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatosContacto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormacionAcademica" (
    "id" TEXT NOT NULL,
    "hojaDeVidaId" TEXT NOT NULL,
    "nivelAcademico" "NivelAcademico" NOT NULL,
    "nivelFormacion" TEXT,
    "areaConocimiento" TEXT,
    "pais" TEXT NOT NULL DEFAULT 'COLOMBIA',
    "institucion" TEXT NOT NULL,
    "programaAcademico" TEXT,
    "tituloObtenido" TEXT NOT NULL,
    "semestresAprobados" INTEGER,
    "estadoEstudio" "EstadoEstudio" NOT NULL,
    "fechaTerminacion" TIMESTAMP(3),
    "fechaGrado" TIMESTAMP(3),
    "estudiosExterior" BOOLEAN NOT NULL DEFAULT false,
    "documentoUrl" TEXT,
    "verificadoEdFormal" BOOLEAN NOT NULL DEFAULT false,
    "verificadoTarjetaProf" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormacionAcademica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperienciaLaboral" (
    "id" TEXT NOT NULL,
    "hojaDeVidaId" TEXT NOT NULL,
    "tipoInstitucion" "TipoInstitucion" NOT NULL,
    "nombreEntidad" TEXT NOT NULL,
    "pais" TEXT NOT NULL DEFAULT 'COLOMBIA',
    "departamento" TEXT,
    "municipio" TEXT,
    "tipoZona" "TipoZona" NOT NULL DEFAULT 'URBANA',
    "direccion" TEXT,
    "cargo" TEXT NOT NULL,
    "areaConocimiento" TEXT,
    "funcionesCargo" TEXT,
    "trabajoActual" BOOLEAN NOT NULL DEFAULT false,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "fechaRetiro" TIMESTAMP(3),
    "motivoRetiro" TEXT,
    "jornadaLaboral" TEXT,
    "horasMes" INTEGER,
    "documentoUrl" TEXT,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "tiempoExperiencia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExperienciaLaboral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperienciaDocente" (
    "id" TEXT NOT NULL,
    "hojaDeVidaId" TEXT NOT NULL,
    "tipoInstitucion" "TipoInstitucion" NOT NULL DEFAULT 'PUBLICA',
    "institucion" TEXT NOT NULL,
    "pais" TEXT NOT NULL DEFAULT 'COLOMBIA',
    "departamento" TEXT,
    "municipio" TEXT,
    "nivelAcademico" "NivelAcademico" NOT NULL,
    "tipoZona" "TipoZona" NOT NULL DEFAULT 'URBANA',
    "direccion" TEXT,
    "trabajoActual" BOOLEAN NOT NULL DEFAULT false,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "fechaRetiro" TIMESTAMP(3),
    "motivoRetiro" TEXT,
    "jornadaLaboral" TEXT,
    "telefono" TEXT,
    "materiaImpartida" TEXT,
    "tiempoExperiencia" TEXT,
    "documentoUrl" TEXT,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExperienciaDocente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_numeroDocumento_key" ON "Usuario"("numeroDocumento");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE INDEX "Usuario_tipoDocumento_numeroDocumento_idx" ON "Usuario"("tipoDocumento", "numeroDocumento");

-- CreateIndex
CREATE INDEX "Usuario_correo_idx" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_usuarioId_idx" ON "RefreshToken"("usuarioId");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "HojaDeVida_usuarioId_key" ON "HojaDeVida"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "DatosDemograficos_hojaDeVidaId_key" ON "DatosDemograficos"("hojaDeVidaId");

-- CreateIndex
CREATE UNIQUE INDEX "DatosContacto_hojaDeVidaId_key" ON "DatosContacto"("hojaDeVidaId");

-- CreateIndex
CREATE INDEX "FormacionAcademica_hojaDeVidaId_idx" ON "FormacionAcademica"("hojaDeVidaId");

-- CreateIndex
CREATE INDEX "ExperienciaLaboral_hojaDeVidaId_idx" ON "ExperienciaLaboral"("hojaDeVidaId");

-- CreateIndex
CREATE INDEX "ExperienciaDocente_hojaDeVidaId_idx" ON "ExperienciaDocente"("hojaDeVidaId");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HojaDeVida" ADD CONSTRAINT "HojaDeVida_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatosDemograficos" ADD CONSTRAINT "DatosDemograficos_hojaDeVidaId_fkey" FOREIGN KEY ("hojaDeVidaId") REFERENCES "HojaDeVida"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatosContacto" ADD CONSTRAINT "DatosContacto_hojaDeVidaId_fkey" FOREIGN KEY ("hojaDeVidaId") REFERENCES "HojaDeVida"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormacionAcademica" ADD CONSTRAINT "FormacionAcademica_hojaDeVidaId_fkey" FOREIGN KEY ("hojaDeVidaId") REFERENCES "HojaDeVida"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienciaLaboral" ADD CONSTRAINT "ExperienciaLaboral_hojaDeVidaId_fkey" FOREIGN KEY ("hojaDeVidaId") REFERENCES "HojaDeVida"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienciaDocente" ADD CONSTRAINT "ExperienciaDocente_hojaDeVidaId_fkey" FOREIGN KEY ("hojaDeVidaId") REFERENCES "HojaDeVida"("id") ON DELETE CASCADE ON UPDATE CASCADE;
