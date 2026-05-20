import 'dotenv/config';
import app from './app';
import { logger } from './utils/logger';
import { prisma } from './config/database';

const PORT = parseInt(process.env['PORT'] ?? '3001', 10);

async function bootstrap(): Promise<void> {
  await prisma.$connect();
  logger.info('Conexión a base de datos establecida');

  app.listen(PORT, () => {
    logger.info(`Servidor corriendo en puerto ${PORT} [${process.env['NODE_ENV'] ?? 'development'}]`);
    logger.info(`Documentación API: http://localhost:${PORT}/api-docs`);
  });
}

bootstrap().catch((err: unknown) => {
  logger.error('Error al iniciar el servidor', err);
  process.exit(1);
});

// temporal en index.ts
console.log('GMAIL_USER:', process.env['GMAIL_USER']);
