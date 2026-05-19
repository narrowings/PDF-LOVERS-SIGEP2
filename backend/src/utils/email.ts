import nodemailer from 'nodemailer';
import { logger } from './logger';

interface SendMailOptions { to: string; subject: string; html: string; }

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env['GMAIL_USER'],
    pass: process.env['GMAIL_APP_PASSWORD'], // contraseña de aplicación, NO la de Gmail
  },
});

export const sendMail = async (opts: SendMailOptions): Promise<void> => {
  if (!process.env['GMAIL_USER']) {
    logger.warn(`[EMAIL] Sin config — email NOT sent to ${opts.to}`);
    logger.info(`[EMAIL] Subject: ${opts.subject}`);
    logger.info(`[EMAIL] Body: ${opts.html.replace(/<[^>]+>/g, ' ')}`);
    return;
  }
  await transporter.sendMail({
    from: `SIGEP II <${process.env['GMAIL_USER']}>`,
    to: opts.to, subject: opts.subject, html: opts.html,
  });
  logger.info(`[EMAIL] Enviado a ${opts.to}`);
};

export { emailUsuarioCreado, emailRecuperarPassword } from './emailTemplates';