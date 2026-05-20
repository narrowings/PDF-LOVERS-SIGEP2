-- AlterTable
ALTER TABLE "ExperienciaDocente" ADD COLUMN     "verificadoEn" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ExperienciaLaboral" ADD COLUMN     "verificadoEn" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "FormacionAcademica" ADD COLUMN     "verificadoEn" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "HojaDeVida" ADD COLUMN     "documentoUrl" TEXT;
