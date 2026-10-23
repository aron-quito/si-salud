const router = require('express').Router();
const db     = require('../db');
const { requireRol } = require('../lib/auth');
const { callWithOut } = require('../lib/sp');

const requireStaff = requireRol('Admin', 'Cajero');
const requireAdmin = requireRol('Admin');

router.get('/stats', requireStaff, async (req, res) => {
  try {
    const [[citas]]     = await db.query('SELECT COUNT(*) AS total FROM CITA');
    const [[libres]]    = await db.query("SELECT COUNT(*) AS total FROM BLOQUE_HORARIO WHERE estado='Libre'");
    const [[ocupados]]  = await db.query("SELECT COUNT(*) AS total FROM BLOQUE_HORARIO WHERE estado='Ocupado'");
    const [[triaje]]    = await db.query("SELECT COUNT(*) AS total FROM SOLICITUD_TRIAJE WHERE estado='Pendiente'");
    const [[espera]]    = await db.query("SELECT COUNT(*) AS total FROM LISTA_ESPERA WHERE estado='En Espera'");
    const [[pacientes]] = await db.query('SELECT COUNT(*) AS total FROM PACIENTE');
    const [[tickets]]   = await db.query('SELECT COUNT(*) AS total FROM TICKET_ASISTENCIA');
    res.json({
      citas_total:       citas.total,
      bloques_libres:    libres.total,
      bloques_ocupados:  ocupados.total,
      triaje_pendiente:  triaje.total,
      lista_espera:      espera.total,
      total_pacientes:   pacientes.total,
      tickets:           tickets.total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/triaje', requireStaff, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT st.id, st.sintomas, st.preferencia_horario, st.score_urgencia,
             st.modalidad, st.estado,
             e.nombre  AS especialidad,
             u.email   AS paciente_email,
             p.dni     AS paciente_dni,
             fn_calcular_edad(p.fecha_nacimiento) AS paciente_edad
        FROM SOLICITUD_TRIAJE st
        JOIN ESPECIALIDAD e ON e.id = st.especialidad_id
        JOIN PACIENTE p     ON p.id = st.paciente_id
        JOIN USUARIO u      ON u.id = p.usuario_id
       ORDER BY st.score_urgencia DESC, st.id ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/citas', requireStaff, async (req, res) => {
  const { fecha, dni, cita_id } = req.query;
  try {
    let q = `
      SELECT c.id, c.estado,
             bh.fecha, bh.hora_inicio, bh.hora_fin,
             m.nombres AS medico_nombres, m.apellidos AS medico_apellidos,
             u_p.email AS paciente_email, p.dni AS paciente_dni,
             tc.nombre AS tipo_consulta,
             a.nombre  AS aseguradora,
             s.nombre  AS sede,
             co.numero_nombre AS consultorio,
             tk.codigo_turno
        FROM CITA c
        JOIN BLOQUE_HORARIO bh ON bh.id = c.bloque_horario_id
        JOIN MEDICO m          ON m.id  = c.medico_id
        JOIN PACIENTE p        ON p.id  = c.paciente_id
        JOIN USUARIO u_p       ON u_p.id = p.usuario_id
        JOIN TIPO_CONSULTA tc  ON tc.id = c.tipo_consulta_id
        LEFT JOIN ASEGURADORA a ON a.id = c.aseguradora_id
        JOIN CONSULTORIO co    ON co.id = bh.consultorio_id
        JOIN SEDE s            ON s.id  = co.sede_id
        LEFT JOIN TICKET_ASISTENCIA tk ON tk.cita_id = c.id
       WHERE 1=1
    `;
    const params = [];
    if (fecha)   { q += ' AND bh.fecha = ?'; params.push(fecha); }
    if (dni)     { q += ' AND p.dni = ?';    params.push(dni); }
    if (cita_id) { q += ' AND c.id = ?';     params.push(cita_id); }
    q += ' ORDER BY bh.fecha DESC, bh.hora_inicio';
    const [rows] = await db.query(q, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/bloques', requireAdmin, async (req, res) => {
  const { medico_id, consultorio_id, fecha, hora_inicio, hora_fin, intervalo } = req.body;
  if (!medico_id || !consultorio_id || !fecha || !hora_inicio || !hora_fin || !intervalo) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  try {
    const result = await callWithOut(
      'CALL sp_crear_bloques_horarios(?, ?, ?, ?, ?, ?, @bloques_creados)',
      [medico_id, consultorio_id, fecha, hora_inicio, hora_fin, intervalo],
      'SELECT @bloques_creados AS total'
    );
    res.json({ ok: true, bloques_creados: result.total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/medicos', requireStaff, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.id, m.nombres, m.apellidos, m.cmp, m.jerarquia,
             GROUP_CONCAT(e.nombre SEPARATOR ', ') AS especialidades
        FROM MEDICO m
        JOIN MEDICO_ESPECIALIDAD me ON me.medico_id = m.id
        JOIN ESPECIALIDAD e ON e.id = me.especialidad_id
       GROUP BY m.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/consultorios', requireStaff, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.id, c.numero_nombre, s.nombre AS sede
        FROM CONSULTORIO c
        JOIN SEDE s ON s.id = c.sede_id
       WHERE c.activo = 1
       ORDER BY s.nombre, c.numero_nombre
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/espera', requireStaff, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT le.id, le.prioridad, le.estado, le.fecha_ingreso,
             p.dni, u.email AS paciente_email,
             e.nombre AS especialidad
        FROM LISTA_ESPERA le
        JOIN PACIENTE p ON p.id = le.paciente_id
        JOIN USUARIO u  ON u.id = p.usuario_id
        JOIN ESPECIALIDAD e ON e.id = le.especialidad_id
       ORDER BY le.prioridad DESC, le.fecha_ingreso ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/usuarios', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, email, rol, estado FROM USUARIO ORDER BY id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/usuarios/:id/desbloquear', requireAdmin, async (req, res) => {
  try {
    await db.query(`UPDATE USUARIO SET estado = 'Activo' WHERE id = ?`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
