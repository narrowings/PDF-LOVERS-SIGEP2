import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

interface MockUser { id: string; correo: string; password: string; rol: string; tipoDocumento: string; }

const USERS: Record<string, MockUser> = {
  '10000002': { id: 'user-sp-1', correo: 'servidor@entidad.gov.co', password: 'Servidor2024!', rol: 'SERVIDOR_PUBLICO', tipoDocumento: 'CEDULA_CIUDADANIA' },
  '10000001': { id: 'user-jth-1', correo: 'jth@entidad.gov.co', password: 'Admin2024!', rol: 'JEFE_TALENTO_HUMANO', tipoDocumento: 'CEDULA_CIUDADANIA' },
};
const tokenStore: Record<string, string> = {};

const hdvStore: Record<string, Record<string, unknown>> = {
  'user-sp-1': {
    id: 'hdv-1', usuarioId: 'user-sp-1',
    primerNombre: 'Juan Andrés', primerApellido: 'Pérez', segundoApellido: 'Gómez',
    fechaNacimiento: '1985-07-12T00:00:00.000Z', genero: 'MASCULINO', esPersonaExpPolit: false,
    datosDemograficos: { pais: 'COLOMBIA', departamento: 'Valle del Cauca', municipio: 'Cali', tipoZona: 'URBANA', direccion: 'Calle 13 # 100-0' },
    datosContacto: { telefonoCelular: '3102345678', correoPersonal: 'juan.perez@personal.com' },
    formacionAcademica: [
      { id: 'fa-1', nivelAcademico: 'POSTGRADO', tituloObtenido: 'Doctor en Ingeniería', institucion: 'Universidad del Valle', estadoEstudio: 'FINALIZADO', fechaGrado: '2013-11-16', verificadoEdFormal: false, documentoUrl: null },
      { id: 'fa-2', nivelAcademico: 'PREGRADO', tituloObtenido: 'Ingeniero de Sistemas', institucion: 'Universidad del Valle', estadoEstudio: 'FINALIZADO', fechaGrado: '2004-05-28', verificadoEdFormal: false, documentoUrl: null },
    ],
    experienciaLaboral: [
      { id: 'el-1', nombreEntidad: 'Universidad del Valle', cargo: 'Profesor Titular', tipoInstitucion: 'PUBLICA', fechaIngreso: '2004-09-01T00:00:00.000Z', trabajoActual: true, verificado: false, documentoUrl: null },
    ],
    experienciaDocente: [
      { id: 'ed-1', institucion: 'Universidad Autónoma de Occidente', nivelAcademico: 'PREGRADO', materiaImpartida: 'Programación OO', fechaIngreso: '2022-07-25T00:00:00.000Z', trabajoActual: false, fechaRetiro: '2022-11-30T00:00:00.000Z', tipoInstitucion: 'PRIVADA', verificado: false, documentoUrl: null },
    ],
  },
};

const usuariosStore: Array<Record<string, unknown>> = [
  { id: 'user-sp-1', tipoDocumento: 'CEDULA_CIUDADANIA', numeroDocumento: '10000002', correo: 'servidor@entidad.gov.co', rol: 'SERVIDOR_PUBLICO', activo: true, fechaFinRol: null, createdAt: '2026-01-10T00:00:00.000Z' },
];

function uid() { return Math.random().toString(36).slice(2, 10); }
function makeToken(userId: string) { const t = `mock-${uid()}-${userId}`; tokenStore[t] = userId; return t; }
function getUserFromHeader(headers: Record<string, string> | undefined): MockUser | null {
  const auth = headers?.['Authorization'] ?? headers?.['authorization'] ?? '';
  const userId = tokenStore[auth.replace('Bearer ', '').trim()];
  return userId ? Object.values(USERS).find(u => u.id === userId) ?? null : null;
}
function parseBody(config: InternalAxiosRequestConfig): Record<string, unknown> {
  if (!config.data || config.data instanceof FormData) return {};
  if (typeof config.data === 'string') { try { return JSON.parse(config.data) as Record<string, unknown>; } catch { return {}; } }
  return config.data as Record<string, unknown>;
}
function respond(config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse {
  return { data, status, statusText: status === 204 ? 'No Content' : 'OK', headers: {}, config };
}
function reject(message: string, status: number): Promise<never> {
  return Promise.reject(Object.assign(new Error(message), {
    isAxiosError: true, response: { data: { message }, status, headers: {}, config: {}, statusText: '' },
  }));
}

function handle(config: InternalAxiosRequestConfig): AxiosResponse | Promise<never> | null {
  const url = config.url ?? '';
  const m = (config.method ?? 'get').toLowerCase();
  const body = parseBody(config);
  const headers = config.headers as Record<string, string> | undefined;

  // Auth
  if (/\/auth\/login$/.test(url) && m === 'post') {
    const user = USERS[body['numeroDocumento'] as string];
    if (!user || user.password !== body['password'] || user.tipoDocumento !== body['tipoDocumento']) return reject('Credenciales inválidas', 401);
    return respond(config, { accessToken: makeToken(user.id), refreshToken: makeToken(user.id), rol: user.rol });
  }
  if (/\/auth\/refresh$/.test(url) && m === 'post') {
    const uid2 = tokenStore[body['refreshToken'] as string];
    if (!uid2) return reject('Refresh token inválido', 401);
    const u = Object.values(USERS).find(u => u.id === uid2)!;
    return respond(config, { accessToken: makeToken(u.id), refreshToken: makeToken(u.id) });
  }
  if (/\/auth\/logout$/.test(url)) return respond(config, null, 204);
  if (/\/auth\/recuperar-password$/.test(url)) return respond(config, { message: 'Si existe una cuenta con esos datos, recibirá instrucciones en su correo registrado' });
  if (/\/auth\/cambiar-password$/.test(url) && m === 'patch') {
    const user = getUserFromHeader(headers);
    if (!user) return reject('No autorizado', 401);
    if (user.password !== body['passwordActual']) return reject('Contraseña actual incorrecta', 401);
    user.password = body['passwordNueva'] as string;
    return respond(config, { message: 'Contraseña actualizada correctamente' });
  }
  if (/\/auth\/me$/.test(url) && m === 'get') {
    const user = getUserFromHeader(headers);
    if (!user) return reject('No autorizado', 401);
    return respond(config, { sub: user.id, rol: user.rol });
  }

  // Upload (HU-013)
  if (/\/upload$/.test(url) && m === 'post') {
    const user = getUserFromHeader(headers);
    if (!user) return reject('No autorizado', 401);
    if (config.data instanceof FormData) {
      const file = config.data.get('file') as File | null;
      if (!file) return reject('No se proporcionó archivo', 400);
      if (file.size > 2 * 1024 * 1024) return reject('El archivo no debe superar 2 MB', 400);
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (!['pdf','jpg','jpeg'].includes(ext)) return reject('Solo PDF, JPG o JPEG', 400);
      return respond(config, { url: URL.createObjectURL(file), filename: file.name });
    }
    return reject('Formato inválido', 400);
  }

  // HV Servidor
  if (/\/hoja-de-vida$/.test(url) && m === 'get') {
    const user = getUserFromHeader(headers); if (!user) return reject('No autorizado', 401);
    const hdv = hdvStore[user.id]; if (!hdv) return reject('Hoja de vida no encontrada', 404);
    return respond(config, hdv);
  }
  if (/\/datos-personales$/.test(url) && m === 'put') {
    const user = getUserFromHeader(headers); if (!user) return reject('No autorizado', 401);
    if (!hdvStore[user.id]) hdvStore[user.id] = { id: uid(), usuarioId: user.id, formacionAcademica: [], experienciaLaboral: [], experienciaDocente: [] };
    Object.assign(hdvStore[user.id], body); return respond(config, hdvStore[user.id]);
  }
  if (/\/datos-demograficos$/.test(url) && m === 'put') {
    const user = getUserFromHeader(headers); if (!user) return reject('No autorizado', 401);
    hdvStore[user.id]['datosDemograficos'] = body; return respond(config, body);
  }
  if (/\/datos-contacto$/.test(url) && m === 'put') {
    const user = getUserFromHeader(headers); if (!user) return reject('No autorizado', 401);
    hdvStore[user.id]['datosContacto'] = body; return respond(config, body);
  }

  // Formación
  if (/\/hoja-de-vida\/formacion$/.test(url) && m === 'post') {
    const user = getUserFromHeader(headers); if (!user) return reject('No autorizado', 401);
    const item = { ...body, id: uid(), createdAt: new Date().toISOString(), verificadoEdFormal: false };
    (hdvStore[user.id]['formacionAcademica'] as unknown[]).push(item);
    return respond(config, item, 201);
  }
  if (/\/hoja-de-vida\/formacion\/[^/]+$/.test(url) && m === 'put') {
    const user = getUserFromHeader(headers); if (!user) return reject('No autorizado', 401);
    const id = url.split('/').pop()!;
    const list = hdvStore[user.id]['formacionAcademica'] as Array<Record<string, unknown>>;
    const idx = list.findIndex(x => x['id'] === id); if (idx === -1) return reject('No encontrado', 404);
    if (list[idx]['verificadoEdFormal']) return reject('Este registro ha sido validado por el JTH y no puede modificarse.', 403);
    list[idx] = { ...list[idx], ...body }; return respond(config, list[idx]);
  }
  if (/\/hoja-de-vida\/formacion\/[^/]+$/.test(url) && m === 'delete') {
    const user = getUserFromHeader(headers); if (!user) return reject('No autorizado', 401);
    const id = url.split('/').pop()!;
    const list = hdvStore[user.id]['formacionAcademica'] as Array<Record<string, unknown>>;
    const item = list.find(x => x['id'] === id);
    if (item?.['verificadoEdFormal']) return reject('Este registro ha sido validado por el JTH y no puede eliminarse.', 403);
    hdvStore[user.id]['formacionAcademica'] = list.filter(x => x['id'] !== id); return respond(config, null, 204);
  }

  // Experiencia laboral
  if (/\/hoja-de-vida\/experiencia-laboral$/.test(url) && m === 'post') {
    const user = getUserFromHeader(headers); if (!user) return reject('No autorizado', 401);
    const item = { ...body, id: uid(), createdAt: new Date().toISOString(), verificado: false };
    (hdvStore[user.id]['experienciaLaboral'] as unknown[]).push(item); return respond(config, item, 201);
  }
  if (/\/experiencia-laboral\/[^/]+$/.test(url) && m === 'put') {
    const user = getUserFromHeader(headers); if (!user) return reject('No autorizado', 401);
    const id = url.split('/').pop()!;
    const list = hdvStore[user.id]['experienciaLaboral'] as Array<Record<string, unknown>>;
    const idx = list.findIndex(x => x['id'] === id); if (idx === -1) return reject('No encontrado', 404);
    if (list[idx]['verificado']) return reject('Este registro ha sido validado por el JTH y no puede modificarse.', 403);
    list[idx] = { ...list[idx], ...body }; return respond(config, list[idx]);
  }
  if (/\/experiencia-laboral\/[^/]+$/.test(url) && m === 'delete') {
    const user = getUserFromHeader(headers); if (!user) return reject('No autorizado', 401);
    const id = url.split('/').pop()!;
    const list = hdvStore[user.id]['experienciaLaboral'] as Array<Record<string, unknown>>;
    const item = list.find(x => x['id'] === id);
    if (item?.['verificado']) return reject('Este registro ha sido validado por el JTH y no puede eliminarse.', 403);
    hdvStore[user.id]['experienciaLaboral'] = list.filter(x => x['id'] !== id); return respond(config, null, 204);
  }

  // Experiencia docente
  if (/\/hoja-de-vida\/experiencia-docente$/.test(url) && m === 'post') {
    const user = getUserFromHeader(headers); if (!user) return reject('No autorizado', 401);
    const item = { ...body, id: uid(), createdAt: new Date().toISOString(), verificado: false };
    (hdvStore[user.id]['experienciaDocente'] as unknown[]).push(item); return respond(config, item, 201);
  }
  if (/\/experiencia-docente\/[^/]+$/.test(url) && m === 'put') {
    const user = getUserFromHeader(headers); if (!user) return reject('No autorizado', 401);
    const id = url.split('/').pop()!;
    const list = hdvStore[user.id]['experienciaDocente'] as Array<Record<string, unknown>>;
    const idx = list.findIndex(x => x['id'] === id); if (idx === -1) return reject('No encontrado', 404);
    if (list[idx]['verificado']) return reject('Este registro ha sido validado por el JTH y no puede modificarse.', 403);
    list[idx] = { ...list[idx], ...body }; return respond(config, list[idx]);
  }
  if (/\/experiencia-docente\/[^/]+$/.test(url) && m === 'delete') {
    const user = getUserFromHeader(headers); if (!user) return reject('No autorizado', 401);
    const id = url.split('/').pop()!;
    const list = hdvStore[user.id]['experienciaDocente'] as Array<Record<string, unknown>>;
    const item = list.find(x => x['id'] === id);
    if (item?.['verificado']) return reject('Este registro ha sido validado por el JTH y no puede eliminarse.', 403);
    hdvStore[user.id]['experienciaDocente'] = list.filter(x => x['id'] !== id); return respond(config, null, 204);
  }

  // ── JTH endpoints ────────────────────────────────────────────────────────
  if (/\/jth\/hojas-de-vida$/.test(url) && m === 'get') {
    const user = getUserFromHeader(headers); if (!user) return reject('No autorizado', 401);
    const result = Object.entries(USERS)
      .filter(([, u]) => u.rol === 'SERVIDOR_PUBLICO')
      .map(([numDoc, u]) => ({
        id: u.id, tipoDocumento: u.tipoDocumento, numeroDocumento: numDoc,
        correo: u.correo, activo: true,
        hojaDeVida: hdvStore[u.id] ? {
          id: hdvStore[u.id]['id'],
          primerNombre: hdvStore[u.id]['primerNombre'],
          primerApellido: hdvStore[u.id]['primerApellido'],
          updatedAt: new Date().toISOString(),
          formacionAcademica: hdvStore[u.id]['formacionAcademica'],
          experienciaLaboral: hdvStore[u.id]['experienciaLaboral'],
          experienciaDocente: hdvStore[u.id]['experienciaDocente'],
        } : null,
      }));
    return respond(config, result);
  }

  if (/\/jth\/hojas-de-vida\/[^/]+$/.test(url) && m === 'get') {
    const user = getUserFromHeader(headers); if (!user) return reject('No autorizado', 401);
    const usuarioId = url.split('/').pop()!;
    const target = Object.entries(USERS).find(([, u]) => u.id === usuarioId);
    if (!target) return reject('Usuario no encontrado', 404);
    const [numDoc, targetUser] = target;
    return respond(config, {
      id: targetUser.id, tipoDocumento: targetUser.tipoDocumento,
      numeroDocumento: numDoc, correo: targetUser.correo,
      hojaDeVida: hdvStore[targetUser.id] ?? null,
    });
  }

  if (/\/jth\/formacion\/[^/]+\/verificar$/.test(url) && m === 'patch') {
    const user = getUserFromHeader(headers); if (!user) return reject('No autorizado', 401);
    const id = url.split('/').slice(-2)[0];
    for (const hdv of Object.values(hdvStore)) {
      const list = hdv['formacionAcademica'] as Array<Record<string, unknown>>;
      const item = list.find(x => x['id'] === id);
      if (item) { item['verificadoEdFormal'] = body['verificado']; return respond(config, item); }
    }
    return reject('No encontrado', 404);
  }

  if (/\/jth\/experiencia\/[^/]+\/verificar$/.test(url) && m === 'patch') {
    const user = getUserFromHeader(headers); if (!user) return reject('No autorizado', 401);
    const id = url.split('/').slice(-2)[0];
    for (const hdv of Object.values(hdvStore)) {
      const list = hdv['experienciaLaboral'] as Array<Record<string, unknown>>;
      const item = list.find(x => x['id'] === id);
      if (item) { item['verificado'] = body['verificado']; return respond(config, item); }
    }
    return reject('No encontrado', 404);
  }

  if (/\/jth\/docente\/[^/]+\/verificar$/.test(url) && m === 'patch') {
    const user = getUserFromHeader(headers); if (!user) return reject('No autorizado', 401);
    const id = url.split('/').slice(-2)[0];
    for (const hdv of Object.values(hdvStore)) {
      const list = hdv['experienciaDocente'] as Array<Record<string, unknown>>;
      const item = list.find(x => x['id'] === id);
      if (item) { item['verificado'] = body['verificado']; return respond(config, item); }
    }
    return reject('No encontrado', 404);
  }

  // Usuarios
  if (/\/api\/v1\/usuarios$/.test(url) && m === 'get') return respond(config, usuariosStore);
  if (/\/api\/v1\/usuarios$/.test(url) && m === 'post') {
    const existe = usuariosStore.find(u => u['numeroDocumento'] === body['numeroDocumento'] || u['correo'] === body['correo']);
    if (existe) return reject('Ya existe un usuario con ese documento o correo', 409);
    const nu = { id: uid(), tipoDocumento: body['tipoDocumento'], numeroDocumento: body['numeroDocumento'], correo: body['correo'], rol: 'SERVIDOR_PUBLICO', activo: true, fechaFinRol: null, createdAt: new Date().toISOString() };
    usuariosStore.push(nu);
    USERS[body['numeroDocumento'] as string] = { id: nu.id as string, correo: nu.correo as string, password: `${body['numeroDocumento'] as string}Sigep2!`, rol: 'SERVIDOR_PUBLICO', tipoDocumento: body['tipoDocumento'] as string };
    return respond(config, nu, 201);
  }
  if (/\/usuarios\/[^/]+\/inhabilitar$/.test(url) && m === 'patch') {
    const id = url.split('/').slice(-2)[0];
    const u = usuariosStore.find(x => x['id'] === id); if (!u) return reject('Usuario no encontrado', 404);
    u['fechaFinRol'] = body['fechaFin']; u['activo'] = new Date(body['fechaFin'] as string) > new Date();
    return respond(config, { message: 'Rol inhabilitado correctamente' });
  }

  return null;
}

export function setupMockApi(instance: AxiosInstance): void {
  instance.defaults.adapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    const rawUrl = config.url ?? '';
    const url = rawUrl.replace(/^\/api\/v1/, '');
    console.log('[MockAPI]', config.method?.toUpperCase(), rawUrl);
    const result = handle({ ...config, url });
    if (result === null) throw Object.assign(new Error(`[MockAPI] Sin handler: ${rawUrl}`), {
      isAxiosError: true, response: { data: { message: 'Ruta no manejada' }, status: 501, headers: {}, config, statusText: '' },
    });
    return Promise.resolve(await result);
  };
  if ((import.meta as any).env?.DEV) {
    console.info('[MockAPI] ✅ Demo activo. CC 10000002/Servidor2024! · CC 10000001/Admin2024!');
  }
}
