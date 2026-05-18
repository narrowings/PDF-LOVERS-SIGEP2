import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = '/api/v1';

const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token!));
  failedQueue = [];
};

http.interceptors.response.use(
  r => r,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);
    const orig = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !orig._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then(token => { orig.headers['Authorization'] = `Bearer ${token}`; return http(orig); });
      }
      orig._retry = true; isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) { localStorage.removeItem('accessToken'); window.location.href = '/login'; return Promise.reject(error); }
      try {
        const res = await http.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken });
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        processQueue(null, res.data.accessToken);
        orig.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
        return http(orig);
      } catch (e) {
        processQueue(e, null);
        localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken');
        window.location.href = '/login'; return Promise.reject(e);
      } finally { isRefreshing = false; }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login:             (d: { tipoDocumento: string; numeroDocumento: string; password: string }) => http.post('/auth/login', d),
  refresh:           (d: { refreshToken: string }) => http.post('/auth/refresh', d),
  logout:            (d: { refreshToken: string }) => http.post('/auth/logout', d),
  me:                () => http.get('/auth/me'),
  cambiarPassword:   (d: { passwordActual: string; passwordNueva: string; passwordConfirmacion: string }) => http.patch('/auth/cambiar-password', d),
  recuperarPassword: (d: { tipoDocumento: string; numeroDocumento: string }) => http.post('/auth/recuperar-password', d),
};

export const hvApi = {
  getHojaDeVida:        () => http.get('/hoja-de-vida'),
  saveDatosPersonales:  (d: unknown) => http.put('/hoja-de-vida/datos-personales', d),
  saveDatosDemograficos:(d: unknown) => http.put('/hoja-de-vida/datos-demograficos', d),
  saveDatosContacto:    (d: unknown) => http.put('/hoja-de-vida/datos-contacto', d),
  createFormacion:      (d: unknown) => http.post('/hoja-de-vida/formacion', d),
  updateFormacion:      (id: string, d: unknown) => http.put(`/hoja-de-vida/formacion/${id}`, d),
  deleteFormacion:      (id: string) => http.delete(`/hoja-de-vida/formacion/${id}`),
  createExperiencia:    (d: unknown) => http.post('/hoja-de-vida/experiencia-laboral', d),
  updateExperiencia:    (id: string, d: unknown) => http.put(`/hoja-de-vida/experiencia-laboral/${id}`, d),
  deleteExperiencia:    (id: string) => http.delete(`/hoja-de-vida/experiencia-laboral/${id}`),
  createDocente:        (d: unknown) => http.post('/hoja-de-vida/experiencia-docente', d),
  updateDocente:        (id: string, d: unknown) => http.put(`/hoja-de-vida/experiencia-docente/${id}`, d),
  deleteDocente:        (id: string) => http.delete(`/hoja-de-vida/experiencia-docente/${id}`),
};

export const uploadApi = {
  uploadDocumento: (file: File): Promise<AxiosResponse<{ url: string; filename: string }>> => {
    const fd = new FormData(); fd.append('file', file);
    return http.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// ── JTH API ──────────────────────────────────────────────────────────────────
export const jthApi = {
  listarHojas:    () => http.get('/jth/hojas-de-vida'),
  getHojaCompleta:(usuarioId: string) => http.get(`/jth/hojas-de-vida/${usuarioId}`),
  verificar: (
    tipo: 'formacion' | 'experiencia' | 'docente',
    id: string,
    verificado: boolean,
  ) => {
    const endpoints: Record<string, string> = {
      formacion:  `/jth/formacion/${id}/verificar`,
      experiencia:`/jth/experiencia/${id}/verificar`,
      docente:    `/jth/docente/${id}/verificar`,
    };
    return http.patch(endpoints[tipo]!, { verificado });
  },
};

export const usuarioApi = {
  listar:      () => http.get('/usuarios'),
  crear:       (d: unknown) => http.post('/usuarios', d),
  inhabilitar: (id: string, d: { fechaFin: string }) => http.patch(`/usuarios/${id}/inhabilitar`, d),
};

export default http;
export { http };
