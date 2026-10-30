const router = require('express').Router();
const db     = require('../db');
const { requireAuth } = require('../lib/auth');
const { callWithOut } = require('../lib/sp');

// POST /api/citas  →  sp_registrar_cita_medica
// SOLO Admin y Cajero pueden registrar citas directamente.
// Los pacientes deben pasar por el flujo de triaje (POST /api/paciente/triaje)
// y el administrador es quien asigna el horario algorítmicamente.
router.post('/', requireAuth, async (req, res) => {
  const rol = req.session.user.rol;

  // RBAC: el paciente no puede auto-agendar (ver Plan_Proyecto_SI_SALUD.md §HU-01/HU-02)
  if (rol === 'Paciente') {
    return res.status(403).json({
      error: 'Los pacientes no pueden agendar citas directamente. ' +
             'Solicita un triaje y el sistema te asignará el horario óptimo.',
    });
  }

  const { bloque_id, tipo_consulta_id, aseguradora_id, solicitud_id } = req.body;
  let paciente_id = null;
  if (['Admin', 'Cajero'].includes(rol) && req.body.paciente_id) {
    paciente_id = parseInt(req.body.paciente_id, 10);
  }

  if (!paciente_id) {
    return res.status(400).json({ error: 'paciente_id es requerido (Admin/Cajero)' });
  }
  if (!bloque_id || !tipo_consulta_id || !aseguradora_id) {
    return res.status(400).json({ error: 'bloque_id, tipo_consulta_id y aseguradora_id son requeridos' });
  }

  try {
    const result = await callWithOut(
      'CALL sp_registrar_cita_medica(?, ?, ?, ?, ?, @cita_id, @mensaje)',
      [paciente_id, bloque_id, tipo_consulta_id, aseguradora_id, solicitud_id || null],
      'SELECT @cita_id AS cita_id, @mensaje AS mensaje'
    );

    if (result.cita_id === -1) {
      return res.status(409).json({ error: result.mensaje });
    }
    res.status(201).json({ ok: true, cita_id: result.cita_id, mensaje: result.mensaje });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/citas/:id/cancelar  →  sp_cancelar_cita_reactiva
router.post('/:id/cancelar', requireAuth, async (req, res) => {
  const { motivo } = req.body;
  const cita_id = parseInt(req.params.id, 10);
  if (!motivo) return res.status(400).json({ error: 'El motivo de cancelación es requerido' });

  try {
    if (req.session.user.rol === 'Paciente') {
      const [[own]] = await db.query(
        'SELECT id FROM CITA WHERE id = ? AND paciente_id = ?',
        [cita_id, req.session.user.paciente_id]
      );
      if (!own) return res.status(403).json({ error: 'No puedes cancelar una cita que no es tuya' });
    }

    const result = await callWithOut(
      'CALL sp_cancelar_cita_reactiva(?, ?, @paciente_espera)',
      [cita_id, motivo],
      'SELECT @paciente_espera AS paciente_espera_id'
    );
    res.json({
      ok: true,
      paciente_espera_id: result.paciente_espera_id,
      mensaje: 'Cita cancelada. El bloque horario quedó Libre.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/citas/:id/checkin  →  sp_registrar_asistencia_ticket
router.post('/:id/checkin', requireAuth, async (req, res) => {
  if (!['Admin', 'Cajero', 'Medico'].includes(req.session.user.rol)) {
    return res.status(403).json({ error: 'Solo recepción, admin o médico pueden hacer check-in' });
  }
  const cita_id = parseInt(req.params.id, 10);

  try {
    const result = await callWithOut(
      'CALL sp_registrar_asistencia_ticket(?, @codigo_turno)',
      [cita_id],
      'SELECT @codigo_turno AS codigo_turno'
    );

    if (!result.codigo_turno || result.codigo_turno === 'ERROR') {
      return res.status(409).json({
        error: 'Cita no válida para check-in (debe estar Programada o Pagada).',
      });
    }
    res.json({ ok: true, codigo_turno: result.codigo_turno });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/citas/:id/reprogramar  →  sp_reprogramar_cita
router.put('/:id/reprogramar', requireAuth, async (req, res) => {
  const { nuevo_bloque_id, motivo } = req.body;
  const cita_id = parseInt(req.params.id, 10);
  if (!nuevo_bloque_id || !motivo) {
    return res.status(400).json({ error: 'nuevo_bloque_id y motivo son requeridos' });
  }

  try {
    if (req.session.user.rol === 'Paciente') {
      const [[own]] = await db.query(
        'SELECT id FROM CITA WHERE id = ? AND paciente_id = ?',
        [cita_id, req.session.user.paciente_id]
      );
      if (!own) return res.status(403).json({ error: 'No puedes reprogramar una cita que no es tuya' });
    }

    const result = await callWithOut(
      'CALL sp_reprogramar_cita(?, ?, ?, @msg_repro)',
      [cita_id, nuevo_bloque_id, motivo],
      'SELECT @msg_repro AS mensaje'
    );

    const msg = result.mensaje || '';
    if (String(msg).startsWith('Error')) {
      return res.status(409).json({ error: msg });
    }
    res.json({ ok: true, mensaje: msg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/tipos', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nombre, duracion_base_minutos FROM TIPO_CONSULTA WHERE activo = 1'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/aseguradoras', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nombre, tipo FROM ASEGURADORA WHERE activa = 1'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
