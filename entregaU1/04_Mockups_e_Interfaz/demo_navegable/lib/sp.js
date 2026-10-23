// ─────────────────────────────────────────────────────────────
//  lib/sp.js · Ejecuta stored procedures en UNA sola conexión
//  Las variables de usuario MySQL (@cita_id, @mensaje, …) son
//  por sesión: no se pueden SET/CALL/SELECT en el pool suelto.
// ─────────────────────────────────────────────────────────────
const pool = require('../db');

async function withConnection(fn) {
  const conn = await pool.getConnection();
  try {
    return await fn(conn);
  } finally {
    conn.release();
  }
}

/**
 * CALL procedure con parámetros OUT via variables de usuario.
 * @param {string} callSql  ej. 'CALL sp_x(?, ?, @a, @b)'
 * @param {Array}  params
 * @param {string} selectSql ej. 'SELECT @a AS a, @b AS b'
 */
async function callWithOut(callSql, params, selectSql) {
  return withConnection(async (conn) => {
    await conn.query(callSql, params);
    const [rows] = await conn.query(selectSql);
    return rows[0] || {};
  });
}

async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = { pool, withConnection, callWithOut, query };
