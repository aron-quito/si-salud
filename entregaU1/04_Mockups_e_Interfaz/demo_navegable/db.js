// ─────────────────────────────────────────────────────────────
//  db.js · Pool MySQL2 contra la base oficial `si_salud`
//  Requiere haber ejecutado:
//    01_Base_de_Datos_MySQL/si_salud_database_completa.sql
// ─────────────────────────────────────────────────────────────
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Cargar .env si existe para scripts independientes o tests
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
}

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               Number(process.env.DB_PORT || 3306),
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'si_salud',
  waitForConnections: true,
  connectionLimit:    10,
  charset:            'utf8mb4',
  timezone:           'Z',
  dateStrings:        true, // DATE/TIME como string, sin desfase UTC
});

pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL conectado →', process.env.DB_NAME || 'si_salud');
    conn.release();
  })
  .catch(err => {
    console.error('❌ No se pudo conectar a MySQL:', err.message);
    console.error('   1) Carga 01_Base_de_Datos_MySQL/si_salud_database_completa.sql');
    console.error('   2) Copia .env.example a .env y ajusta DB_USER / DB_PASSWORD');
  });

module.exports = pool;
