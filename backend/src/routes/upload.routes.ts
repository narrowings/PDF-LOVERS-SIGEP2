import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

const useR2 =
  Boolean(process.env['R2_ACCOUNT_ID']) &&
  Boolean(process.env['R2_ACCESS_KEY_ID']) &&
  Boolean(process.env['R2_SECRET_ACCESS_KEY']) &&
  Boolean(process.env['R2_BUCKET']);

let storage: multer.StorageEngine;

if (useR2) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const multerS3 = require('multer-s3') as typeof import('multer-s3');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { S3Client } = require('@aws-sdk/client-s3') as typeof import('@aws-sdk/client-s3');
  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env['R2_ACCOUNT_ID']!}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env['R2_ACCESS_KEY_ID']!,
      secretAccessKey: process.env['R2_SECRET_ACCESS_KEY']!,
    },
  });
  storage = multerS3({
    s3,
    bucket: process.env['R2_BUCKET']!,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (_req: Request, file: Express.Multer.File, cb: (e: Error | null, k: string) => void) => {
      const hash = crypto.randomBytes(8).toString('hex');
      cb(null, `uploads/${hash}${path.extname(file.originalname).toLowerCase()}`);
    },
  });
} else {
  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(process.cwd(), 'uploads')),
    filename: (_req, file, cb) => {
      const hash = crypto.randomBytes(8).toString('hex');
      cb(null, `${hash}${path.extname(file.originalname).toLowerCase()}`);
    },
  });
}

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  ['.pdf', '.jpg', '.jpeg'].includes(ext) ? cb(null, true) : cb(new Error('Solo PDF, JPG o JPEG'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

router.post(
  '/',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ message: 'El archivo no debe superar 2 MB' }); return;
      }
      if (err) { res.status(400).json({ message: (err as Error).message }); return; }
      next();
    });
  },
  (req: Request, res: Response) => {
    if (!req.file) { res.status(400).json({ message: 'No se proporcionó ningún archivo' }); return; }
    let url: string;
    if (useR2 && process.env['R2_PUBLIC_URL']) {
      const key = (req.file as Express.Multer.File & { key?: string }).key ?? '';
      url = `${process.env['R2_PUBLIC_URL'].replace(/\/$/, '')}/${key}`;
    } else if (useR2) {
      url = (req.file as Express.Multer.File & { location?: string }).location ?? '';
    } else {
      url = `/uploads/${req.file.filename}`;
    }
    res.status(200).json({ url, filename: req.file.originalname });
  },
);

export default router;
