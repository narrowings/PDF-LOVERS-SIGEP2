import { PrismaClient, RolUsuario, TipoDocumento } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const rounds = parseInt(process.env['BCRYPT_ROUNDS'] ?? '12', 10);

  // JTH admin seed
  const jthHash = await bcrypt.hash('Admin2024!', rounds);
  await prisma.usuario.upsert({
    where: { correo: 'jth@entidad.gov.co' },
    update: {},
    create: {
      tipoDocumento: TipoDocumento.CEDULA_CIUDADANIA,
      numeroDocumento: '10000001',
      correo: 'jth@entidad.gov.co',
      passwordHash: jthHash,
      rol: RolUsuario.JEFE_TALENTO_HUMANO,
    },
  });

  // Servidor público seed
  const spHash = await bcrypt.hash('Servidor2024!', rounds);
  await prisma.usuario.upsert({
    where: { correo: 'servidor@entidad.gov.co' },
    update: {},
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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
