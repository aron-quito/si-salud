const router = require('express').Router();
const db     = require('../db');
const { requireRol, nombreDe } = require('../lib/auth');
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
             e.id      AS especialidad_id,
             e.nombre  AS especialidad,
             u.email   AS paciente_email,
             p.id      AS paciente_id,
             p.dni     AS paciente_dni,
             p.telefono AS paciente_telefono,
             fn_calcular_edad(p.fecha_nacimiento) AS paciente_edad
        FROM SOLICITUD_TRIAJE st
        JOIN ESPECIALIDAD e ON e.id = st.especialidad_id
        JOIN PACIENTE p     ON p.id = st.paciente_id
        JOIN USUARIO u      ON u.id = p.usuario_id
       ORDER BY st.score_urgencia DESC, st.id ASC
    `);
    const mapped = rows.map(t => ({
      ...t,
      paciente_nombre: nombreDe({ email: t.paciente_email })
    }));
    res.json(mapped);
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
             m.id AS medico_id, m.nombres AS medico_nombres, m.apellidos AS medico_apellidos,
             p.id AS paciente_id, u_p.email AS paciente_email, p.dni AS paciente_dni, p.telefono AS paciente_telefono,
             fn_calcular_edad(p.fecha_nacimiento) AS paciente_edad,
             c.solicitud_id,
             tc.id AS tipo_consulta_id, tc.nombre AS tipo_consulta,
             a.id  AS aseguradora_id, a.nombre  AS aseguradora,
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
    const mapped = rows.map(c => ({
      ...c,
      paciente_nombre: nombreDe({ email: c.paciente_email })
    }));
    res.json(mapped);
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
             p.id AS paciente_id, p.dni, u.email AS paciente_email,
             e.nombre AS especialidad
        FROM LISTA_ESPERA le
        JOIN PACIENTE p ON p.id = le.paciente_id
        JOIN USUARIO u  ON u.id = p.usuario_id
        JOIN ESPECIALIDAD e ON e.id = le.especialidad_id
       ORDER BY le.prioridad DESC, le.fecha_ingreso ASC
    `);
    const mapped = rows.map(r => ({
      ...r,
      paciente_nombre: nombreDe({ email: r.paciente_email })
    }));
    res.json(mapped);
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

router.get('/algoritmo/candidatos/:solicitud_id', requireStaff, async (req, res) => {
  const solicitudId = parseInt(req.params.solicitud_id, 10);
  try {
    const [[st]] = await db.query(`
      SELECT st.id, st.paciente_id, st.especialidad_id, st.sintomas,
             st.preferencia_horario, st.score_urgencia, st.modalidad, st.estado,
             e.nombre AS especialidad_nombre,
             p.dni AS paciente_dni, p.telefono AS paciente_telefono,
             u.email AS paciente_email,
             fn_calcular_edad(p.fecha_nacimiento) AS paciente_edad
        FROM SOLICITUD_TRIAJE st
        JOIN ESPECIALIDAD e ON e.id = st.especialidad_id
        JOIN PACIENTE p     ON p.id = st.paciente_id
        JOIN USUARIO u      ON u.id = p.usuario_id
       WHERE st.id = ?
    `, [solicitudId]);

    if (!st) return res.status(404).json({ error: 'Solicitud de triaje no encontrada' });
    st.paciente_nombre = nombreDe({ email: st.paciente_email });

    // Médicos con esa especialidad
    const [medicos] = await db.query(`
      SELECT m.id, m.nombres, m.apellidos, m.cmp, m.jerarquia
        FROM MEDICO m
        JOIN MEDICO_ESPECIALIDAD me ON me.medico_id = m.id
       WHERE me.especialidad_id = ?
       ORDER BY m.apellidos
    `, [st.especialidad_id]);

    const medicoIds = medicos.map(m => m.id);
    let slots = [];
    if (medicoIds.length) {
      const [freeSlots] = await db.query(`
        SELECT bh.id, bh.medico_id, bh.fecha, bh.hora_inicio, bh.hora_fin,
               c.numero_nombre AS consultorio, s.nombre AS sede,
               CONCAT(m.nombres, ' ', m.apellidos) AS medico_nombre
          FROM BLOQUE_HORARIO bh
          JOIN MEDICO m       ON m.id = bh.medico_id
          JOIN CONSULTORIO c  ON c.id = bh.consultorio_id
          JOIN SEDE s         ON s.id = c.sede_id
         WHERE bh.medico_id IN (?)
           AND bh.estado = 'Libre'
         ORDER BY bh.fecha ASC, bh.hora_inicio ASC
      `, [medicoIds]);
      slots = freeSlots;
    }

    // Ponderación y scoring algorítmico de cada slot
    const evaluatedSlots = slots.map(slot => {
      let score = 50; // Especialidad compatible
      const hora = parseInt(slot.hora_inicio.slice(0, 2), 10);
      const esManana = hora < 13;
      const matchPref = (st.preferencia_horario === 'Mañanas' && esManana) ||
                        (st.preferencia_horario === 'Tardes' && !esManana) ||
                        (st.preferencia_horario === 'Indiferente');
      if (matchPref) score += 30;
      // Urgencia alta prioriza fechas más próximas
      if (st.score_urgencia >= 8) score += 20;

      return {
        bloque_id:            slot.id,
        medico_id:            slot.medico_id,
        medico_nombre:        slot.medico_nombre,
        fecha:                slot.fecha,
        hora_inicio:          slot.hora_inicio,
        hora_fin:             slot.hora_fin,
        consultorio:          slot.consultorio,
        sede:                 slot.sede,
        score_total:          score,
        coincide_preferencia: matchPref,
        turno_texto:          esManana ? 'Mañana' : 'Tarde'
      };
    }).sort((a, b) => b.score_total - a.score_total || a.fecha.localeCompare(b.fecha) || a.hora_inicio.localeCompare(b.hora_inicio));

    res.json({
      solicitud_id:        st.id,
      especialidad:        st.especialidad_nombre,
      preferencia_horario: st.preferencia_horario,
      score_urgencia:      st.score_urgencia,
      candidatos:          evaluatedSlots,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Asignación manual: admin elige un slot específico para un triaje
router.post('/algoritmo/asignar-manual', requireAdmin, async (req, res) => {
  const { solicitud_id, bloque_id } = req.body;
  if (!solicitud_id || !bloque_id) return res.status(400).json({ error: 'solicitud_id y bloque_id son requeridos' });
  try {
    // Obtener paciente del triaje
    const [[triaje]] = await db.query(`
      SELECT st.paciente_id, st.id, u.email
        FROM SOLICITUD_TRIAJE st
        JOIN PACIENTE p ON p.id = st.paciente_id
        JOIN USUARIO  u ON u.id = p.usuario_id
       WHERE st.id = ? AND st.estado = 'Pendiente'
    `, [solicitud_id]);

    if (!triaje) return res.status(404).json({ error: 'Triaje no encontrado o ya fue procesado' });

    const { callWithOut } = require('../lib/sp');
    const result = await callWithOut(
      'CALL sp_registrar_cita_medica(?, ?, 1, 1, ?, @cita_id, @mensaje)',
      [triaje.paciente_id, bloque_id, solicitud_id],
      'SELECT @cita_id AS cita_id, @mensaje AS mensaje'
    );

    if (result.cita_id === -1) return res.status(409).json({ error: result.mensaje });

    const { nombreDe } = require('../lib/auth');
    res.json({
      ok:          true,
      cita_id:     result.cita_id,
      solicitud_id,
      paciente:    nombreDe({ email: triaje.email }),
      mensaje:     result.mensaje || `Cita #${result.cita_id} asignada manualmente`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/algoritmo/auto-asignar', requireAdmin, async (req, res) => {
  try {
    const [[topTriaje]] = await db.query(`
      SELECT st.id, st.paciente_id, st.especialidad_id, st.sintomas,
             st.score_urgencia, st.preferencia_horario,
             u.email, p.dni
        FROM SOLICITUD_TRIAJE st
        JOIN PACIENTE p ON p.id = st.paciente_id
        JOIN USUARIO u  ON u.id = p.usuario_id
       WHERE st.estado = 'Pendiente'
       ORDER BY st.score_urgencia DESC, st.id ASC
       LIMIT 1
    `);

    if (!topTriaje) {
      return res.status(404).json({ error: 'No hay solicitudes de triaje pendientes en la bolsa' });
    }

    const [medicos] = await db.query(`
      SELECT medico_id FROM MEDICO_ESPECIALIDAD WHERE especialidad_id = ?
    `, [topTriaje.especialidad_id]);

    if (!medicos.length) {
      return res.status(400).json({ error: 'No hay médicos registrados para esta especialidad' });
    }

    const mIds = medicos.map(m => m.medico_id);

    const [freeSlots] = await db.query(`
      SELECT bh.id, bh.medico_id, bh.fecha, bh.hora_inicio, bh.hora_fin,
             c.numero_nombre AS consultorio, s.nombre AS sede,
             CONCAT(m.nombres, ' ', m.apellidos) AS medico_nombre
        FROM BLOQUE_HORARIO bh
        JOIN MEDICO m      ON m.id = bh.medico_id
        JOIN CONSULTORIO c ON c.id = bh.consultorio_id
        JOIN SEDE s        ON s.id = c.sede_id
       WHERE bh.medico_id IN (?)
         AND bh.estado = 'Libre'
       ORDER BY bh.fecha ASC, bh.hora_inicio ASC
    `, [mIds]);

    if (!freeSlots.length) {
      return res.status(409).json({ error: `Sin slots libres disponibles para la especialidad del triaje #${topTriaje.id}` });
    }

    let chosenSlot = freeSlots.find(s => {
      const h = parseInt(s.hora_inicio.slice(0, 2), 10);
      return (topTriaje.preferencia_horario === 'Mañanas' && h < 13) ||
             (topTriaje.preferencia_horario === 'Tardes' && h >= 13);
    }) || freeSlots[0];

    const result = await callWithOut(
      'CALL sp_registrar_cita_medica(?, ?, 1, 1, ?, @cita_id, @mensaje)',
      [topTriaje.paciente_id, chosenSlot.id, topTriaje.id],
      'SELECT @cita_id AS cita_id, @mensaje AS mensaje'
    );

    if (result.cita_id === -1) {
      return res.status(409).json({ error: result.mensaje });
    }

    const pacienteNombre = nombreDe({ email: topTriaje.email });
    res.json({
      ok: true,
      cita_id: result.cita_id,
      solicitud_id: topTriaje.id,
      paciente: pacienteNombre,
      dni: topTriaje.dni,
      score_urgencia: topTriaje.score_urgencia,
      medico: chosenSlot.medico_nombre,
      fecha: chosenSlot.fecha,
      hora: `${chosenSlot.hora_inicio.slice(0, 5)} - ${chosenSlot.hora_fin.slice(0, 5)}`,
      consultorio: `${chosenSlot.consultorio} (${chosenSlot.sede})`,
      mensaje: `Asignación Algorítmica exitosa: Cita #${result.cita_id} programada para ${pacienteNombre} con Dr/a. ${chosenSlot.medico_nombre} el ${chosenSlot.fecha} a las ${chosenSlot.hora_inicio.slice(0, 5)}.`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
