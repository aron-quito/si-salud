// ─────────────────────────────────────────────────────────────
//  Laboratorio U1 · Reproduce pruebas_procedimientos_mysql.txt
//  contra la BD oficial si_salud (mismos CALL / mismos IDs).
// ─────────────────────────────────────────────────────────────
const router = require('express').Router();
const db     = require('../db');
const { requireRol } = require('../lib/auth');
const { callWithOut, withConnection } = require('../lib/sp');

const requireAdmin = requireRol('Admin');

function cmp(actual, esperado, modo = 'eq') {
  if (esperado === undefined || esperado === null) return { ok: true, actual, esperado };
  if (modo === 'includes') {
    const a = String(actual ?? '');
    return { ok: a.includes(String(esperado)), actual, esperado };
  }
  if (modo === 'gte') return { ok: Number(actual) >= Number(esperado), actual, esperado };
  return { ok: String(actual) === String(esperado), actual, esperado };
}

router.get('/estado', requireAdmin, async (req, res) => {
  try {
    const [[u]]  = await db.query('SELECT COUNT(*) AS n FROM USUARIO');
    const [[m]]  = await db.query('SELECT COUNT(*) AS n FROM MEDICO');
    const [[p]]  = await db.query('SELECT COUNT(*) AS n FROM PACIENTE');
    const [[b]]  = await db.query('SELECT COUNT(*) AS n FROM BLOQUE_HORARIO');
    const [[t]]  = await db.query('SELECT COUNT(*) AS n FROM SOLICITUD_TRIAJE');
    const [[c]]  = await db.query('SELECT COUNT(*) AS n FROM CITA');
    const [[h]]  = await db.query('SELECT COUNT(*) AS n FROM HISTORIAL_REPROGRAMACION');
    const [[tk]] = await db.query('SELECT COUNT(*) AS n FROM TICKET_ASISTENCIA');
    const [[le]] = await db.query('SELECT COUNT(*) AS n FROM LISTA_ESPERA');
    const [tables] = await db.query('SHOW TABLES');
    const [[edad]] = await db.query("SELECT fn_calcular_edad('1990-03-15') AS edad");
    const [[slot]] = await db.query('SELECT fn_verificar_slot_libre(1) AS libre');

    const [citas] = await db.query(`
      SELECT c.id AS cita_id, c.estado AS estado_cita,
             CONCAT(m.nombres, ' ', m.apellidos) AS medico,
             p.dni AS dni_paciente, bh.fecha AS fecha_cita,
             bh.hora_inicio, bh.hora_fin,
             tc.nombre AS tipo_consulta, a.nombre AS aseguradora,
             ta.codigo_turno AS ticket, u.estado AS estado_cuenta_paciente
        FROM CITA c
        JOIN MEDICO m ON m.id = c.medico_id
        JOIN PACIENTE p ON p.id = c.paciente_id
        JOIN USUARIO u ON u.id = p.usuario_id
        JOIN BLOQUE_HORARIO bh ON bh.id = c.bloque_horario_id
        JOIN TIPO_CONSULTA tc ON tc.id = c.tipo_consulta_id
        LEFT JOIN ASEGURADORA a ON a.id = c.aseguradora_id
        LEFT JOIN TICKET_ASISTENCIA ta ON ta.cita_id = c.id
       ORDER BY c.id
    `);

    const [bloques] = await db.query(`
      SELECT CONCAT(m.nombres, ' ', m.apellidos) AS medico, bh.fecha,
             SUM(bh.estado = 'Libre') AS libres,
             SUM(bh.estado = 'Ocupado') AS ocupados,
             SUM(bh.estado = 'Bloqueado') AS bloqueados
        FROM BLOQUE_HORARIO bh
        JOIN MEDICO m ON m.id = bh.medico_id
       GROUP BY m.id, bh.fecha
       ORDER BY bh.fecha, m.id
    `);

    res.json({
      tablas: tables.length,
      conteos: {
        usuarios: u.n, medicos: m.n, pacientes: p.n, bloques: b.n,
        triajes: t.n, citas: c.n, historial: h.n, tickets: tk.n, lista_espera: le.n,
      },
      funciones: { edad_juan: edad.edad, slot_1_libre: slot.libre },
      citas, bloques,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PASOS = {
  '0': {
    titulo: 'Escenario 0 · Verificación de instalación',
    muta: false,
    run: async () => {
      const [tables] = await db.query('SHOW TABLES');
      const [[u]] = await db.query('SELECT COUNT(*) AS n FROM USUARIO');
      const [[m]] = await db.query('SELECT COUNT(*) AS n FROM MEDICO');
      const [[p]] = await db.query('SELECT COUNT(*) AS n FROM PACIENTE');
      const [[b]] = await db.query('SELECT COUNT(*) AS n FROM BLOQUE_HORARIO');
      const [[t]] = await db.query('SELECT COUNT(*) AS n FROM SOLICITUD_TRIAJE');
      const [[edad]] = await db.query("SELECT fn_calcular_edad('1990-03-15') AS edad");
      const [[slot]] = await db.query('SELECT fn_verificar_slot_libre(1) AS libre');
      const checks = [
        { nombre: 'Tablas (16)', ...cmp(tables.length, 16) },
        { nombre: 'USUARIO = 10', ...cmp(u.n, 10) },
        { nombre: 'MEDICO = 3', ...cmp(m.n, 3) },
        { nombre: 'PACIENTE = 5', ...cmp(p.n, 5) },
        { nombre: 'BLOQUE_HORARIO ≥ 32', ...cmp(b.n, 32, 'gte') },
        { nombre: 'SOLICITUD_TRIAJE ≥ 4', ...cmp(t.n, 4, 'gte') },
        { nombre: "fn_calcular_edad('1990-03-15')", ...cmp(edad.edad, 36) },
        { nombre: 'fn_verificar_slot_libre(1) ∈ {0,1}', ok: slot.libre === 0 || slot.libre === 1, actual: slot.libre, esperado: '0 o 1' },
      ];
      return { detalle: { tablas: tables.length, conteos: { u: u.n, m: m.n, p: p.n, b: b.n, t: t.n }, edad: edad.edad, slot: slot.libre }, checks };
    },
  },
  '1A': {
    titulo: 'Escenario 1A · Generar agenda Dra. Quispe 2026-11-03',
    muta: true,
    run: async () => {
      const out = await callWithOut(
        "CALL sp_crear_bloques_horarios(2, 2, '2026-11-03', '08:00', '12:00', 30, @bloques_nuevos)",
        [],
        'SELECT @bloques_nuevos AS bloques_generados'
      );
      const [filas] = await db.query(
        `SELECT id, fecha, hora_inicio, hora_fin, estado
           FROM BLOQUE_HORARIO WHERE medico_id = 2 AND fecha = '2026-11-03'
          ORDER BY hora_inicio`
      );
      return {
        detalle: { ...out, bloques: filas },
        checks: [
          { nombre: 'bloques_generados = 8 (o 0 si ya existían)', ok: Number(out.bloques_generados) === 8 || Number(out.bloques_generados) === 0, actual: out.bloques_generados, esperado: '8 (0 si repetido)' },
          { nombre: '8 filas para 2026-11-03', ...cmp(filas.length, 8) },
          { nombre: 'todas Libre', ok: filas.every(f => f.estado === 'Libre'), actual: filas.map(f => f.estado).join(','), esperado: 'Libre' },
        ],
      };
    },
  },
  '1B': {
    titulo: 'Escenario 1B · Reservar cita Juan Pérez en bloque 1',
    muta: true,
    run: async () => {
      const out = await callWithOut(
        'CALL sp_registrar_cita_medica(1, 1, 1, 1, 1, @nueva_cita_id, @mensaje_cita)',
        [],
        'SELECT @nueva_cita_id AS cita_id, @mensaje_cita AS resultado'
      );
      const [[bh]] = await db.query('SELECT id, estado FROM BLOQUE_HORARIO WHERE id = 1');
      const [[st]] = await db.query('SELECT id, estado FROM SOLICITUD_TRIAJE WHERE id = 1');
      return {
        detalle: { ...out, bloque: bh, triaje: st },
        checks: [
          { nombre: "mensaje 'Cita registrada exitosamente' (o slot ocupado si ya se corrió)", ok: String(out.resultado).includes('exitosamente') || String(out.resultado).includes('no disponible'), actual: out.resultado, esperado: 'Cita registrada exitosamente' },
          { nombre: 'BLOQUE 1 Ocupado', ...cmp(bh.estado, 'Ocupado') },
          { nombre: 'TRIAJE 1 Agendado', ...cmp(st.estado, 'Agendado') },
        ],
      };
    },
  },
  '2': {
    titulo: 'Escenario 2 · Slot ocupado debe fallar',
    muta: true,
    run: async () => {
      const out = await callWithOut(
        'CALL sp_registrar_cita_medica(2, 1, 1, 2, NULL, @cita_duplicada, @msg_error)',
        [],
        'SELECT @cita_duplicada AS cita_id, @msg_error AS resultado'
      );
      const [[bh]] = await db.query('SELECT estado FROM BLOQUE_HORARIO WHERE id = 1');
      const [[cnt]] = await db.query('SELECT COUNT(*) AS n FROM CITA WHERE bloque_horario_id = 1');
      return {
        detalle: { ...out, bloque: bh, duplicados: cnt.n },
        checks: [
          { nombre: 'cita_id = -1', ...cmp(out.cita_id, -1) },
          { nombre: 'Error: Slot no disponible', ...cmp(out.resultado, 'Error: Slot no disponible') },
          { nombre: 'bloque sigue Ocupado', ...cmp(bh.estado, 'Ocupado') },
          { nombre: 'una sola cita en bloque 1', ...cmp(cnt.n, 1) },
        ],
      };
    },
  },
  '3': {
    titulo: 'Escenario 3 · Cancelación reactiva',
    muta: true,
    run: async () => {
      const out = await callWithOut(
        "CALL sp_cancelar_cita_reactiva(1, 'Emergencia familiar imprevista', @candidato_espera)",
        [],
        'SELECT @candidato_espera AS id_paciente_lista_espera'
      );
      const [[bh]] = await db.query('SELECT id, estado FROM BLOQUE_HORARIO WHERE id = 1');
      const [[ci]] = await db.query('SELECT id, estado FROM CITA WHERE id = 1');
      const [hist] = await db.query('SELECT * FROM HISTORIAL_REPROGRAMACION WHERE cita_id = 1');
      const [[usr]] = await db.query(
        'SELECT estado FROM USUARIO WHERE id = (SELECT usuario_id FROM PACIENTE WHERE id = 1)'
      );
      return {
        detalle: { ...out, bloque: bh, cita: ci, historial: hist, usuario: usr },
        checks: [
          { nombre: 'bloque 1 Libre', ...cmp(bh.estado, 'Libre') },
          { nombre: 'cita 1 Cancelada', ...cmp(ci.estado, 'Cancelada') },
          { nombre: 'historial ≥ 1', ...cmp(hist.length, 1, 'gte') },
          { nombre: 'usuario Activo (1 cancelación)', ...cmp(usr.estado, 'Activo') },
        ],
      };
    },
  },
  '4': {
    titulo: 'Escenario 4 · Límite de reprogramaciones + bloqueo',
    muta: true,
    run: async () => {
      const setup = await callWithOut(
        'CALL sp_registrar_cita_medica(3, 2, 2, 3, NULL, @cita_rp, @msg_rp)',
        [],
        'SELECT @cita_rp AS cita_a_reprogramar, @msg_rp AS msg'
      );
      const citaId = setup.cita_a_reprogramar;
      if (!citaId || citaId === -1) {
        return {
          detalle: setup,
          checks: [{ nombre: 'Setup cita paciente 3 / bloque 2', ok: false, actual: setup.msg, esperado: 'Cita registrada exitosamente' }],
        };
      }
      const r1 = await callWithOut('CALL sp_reprogramar_cita(?, 3, ?, @m1)', [citaId, 'Cambio de horario laboral'], 'SELECT @m1 AS m');
      const r2 = await callWithOut('CALL sp_reprogramar_cita(?, 4, ?, @m2)', [citaId, 'Compromiso familiar urgente'], 'SELECT @m2 AS m');
      const r3 = await callWithOut('CALL sp_reprogramar_cita(?, 5, ?, @m3)', [citaId, 'Otra razón de cambio'], 'SELECT @m3 AS m');
      const r4 = await callWithOut('CALL sp_reprogramar_cita(?, 6, ?, @m4)', [citaId, 'Cuarto intento de reprogramación'], 'SELECT @m4 AS m');
      const [[usr]] = await db.query(
        `SELECT u.estado FROM USUARIO u JOIN PACIENTE p ON p.usuario_id = u.id WHERE p.id = 3`
      );
      const [[cnt]] = await db.query(
        'SELECT COUNT(*) AS n FROM HISTORIAL_REPROGRAMACION WHERE cita_id = ?',
        [citaId]
      );
      return {
        detalle: { setup, r1: r1.m, r2: r2.m, r3: r3.m, r4: r4.m, usuario: usr, historial: cnt.n },
        checks: [
          { nombre: 'RP1 OK', ...cmp(r1.m, '200 OK: Cita reprogramada exitosamente') },
          { nombre: 'RP2 OK', ...cmp(r2.m, '200 OK: Cita reprogramada exitosamente') },
          { nombre: 'RP3 OK', ...cmp(r3.m, '200 OK: Cita reprogramada exitosamente') },
          {
            nombre: 'RP4 Error 403',
            ok: String(r4.m || '').includes('403') && (String(r4.m || '').includes('reprogramaciones') || String(r4.m || '').includes('suspendida')),
            actual: r4.m,
            esperado: 'Error 403: Límite de reprogramaciones excedido. Cuenta suspendida.'
          },
          { nombre: 'paciente 3 Bloqueado', ...cmp(usr.estado, 'Bloqueado') },
          { nombre: 'historial = 3', ...cmp(cnt.n, 3) },
        ],
      };
    },
  },
  '5': {
    titulo: 'Escenario 5 · Check-in y ticket (bloque 9)',
    muta: true,
    run: async () => {
      const setup = await callWithOut(
        'CALL sp_registrar_cita_medica(4, 9, 1, 2, NULL, @cita_checkin, @msg_checkin)',
        [],
        'SELECT @cita_checkin AS nueva_cita_id, @msg_checkin AS msg'
      );
      const citaId = setup.nueva_cita_id;
      if (!citaId || citaId === -1) {
        return {
          detalle: setup,
          checks: [{ nombre: 'Setup cita paciente 4 / bloque 9', ok: false, actual: setup.msg, esperado: 'Cita registrada exitosamente' }],
        };
      }
      const t1 = await callWithOut('CALL sp_registrar_asistencia_ticket(?, @codigo)', [citaId], 'SELECT @codigo AS codigo');
      const t2 = await callWithOut('CALL sp_registrar_asistencia_ticket(?, @codigo2)', [citaId], 'SELECT @codigo2 AS codigo');
      const [tickets] = await db.query('SELECT cita_id, codigo_turno, estado FROM TICKET_ASISTENCIA WHERE cita_id = ?', [citaId]);
      return {
        detalle: { setup, codigo: t1.codigo, duplicado: t2.codigo, tickets },
        checks: [
          { nombre: 'código C-XXX', ok: /^C-\d{3}$/.test(String(t1.codigo || '')), actual: t1.codigo, esperado: 'C-00X' },
          { nombre: 'ticket Impreso', ...cmp(tickets[0]?.estado, 'Impreso') },
          { nombre: 'segundo CALL retorna el mismo código', ...cmp(t2.codigo, t1.codigo) },
          { nombre: '1 ticket por cita', ...cmp(tickets.length, 1) },
        ],
      };
    },
  },
  '6': {
    titulo: 'Escenario 6 · Vista consolidada',
    muta: false,
    run: async () => {
      const [citas] = await db.query(`
        SELECT c.id AS cita_id, c.estado AS estado_cita,
               CONCAT(m.nombres, ' ', m.apellidos) AS medico,
               p.dni AS dni_paciente, bh.fecha, bh.hora_inicio, bh.hora_fin,
               tc.nombre AS tipo_consulta, a.nombre AS aseguradora,
               ta.codigo_turno AS ticket, u.estado AS estado_cuenta
          FROM CITA c
          JOIN MEDICO m ON m.id = c.medico_id
          JOIN PACIENTE p ON p.id = c.paciente_id
          JOIN USUARIO u ON u.id = p.usuario_id
          JOIN BLOQUE_HORARIO bh ON bh.id = c.bloque_horario_id
          JOIN TIPO_CONSULTA tc ON tc.id = c.tipo_consulta_id
          LEFT JOIN ASEGURADORA a ON a.id = c.aseguradora_id
          LEFT JOIN TICKET_ASISTENCIA ta ON ta.cita_id = c.id
         ORDER BY c.id
      `);
      return {
        detalle: { citas },
        checks: [{ nombre: 'consulta consolidada OK', ok: true, actual: `${citas.length} citas`, esperado: 'sin error' }],
      };
    },
  },
};

router.get('/pasos', requireAdmin, (_req, res) => {
  res.json(Object.entries(PASOS).map(([id, p]) => ({ id, titulo: p.titulo, muta: p.muta })));
});

router.post('/ejecutar/:paso', requireAdmin, async (req, res) => {
  const paso = PASOS[req.params.paso];
  if (!paso) return res.status(404).json({ error: 'Paso desconocido' });
  try {
    const result = await paso.run();
    const passed = result.checks.every(c => c.ok);
    res.json({ ok: passed, titulo: paso.titulo, muta: paso.muta, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message, titulo: paso.titulo });
  }
});

router.post('/secuencia', requireAdmin, async (req, res) => {
  const orden = ['0', '1A', '1B', '2', '3', '4', '5', '6'];
  const resultados = [];
  try {
    await withConnection(async () => {});
    for (const id of orden) {
      const paso = PASOS[id];
      try {
        const result = await paso.run();
        resultados.push({ id, titulo: paso.titulo, ok: result.checks.every(c => c.ok), ...result });
      } catch (err) {
        resultados.push({ id, titulo: paso.titulo, ok: false, error: err.message, checks: [] });
      }
    }
    res.json({ ok: resultados.every(r => r.ok), resultados });
  } catch (err) {
    res.status(500).json({ error: err.message, resultados });
  }
});

const { exec } = require('child_process');
const path = require('path');

router.post('/reset-seed', requireAdmin, async (req, res) => {
  const sqlFile = path.resolve(__dirname, '..', '..', '01_Base_de_Datos_MySQL', 'si_salud_database_completa.sql');
  const user = process.env.DB_USER || 'root';
  const pass = process.env.DB_PASSWORD || 'sisalud';
  const dockerCmd = `docker exec -i si-salud-mysql mysql --default-character-set=utf8mb4 -u${user} -p${pass} < "${sqlFile}"`;

  exec(dockerCmd, async (err) => {
    if (!err) {
      return res.json({ ok: true, mensaje: 'Base de datos si_salud reiniciada al seed oficial limpio' });
    }
    try {
      await db.query('SET FOREIGN_KEY_CHECKS = 0;');
      await db.query('DELETE FROM TICKET_ASISTENCIA;');
      await db.query('DELETE FROM HISTORIAL_REPROGRAMACION;');
      await db.query('DELETE FROM CITA;');
      await db.query("DELETE FROM BLOQUE_HORARIO WHERE fecha = '2026-11-03';");
      await db.query("UPDATE BLOQUE_HORARIO SET estado = 'Libre';");
      await db.query("UPDATE SOLICITUD_TRIAJE SET estado = 'Pendiente' WHERE id = 1;");
      await db.query("UPDATE USUARIO SET estado = 'Activo';");
      await db.query('SET FOREIGN_KEY_CHECKS = 1;');
      res.json({ ok: true, mensaje: 'Base de datos restaurada a estado semilla limpio' });
    } catch (fallbackErr) {
      console.error(fallbackErr);
      res.status(500).json({ error: 'No se pudo reiniciar la base de datos: ' + fallbackErr.message });
    }
  });
});

module.exports = router;

