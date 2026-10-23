# SI-SALUD · MVP Entrega U1

Aplicación mínima sobre la base MySQL **oficial** (`si_salud`), no un motor distinto.
Las operaciones de negocio llaman a los stored procedures de
`01_Base_de_Datos_MySQL/si_salud_database_completa.sql`.

## 1. Cargar la base (una sola vez)

En MySQL Workbench ejecuta el script completo:

`entregaU1/01_Base_de_Datos_MySQL/si_salud_database_completa.sql`

Debe existir el schema `si_salud` con 16 tablas, 10 usuarios y 32 bloques.

## 2. Arrancar el MVP

```bash
cd entregaU1/04_Mockups_e_Interfaz/demo_navegable
cp .env.example .env          # ajusta DB_USER y DB_PASSWORD
npm install
npm start
```

Abre http://localhost:3000  
Contraseña de todos los usuarios seed: **`demo123`**

| Rol | Correo | Para qué |
| :--- | :--- | :--- |
| Paciente | `juan.perez@gmail.com` | CU-01 agendar, CU-02 triaje, CU-03 cancelar, CU-04 reprogramar |
| Médico | `dr.torres@sisalud.pe` | Agenda 28–29 oct 2026 |
| Cajero | `caja.central@sisalud.pe` | CU-05 check-in / ticket |
| Admin | `admin@sisalud.pe` | Generar bloques + **Laboratorio de pruebas** |

Fechas con agenda precargada: **2026-10-28**, **2026-10-29**, **2026-10-30**.

## 3. Laboratorio = el archivo `.txt`

Con sesión Admin → **Laboratorio pruebas**.

Ejecuta los mismos `CALL` de `pruebas_procedimientos_mysql.txt`
(escenarios 0 a 6) y compara resultado esperado vs real.

Usa una BD recién cargada. Si ya corriste el `.txt` en Workbench, vuelve a
ejecutar el script SQL antes del laboratorio.

## Procedimientos usados

| UI | Procedimiento / función |
| :--- | :--- |
| Confirmar cita | `sp_registrar_cita_medica` |
| Cancelar | `sp_cancelar_cita_reactiva` |
| Reprogramar | `sp_reprogramar_cita` |
| Check-in | `sp_registrar_asistencia_ticket` |
| Generar agenda | `sp_crear_bloques_horarios` |
| Edad del perfil | `fn_calcular_edad` |
| Slots | `fn_verificar_slot_libre` |
