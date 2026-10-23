const router = require('express').Router();
const db     = require('../db');
const { nombreDe } = require('../lib/auth');

const DEMO_PASSWORD = 'demo123';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }
  if (password !== DEMO_PASSWORD) {
    return res.status(401).json({ error: 'Contraseña incorrecta. En el MVP usa "demo123".' });
  }

  try {
    const [rows] = await db.query(
      `SELECT u.id, u.email, u.rol, u.estado,
              m.id AS medico_id, m.nombres, m.apellidos, m.cmp,
              p.id AS paciente_id, p.dni
         FROM USUARIO u
         LEFT JOIN MEDICO   m ON m.usuario_id = u.id
         LEFT JOIN PACIENTE p ON p.usuario_id = u.id
        WHERE u.email = ?
        LIMIT 1`,
      [email.trim()]
    );

    if (!rows.length) return res.status(401).json({ error: 'Usuario no encontrado en si_salud' });

    const user = rows[0];
    if (user.estado === 'Bloqueado') {
      return res.status(403).json({
        error: 'Cuenta bloqueada por exceso de reprogramaciones/cancelaciones. Contacte a administración.',
      });
    }

    req.session.user = {
      id:          user.id,
      email:       user.email,
      rol:         user.rol,
      estado:      user.estado,
      medico_id:   user.medico_id   || null,
      paciente_id: user.paciente_id || null,
      dni:         user.dni         || null,
      nombre:      nombreDe(user),
    };

    res.json({ ok: true, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo autenticar. ¿Está cargada la BD si_salud?' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'No autenticado' });
  res.json(req.session.user);
});

module.exports = router;
