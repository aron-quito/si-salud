// ─────────────────────────────────────────────────────────────
//  server.js · MVP SI-SALUD (Entrega U1)
//  Express + sesión + procedimientos MySQL oficiales
// ─────────────────────────────────────────────────────────────
const fs      = require('fs');
const path    = require('path');
const express = require('express');
const session = require('express-session');

// Cargar .env simple (sin dependencia extra)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  name: 'si_salud.sid',
  secret: process.env.SESSION_SECRET || 'si_salud_secret_u1_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000, httpOnly: true },
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/capturas', express.static(path.join(__dirname, '..', 'capturas_pantallas')));

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/medicos',      require('./routes/medicos'));
app.use('/api/paciente',     require('./routes/pacientes'));
app.use('/api/citas',        require('./routes/citas'));
app.use('/api/admin',        require('./routes/admin'));
app.use('/api/laboratorio',  require('./routes/laboratorio'));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Ruta no encontrada' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🏥 SI-SALUD MVP  →  http://localhost:${PORT}`);
  console.log('   BD: si_salud (script oficial 01_Base_de_Datos_MySQL)');
  console.log('   Clave demo: demo123  ·  Laboratorio U1: rol Admin\n');
});
