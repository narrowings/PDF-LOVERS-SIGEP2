import { PrismaClient, RolUsuario, TipoDocumento } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const rounds = 12;

  const jthHash = await bcrypt.hash('Admin2024!', rounds);
  await prisma.usuario.upsert({
    where: { correo: 'jth@entidad.gov.co' },
    update: { passwordHash: jthHash, activo: true },
    create: {
      tipoDocumento: TipoDocumento.CEDULA_CIUDADANIA,
      numeroDocumento: '10000001',
      correo: 'jth@entidad.gov.co',
      passwordHash: jthHash,
      rol: RolUsuario.JEFE_TALENTO_HUMANO,
    },
  });

  const spHash = await bcrypt.hash('Servidor2024!', rounds);
  await prisma.usuario.upsert({
    where: { correo: 'servidor@entidad.gov.co' },
    update: { passwordHash: spHash, activo: true },
    create: {
      tipoDocumento: TipoDocumento.CEDULA_CIUDADANIA,
      numeroDocumento: '10000002',
      correo: 'servidor@entidad.gov.co',
      passwordHash: spHash,
      rol: RolUsuario.SERVIDOR_PUBLICO,
    },
  });

  console.log('Seed completado.');
}

main().catch(console.error).finally(() => prisma.$disconnect());