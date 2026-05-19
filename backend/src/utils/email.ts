import { logger } from './logger';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async (opts: SendMailOptions): Promise<void> => {
  const apiKey = process.env['RESEND_API_KEY'];
  const from = process.env['RESEND_FROM'] ?? 'SIGEP II <no-reply@sigep2.uao.edu.co>';

  if (!apiKey) {
    // Development fallback: just log
    logger.warn(`[EMAIL] No RESEND_API_KEY — email NOT sent to ${opts.to}`);
    logger.info(`[EMAIL] Subject: ${opts.subject}`);
    logger.info(`[EMAIL] Body (text): ${opts.html.replace(/<[^>]+>/g, ' ')}`);
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html }),
  });

  if (!res.ok) {
    const err = await res.text();
    logger.error(`[EMAIL] Resend error: ${err}`);
    throw new Error('Error enviando correo');
  }

  logger.info(`[EMAIL] Enviado a ${opts.to} — ${opts.subject}`);
};

// ── Templates ─────────────────────────────────────────────────────────────────

export const emailUsuarioCreado = (correo: string, password: string) => ({
  to: correo,
  subject: 'SIGEP II — Credenciales de acceso',
  html: `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:8px;">
      <h2 style="color:#1e3a6e;margin-bottom:8px;">Sistema de Gestión de Empleo Público</h2>
      <p style="color:#374151;">Se ha creado su cuenta en <strong>SIGEP II</strong>. Sus credenciales de acceso son:</p>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Correo electrónico</p>
        <p style="margin:0 0 16px;font-weight:600;color:#111;">${correo}</p>
        <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Contraseña temporal</p>
        <p style="margin:0;font-weight:700;font-size:18px;letter-spacing:2px;color:#1e3a6e;">${password}</p>
      </div>
      <p style="color:#374151;font-size:13px;">Por seguridad, le recomendamos cambiar su contraseña en el primer inicio de sesión.</p>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Departamento Administrativo de la Función Pública · Colombia</p>
    </div>`,
});

export const emailRecuperarPassword = (correo: string, password: string) => ({
  to: correo,
  subject: 'SIGEP II — Recuperación de contraseña',
  html: `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:8px;">
      <h2 style="color:#1e3a6e;margin-bottom:8px;">Recuperación de contraseña</h2>
      <p style="color:#374151;">Se ha generado una contraseña temporal para su cuenta en <strong>SIGEP II</strong>:</p>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Contraseña temporal</p>
        <p style="margin:0;font-weight:700;font-size:18px;letter-spacing:2px;color:#1e3a6e;">${password}</p>
      </div>
      <p style="color:#374151;font-size:13px;">Use esta contraseña para ingresar y luego cámbiela desde el menú <em>Cambiar Contraseña</em>.</p>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Si usted no solicitó este correo, ignórelo.</p>
    </div>`,
});