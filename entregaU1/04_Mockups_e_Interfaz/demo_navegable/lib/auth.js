const NOMBRES = {
  'admin@sisalud.pe':         'Administrador SI-SALUD',
  'dr.torres@sisalud.pe':     'Dr. Roberto Torres Salas',
  'dra.quispe@sisalud.pe':    'Dra. Patricia Quispe Ramos',
  'dr.vargas@sisalud.pe':     'Dr. Alejandro Vargas Mendoza',
  'caja.central@sisalud.pe':  'Caja Central',
  'juan.perez@gmail.com':     'Juan Pérez',
  'maria.lopez@gmail.com':    'María López',
  'carlos.mendoza@gmail.com': 'Carlos Mendoza',
  'ana.flores@gmail.com':     'Ana Flores',
  'luis.garcia@gmail.com':    'Luis García',
};

function nombreDe(user) {
  if (user.nombres) return `${user.nombres} ${user.apellidos}`.trim();
  return NOMBRES[user.email] || (user.email || '').split('@')[0];
}

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'No autenticado' });
  next();
}

function requireRol(...roles) {
  return (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ error: 'No autenticado' });
    if (!roles.includes(req.session.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado para este rol' });
    }
    next();
  };
}

module.exports = { NOMBRES, nombreDe, requireAuth, requireRol };
