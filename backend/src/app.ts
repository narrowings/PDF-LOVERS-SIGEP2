import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';

import { rateLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import authRoutes from './routes/auth.routes';
import hojaDeVidaRoutes from './routes/hojaDeVida.routes';
import usuarioRoutes from './routes/usuario.routes';
import uploadRoutes from './routes/upload.routes';
import jthRoutes from './routes/jth.routes';
import { swaggerSpec } from './docs/swagger';
import { logger } from './utils/logger';

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const app: Application = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', '*.r2.cloudflarestorage.com', '*.r2.dev'],
    },
  },
}));

const allowedOrigins = (process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:5173').split(',');
app.use(cors({
  origin: (origin, cb) => (!origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error('CORS no permitido'))),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));
app.use(morgan('combined', { stream: { write: msg => logger.http(msg.trim()) } }));
app.use('/api/', rateLimiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'SIGEP II API',
  customCss: '.swagger-ui .topbar { background-color: #1e3a5f; }',
}));

app.use('/api/v1/auth',         authRoutes);
app.use('/api/v1/hoja-de-vida', hojaDeVidaRoutes);
app.use('/api/v1/usuarios',     usuarioRoutes);
app.use('/api/v1/upload',       uploadRoutes);
app.use('/api/v1/jth',          jthRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;