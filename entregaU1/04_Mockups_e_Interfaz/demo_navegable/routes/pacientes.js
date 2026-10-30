const router = require('express').Router();
const db     = require('../db');
const { requireRol, requireAuth, nombreDe } = require('../lib/auth');

const requirePaciente = requireRol('Paciente');

function scoreUrgencia(texto) {
  const t = (texto || '').toLowerCase();
  if (/inconscien|convulsion|dolor en el pecho|dificultad para respirar|hemorragia/.test(t)) return 9;
  if (/fiebre alta|diarrea intensa|palpitacion|no quiere comer|visión borrosa|vision borrosa/.test(t)) return 8;
  if (/fiebre|tos|vómito|vomito|cefalea|dolor/.test(t)) return 7;
  return 5;
}

router.get('/perfil', requirePaciente, async (req, res) => {
  const { paciente_id } = req.session.user;
  try {
    const [[row]] = await db.query(`
      SELECT p.id, p.dni, p.telefono, p.fecha_nacimiento,
             u.email, u.estado,
             fn_calcular_edad(p.fecha_nacimiento) AS edad
        FROM PACIENTE p
        JOIN USUARIO u ON u.id = p.usuario_id
       WHERE p.id = ?
    `, [paciente_id]);
    res.json(row || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/citas', requirePaciente, async (req, res) => {
  const { paciente_id } = req.session.user;
  try {
    const [rows] = await db.query(`
      SELECT c.id, c.estado,
             bh.fecha, bh.hora_inicio, bh.hora_fin,
             m.nombres AS medico_nombres, m.apellidos AS medico_apellidos,
             tc.nombre AS tipo_consulta,
             a.nombre  AS aseguradora,
             s.nombre  AS sede,
             co.numero_nombre AS consultorio,
             (SELECT GROUP_CONCAT(e.nombre ORDER BY e.nombre SEPARATOR ', ')
                FROM MEDICO_ESPECIALIDAD me
                JOIN ESPECIALIDAD e ON e.id = me.especialidad_id
               WHERE me.medico_id = m.id) AS especialidad,
             tk.codigo_turno
        FROM CITA c
        JOIN BLOQUE_HORARIO bh ON bh.id = c.bloque_horario_id
        JOIN MEDICO m          ON m.id  = c.medico_id
        JOIN TIPO_CONSULTA tc  ON tc.id = c.tipo_consulta_id
        LEFT JOIN ASEGURADORA a ON a.id = c.aseguradora_id
        JOIN CONSULTORIO co    ON co.id = bh.consultorio_id
        JOIN SEDE s            ON s.id  = co.sede_id
        LEFT JOIN TICKET_ASISTENCIA tk ON tk.cita_id = c.id
       WHERE c.paciente_id = ?
       ORDER BY bh.fecha DESC, bh.hora_inicio DESC
    `, [paciente_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/triaje', requirePaciente, async (req, res) => {
  const { especialidad_id, sintomas, preferencia_horario, modalidad } = req.body;
  const { paciente_id } = req.session.user;

  if (!especialidad_id || !sintomas) {
    return res.status(400).json({ error: 'especialidad_id y sintomas son requeridos' });
  }
  if (String(sintomas).trim().length < 20) {
    return res.status(400).json({ error: 'Describe tus síntomas con al menos 20 caracteres.' });
  }

  try {
    const [[usr]] = await db.query(
      'SELECT estado FROM USUARIO WHERE id = ?',
      [req.session.user.id]
    );
    if (usr?.estado === 'Bloqueado') {
      return res.status(403).json({ error: 'Tu cuenta está suspendida. Contacta a administración.' });
    }

    const [[esp]] = await db.query(
      'SELECT id, nombre, activa FROM ESPECIALIDAD WHERE id = ?',
      [especialidad_id]
    );
    if (!esp || !esp.activa) {
      return res.status(400).json({ error: 'La especialidad no está activa.' });
    }

    const [[perfil]] = await db.query(
      'SELECT fn_calcular_edad(fecha_nacimiento) AS edad FROM PACIENTE WHERE id = ?',
      [paciente_id]
    );
    if (esp.nombre === 'Pediatría' && Number(perfil.edad) > 18) {
      return res.status(400).json({
        error: 'La especialidad de Pediatría es exclusiva para pacientes de 0 a 18 años. Por favor selecciona otra especialidad.',
      });
    }

    const score = scoreUrgencia(sintomas);
    const [result] = await db.query(`
      INSERT INTO SOLICITUD_TRIAJE
        (paciente_id, especialidad_id, sintomas, preferencia_horario, score_urgencia, modalidad, estado)
      VALUES (?, ?, ?, ?, ?, ?, 'Pendiente')
    `, [
      paciente_id,
      especialidad_id,
      sintomas.trim(),
      preferencia_horario || 'Indiferente',
      score,
      modalidad || 'Presencial',
    ]);

    const nivel = score >= 8 ? 'Alta' : score >= 6 ? 'Media' : 'Baja';
    res.status(201).json({
      ok: true,
      solicitud_id: result.insertId,
      score_urgencia: score,
      mensaje: `Solicitud recibida (Urgencia: ${nivel}). Te contactaremos pronto.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/triaje', requirePaciente, async (req, res) => {
  const { paciente_id } = req.session.user;
  try {
    const [rows] = await db.query(`
      SELECT st.id, st.sintomas, st.preferencia_horario, st.score_urgencia,
             st.modalidad, st.estado,
             e.nombre AS especialidad
        FROM SOLICITUD_TRIAJE st
        JOIN ESPECIALIDAD e ON e.id = st.especialidad_id
       WHERE st.paciente_id = ?
       ORDER BY st.id DESC
    `, [paciente_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/ficha', requireAuth, async (req, res) => {
  const targetId = parseInt(req.params.id, 10);
  const user = req.session.user;

  if (user.rol === 'Paciente' && user.paciente_id !== targetId) {
    return res.status(403).json({ error: 'No tienes permiso para ver esta ficha médica' });
  }

  try {
    const [[p]] = await db.query(`
      SELECT p.id, p.dni, p.telefono, p.fecha_nacimiento,
             u.email, u.estado,
             fn_calcular_edad(p.fecha_nacimiento) AS edad
        FROM PACIENTE p
        JOIN USUARIO u ON u.id = p.usuario_id
       WHERE p.id = ?
    `, [targetId]);

    if (!p) return res.status(404).json({ error: 'Paciente no encontrado' });

    p.nombre = nombreDe(p);
    const parts = (p.nombre || '').split(' ');
    p.nombres = parts[0] || p.nombre;
    p.apellidos = parts.slice(1).join(' ') || '';

    const [triajes] = await db.query(`
      SELECT st.id, st.sintomas, st.preferencia_horario, st.score_urgencia,
             st.modalidad, st.estado,
             e.nombre AS especialidad
        FROM SOLICITUD_TRIAJE st
        JOIN ESPECIALIDAD e ON e.id = st.especialidad_id
       WHERE st.paciente_id = ?
       ORDER BY st.id DESC
    `, [targetId]);

    const [citas] = await db.query(`
      SELECT c.id, c.estado, bh.fecha, bh.hora_inicio, bh.hora_fin,
             m.nombres AS medico_nombres, m.apellidos AS medico_apellidos,
             tc.nombre AS tipo_consulta, a.nombre AS aseguradora,
             s.nombre AS sede, co.numero_nombre AS consultorio,
             tk.codigo_turno
        FROM CITA c
        JOIN BLOQUE_HORARIO bh ON bh.id = c.bloque_horario_id
        JOIN MEDICO m          ON m.id  = c.medico_id
        JOIN TIPO_CONSULTA tc  ON tc.id = c.tipo_consulta_id
        LEFT JOIN ASEGURADORA a ON a.id = c.aseguradora_id
        JOIN CONSULTORIO co    ON co.id = bh.consultorio_id
        JOIN SEDE s            ON s.id  = co.sede_id
        LEFT JOIN TICKET_ASISTENCIA tk ON tk.cita_id = c.id
       WHERE c.paciente_id = ?
       ORDER BY bh.fecha DESC, bh.hora_inicio DESC
    `, [targetId]);

    const [reprogramaciones] = await db.query(`
      SELECT hr.id, hr.cita_id, hr.motivo_cambio, hr.fecha_transaccion, hr.estado
        FROM HISTORIAL_REPROGRAMACION hr
        JOIN CITA c ON c.id = hr.cita_id
       WHERE c.paciente_id = ?
       ORDER BY hr.fecha_transaccion DESC
    `, [targetId]);

    res.json({
      paciente: p,
      triajes,
      citas,
      reprogramaciones,
      metricas: {
        total_citas: citas.length,
        atendidas: citas.filter(c => c.estado === 'Atendida').length,
        programadas: citas.filter(c => ['Programada', 'Reprogramada', 'Pagada'].includes(c.estado)).length,
        canceladas: citas.filter(c => c.estado === 'Cancelada').length,
        reprogramaciones: reprogramaciones.length,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
