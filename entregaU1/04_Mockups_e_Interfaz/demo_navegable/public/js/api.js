const API = {
  async _fetch(method, url, body) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  },

  get:    (url)        => API._fetch('GET',    url),
  post:   (url, body)  => API._fetch('POST',   url, body),
  put:    (url, body)  => API._fetch('PUT',    url, body),
  delete: (url, body)  => API._fetch('DELETE', url, body),

  me:      () => API.get('/api/auth/me'),
  login:   (email, password) => API.post('/api/auth/login', { email, password }),
  logout:  () => API.post('/api/auth/logout'),

  medicos:        () => API.get('/api/medicos'),
  especialidades: () => API.get('/api/medicos/especialidades'),
  tipos:          () => API.get('/api/citas/tipos'),
  aseguradoras:   () => API.get('/api/citas/aseguradoras'),
  slots:          (medicoId, fecha) => API.get(`/api/medicos/${medicoId}/slots?fecha=${fecha || ''}`),
  fechasMedico:   (medicoId) => API.get(`/api/medicos/${medicoId}/fechas`),

  perfil:    () => API.get('/api/paciente/perfil'),
  misCitas:  () => API.get('/api/paciente/citas'),
  misTriajes:() => API.get('/api/paciente/triaje'),

  agendarCita:     (data) => API.post('/api/citas', data),
  cancelarCita:    (id, motivo) => API.post(`/api/citas/${id}/cancelar`, { motivo }),
  checkinCita:     (id) => API.post(`/api/citas/${id}/checkin`),
  reprogramarCita: (id, data) => API.put(`/api/citas/${id}/reprogramar`, data),
  solicitarTriaje: (data) => API.post('/api/paciente/triaje', data),

  agendaMedico: (fecha) => API.get(`/api/medicos/me/agenda?fecha=${fecha || ''}`),
  fechasAgenda: () => API.get('/api/medicos/me/fechas'),

  stats:             () => API.get('/api/admin/stats'),
  allTriaje:         () => API.get('/api/admin/triaje'),
  allCitas:          (q = '') => API.get(`/api/admin/citas${q}`),
  crearBloques:      (data) => API.post('/api/admin/bloques', data),
  adminMedicos:      () => API.get('/api/admin/medicos'),
  adminConsultorios: () => API.get('/api/admin/consultorios'),
  listaEspera:       () => API.get('/api/admin/espera'),
  usuarios:          () => API.get('/api/admin/usuarios'),
  desbloquear:       (id) => API.post(`/api/admin/usuarios/${id}/desbloquear`),

  labEstado:    () => API.get('/api/laboratorio/estado'),
  labPasos:     () => API.get('/api/laboratorio/pasos'),
  labEjecutar:  (paso) => API.post(`/api/laboratorio/ejecutar/${paso}`),
  labSecuencia: () => API.post('/api/laboratorio/secuencia'),
  labResetSeed: () => API.post('/api/laboratorio/reset-seed'),
};

function toast(msg, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type] || ''}</span><span>${msg}</span>`;
  const box = document.getElementById('toast-container');
  if (box) box.appendChild(el);
  setTimeout(() => el.remove(), 4500);
}

async function requireSession(allowedRoles = []) {
  try {
    const user = await API.me();
    if (allowedRoles.length && !allowedRoles.includes(user.rol)) {
      location.href = '/';
      return null;
    }
    return user;
  } catch {
    location.href = '/';
    return null;
  }
}

function fmtDate(str) {
  if (!str) return '—';
  const s = String(str).slice(0, 10);
  const [y, m, d] = s.split('-');
  if (!y || !m || !d) return String(str);
  return `${d}/${m}/${y}`;
}

function fmtTime(str) {
  if (!str) return '—';
  return String(str).slice(0, 5);
}

function badgeEstado(estado) {
  const map = {
    Programada: 'primary', Pagada: 'success', Cancelada: 'danger',
    Reprogramada: 'warning', Atendida: 'success', Libre: 'success',
    Ocupado: 'info', Pendiente: 'warning', Agendado: 'primary',
    'En Espera': 'neutral', Activo: 'success', Bloqueado: 'danger',
    Impreso: 'primary', Atendido: 'success',
  };
  return `<span class="badge badge-${map[estado] || 'neutral'}">${estado || '—'}</span>`;
}

async function doLogout() {
  await API.logout();
  location.href = '/';
}
