const router = require('express').Router();
const db     = require('../db');
const { requireAuth, requireRol } = require('../lib/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.id, m.nombres, m.apellidos, m.cmp, m.jerarquia,
             GROUP_CONCAT(e.nombre ORDER BY e.nombre SEPARATOR ', ') AS especialidades
        FROM MEDICO m
        JOIN MEDICO_ESPECIALIDAD me ON me.medico_id = m.id
        JOIN ESPECIALIDAD e         ON e.id = me.especialidad_id
       GROUP BY m.id
       ORDER BY m.apellidos
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/especialidades', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nombre, descripcion FROM ESPECIALIDAD WHERE activa = 1 ORDER BY nombre'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agenda del médico en sesión — ANTES de /:id para no capturar "me"
router.get('/me/agenda', requireRol('Medico'), async (req, res) => {
  const { fecha } = req.query;
  const medicoId = req.session.user.medico_id;
  try {
    const [rows] = await db.query(`
      SELECT bh.id, bh.fecha, bh.hora_inicio, bh.hora_fin, bh.estado,
             c.numero_nombre AS consultorio, s.nombre AS sede,
             p.dni, u.email AS paciente_email,
             ci.id AS cita_id, ci.estado AS cita_estado,
             tc.nombre AS tipo_consulta,
             a.nombre  AS aseguradora,
             tk.codigo_turno
        FROM BLOQUE_HORARIO bh
        JOIN CONSULTORIO c   ON c.id  = bh.consultorio_id
        JOIN SEDE s          ON s.id  = c.sede_id
        LEFT JOIN CITA ci    ON ci.bloque_horario_id = bh.id
                            AND ci.estado <> 'Cancelada'
        LEFT JOIN PACIENTE p ON p.id  = ci.paciente_id
        LEFT JOIN USUARIO u  ON u.id  = p.usuario_id
        LEFT JOIN TIPO_CONSULTA tc ON tc.id = ci.tipo_consulta_id
        LEFT JOIN ASEGURADORA a    ON a.id  = ci.aseguradora_id
        LEFT JOIN TICKET_ASISTENCIA tk ON tk.cita_id = ci.id
       WHERE bh.medico_id = ?
         AND bh.fecha = ?
       ORDER BY bh.hora_inicio
    `, [medicoId, fecha || '2026-10-28']);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/me/fechas', requireRol('Medico'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT fecha FROM BLOQUE_HORARIO
        WHERE medico_id = ? ORDER BY fecha`,
      [req.session.user.medico_id]
    );
    res.json(rows.map(r => r.fecha));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/fechas', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT fecha,
              SUM(estado = 'Libre') AS libres
         FROM BLOQUE_HORARIO
        WHERE medico_id = ?
        GROUP BY fecha
        ORDER BY fecha`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/slots', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { fecha } = req.query;
  try {
    let query = `
      SELECT bh.id, bh.fecha, bh.hora_inicio, bh.hora_fin, bh.estado,
             c.numero_nombre AS consultorio,
             s.nombre        AS sede,
             fn_verificar_slot_libre(bh.id) AS es_libre
        FROM BLOQUE_HORARIO bh
        JOIN CONSULTORIO c ON c.id = bh.consultorio_id
        JOIN SEDE s        ON s.id = c.sede_id
       WHERE bh.medico_id = ?
    `;
    const params = [id];
    if (fecha) {
      query += ' AND bh.fecha = ?';
      params.push(fecha);
    }
    query += ' ORDER BY bh.fecha, bh.hora_inicio LIMIT 120';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
