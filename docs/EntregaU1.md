# Guía y Plan de Entrega: Unidad 1 — SI-SALUD

> Documento generado tras revisión **exhaustiva** de todos los artefactos en el repositorio:
> `Plan_Proyecto_SI_SALUD.md`, `diccionario_datos.md`, `diccionario_casos_de_uso.md`,
> `diccionario_secuencias.md`, `backlog_tareas_jira.md`, diagramas PNG/MMD/PUML y mockups HTML.

---

## Parámetros Oficiales de la Entrega

| Campo | Detalle |
| :--- | :--- |
| **Plazo de entrega** | Jueves 22 de Octubre · 21:00 hrs · Aula Virtual |
| **Formato de entrega** | Archivo comprimido `.zip` o `.rar`. **Prohibido Google Drive u otro enlace externo.** |
| **Fecha de exposición** | Viernes 23 de Octubre · 08:40 hrs |
| **Duración exposición** | Máximo **30 minutos** (incluye ronda de preguntas) |
| **Penalización tardía** | Nota máxima base 10 si se sube pasado el horario |
| **Penalización ausencia** | Nota **00** individual si el integrante no está al momento del llamado |

---

## 1. Rúbrica Oficial y Estado Real del Repositorio

| # | Componente Evaluado | Pts | % | Estado Real |
| :---: | :--- | :---: | :---: | :---: |
| A | Modelo Relacional completo con tipos de datos y descripción de campos | **9** | 45 % | 🟡 Parcial |
| B | Procedimientos Almacenados / Funciones MySQL + Script + Ejemplos `.txt` | **6** | 30 % | 🔴 Falta |
| C | Casos de Uso (flujo básico y alternativo) + Diagramas de Secuencia + Mockups | **5** | 25 % | 🟢 ~80% listo |
| | **TOTAL** | **20** | **100 %** | |

---

## 2. Análisis Exhaustivo por Componente

---

### A · Modelo Relacional — 9 Puntos

#### A.1 Lo que existe en el repositorio (validado archivo por archivo)

| Artefacto | Ubicación real | Calidad observada |
| :--- | :--- | :--- |
| Diagrama Entidad-Relación Mermaid `.mmd` | `docs/diagrams/entidad_relacion/entidad_relacion.mmd` | ✅ 16 entidades completas con PK/FK/tipos y relaciones cardinalidad |
| Render PNG del DER | `docs/diagrams/entidad_relacion/entidad_relacion.png` | ✅ Renderizado y legible con todos los campos, tipos (int/string/date/decimal/boolean/datetime/time/text) y cardinalidades explícitas |
| Diccionario de Datos | `docs/diccionarios/diccionario_datos.md` | ✅ 16 tablas documentadas: nombre, tipo de dato, tipo de llave y descripción detallada de cada campo |
| Diagrama de Arquitectura Mermaid `.mmd` | `docs/diagrams/arquitectura/arquitectura.mmd` | ✅ Frontend (Next.js), API Gateway, 4 microservicios Backend, Redis/BullMQ, PostgreSQL, Algoritmo IA |
| Diagrama de Arquitectura PNG | `docs/diagrams/arquitectura/arquitectura.png` | ✅ Renderizado claro con todos los subgraphs y flechas de comunicación |

#### A.2 Las 16 entidades modeladas — confirmadas en el DER y el diccionario

```
USUARIO · PACIENTE · MEDICO · SEDE · CONSULTORIO · ESPECIALIDAD
MEDICO_ESPECIALIDAD · TIPO_CONSULTA · ASEGURADORA · BLOQUE_HORARIO
SOLICITUD_TRIAJE · LISTA_ESPERA · CITA · HISTORIAL_REPROGRAMACION
TICKET_ASISTENCIA · PAGO_VOUCHER
```

El DER incluye exactamente las relaciones:
- `USUARIO 1:1 PACIENTE` y `USUARIO 1:1 MEDICO`
- `SEDE 1:N CONSULTORIO`
- `MEDICO N:M ESPECIALIDAD` (via `MEDICO_ESPECIALIDAD`)
- `MEDICO 1:N BLOQUE_HORARIO` y `CONSULTORIO 1:N BLOQUE_HORARIO`
- `PACIENTE 1:N SOLICITUD_TRIAJE`, `ESPECIALIDAD 1:N SOLICITUD_TRIAJE`
- `SOLICITUD_TRIAJE 1:1 CITA` (opcional), `BLOQUE_HORARIO 1:1 CITA`
- `PACIENTE 1:N CITA`, `MEDICO 1:N CITA`, `TIPO_CONSULTA 1:N CITA`, `ASEGURADORA 0:N CITA`
- `CITA 1:N HISTORIAL_REPROGRAMACION`
- `CITA 1:1 TICKET_ASISTENCIA` y `CITA 1:1 PAGO_VOUCHER`
- `PACIENTE 1:N LISTA_ESPERA`, `ESPECIALIDAD 1:N LISTA_ESPERA`

#### A.3 ⚠️ GAP CRÍTICO — Adaptación de PostgreSQL a MySQL

> El plan de proyecto y **todos** los artefactos de documentación están escritos sobre
> **PostgreSQL + Prisma ORM** (Plan_Proyecto §6, backlog SETUP-02 y SETUP-03).
> El docente exige script exportado de **MySQL**. Diferencias a corregir en el script SQL:

| Concepto PostgreSQL/Prisma | Equivalente MySQL 8.x |
| :--- | :--- |
| `SERIAL` / `autoincrement()` | `INT NOT NULL AUTO_INCREMENT` |
| `TEXT` | `TEXT CHARACTER SET utf8mb4` |
| `ENUM` de Prisma (string enum) | `ENUM('val1','val2',...)` nativo MySQL |
| `TIMESTAMP` | `DATETIME` |
| `BOOLEAN` | `TINYINT(1)` (o `BOOLEAN` — MySQL 8 acepta alias) |
| `DECIMAL` | `DECIMAL(10,2)` |
| Integridad referencial | Requiere `ENGINE=InnoDB` en cada tabla |
| `schema.prisma` + `npx prisma migrate` | Script `.sql` plano ejecutable en MySQL Workbench |

#### A.4 Qué falta hacer para A

- [ ] Exportar imagen HD del DER (el PNG actual está bien pero puede perder nitidez al imprimir A4 — reexportar a 2400 × 1800 px mínimo)
- [ ] Convertir `diccionario_datos.md` a PDF/Word para incluirlo en el `.zip` (el contenido ya está completo)
- [ ] Asegurarse de que el script DDL final use tipos MySQL nativos (no Prisma schema)

---

### B · Procedimientos Almacenados y Funciones MySQL — 6 Puntos

#### B.1 Lo que existe en el repositorio (referencia para construir los SP)

| Artefacto | Ubicación | Relevancia para los SP |
| :--- | :--- | :--- |
| Backlog técnico Jira | `docs/diccionarios/backlog_tareas_jira.md` | SETUP-03 describe el schema Prisma (16 tablas) — base del DDL |
| CSV de importación Jira | `docs/diccionarios/jira_import.csv` | 22 tickets definidos — no es SQL plano |
| Diagrama secuencia agendamiento | `docs/diagrams/secuencia/secuencia.mmd` + `.png` | Define exactamente la lógica del SP principal (sp_registrar_cita) |
| Diagrama secuencia reactiva | `docs/diagrams/secuencia/secuencia_reactiva.mmd` + `.png` | Define la lógica de sp_cancelar_cita_reactiva (con bloqueo optimista) |
| Diagrama secuencia reprogramación | `docs/diagrams/secuencia/secuencia_reprogramacion.mmd` + `.png` | Define sp_reprogramar_cita (anti-abuso, COUNT HISTORIAL, bloqueo cuenta) |
| Diccionario de secuencias | `docs/diccionarios/diccionario_secuencias.md` | 3 flujos paso a paso (Origen → Destino → Acción) — traducción directa a SQL |
| Diccionario de casos de uso §Módulo 7 | `docs/diccionarios/diccionario_casos_de_uso.md` | Define lógica de recepción y ticket (sp_registrar_asistencia_ticket) |
| HU-08 backlog | `docs/diccionarios/backlog_tareas_jira.md` §HU-08 | Define el generador masivo de bloques horarios (sp_crear_bloques_horarios) |

#### B.2 Qué falta construir — Especificación Completa

**Archivo 1:** `si_salud_database_completa.sql` — estructura en 4 bloques:

```
BLOQUE 1 — DDL (Estructura de base de datos)
  CREATE DATABASE IF NOT EXISTS si_salud CHARACTER SET utf8mb4;
  USE si_salud;
  CREATE TABLE USUARIO (id INT AUTO_INCREMENT PK, email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, rol ENUM('Paciente','Medico','Cajero','Admin'),
    estado ENUM('Activo','Bloqueado') DEFAULT 'Activo', ENGINE=InnoDB);
  ... (16 tablas con FK, ENUMs, índices, ENGINE=InnoDB)

BLOQUE 2 — DML (Datos semilla representativos)
  INSERT INTO SEDE: 2 registros (Sede Central Lima, Sede Norte)
  INSERT INTO CONSULTORIO: 4 registros (102A, 103B, 204A, 205C)
  INSERT INTO ESPECIALIDAD: 5 (Medicina General, Pediatría, Cardiología, Neurología, Traumatología)
  INSERT INTO ASEGURADORA: 3 (EsSalud, SIS, Particular)
  INSERT INTO TIPO_CONSULTA: 3 (Primera vez 30min, Control 15min, Procedimiento 45min)
  INSERT INTO USUARIO: 9 usuarios (1 Admin, 3 Médicos, 5 Pacientes) con passwords hasheadas mock
  INSERT INTO MEDICO: 3 médicos con CMP (colegiatura)
  INSERT INTO MEDICO_ESPECIALIDAD: asignaciones N:M
  INSERT INTO PACIENTE: 5 pacientes con DNI y fecha_nacimiento válidas
  INSERT INTO BLOQUE_HORARIO: bloques cada 15min de 08:00-14:00 para 3 días y 2 médicos (~144 bloques)
  INSERT INTO SOLICITUD_TRIAJE: 4 solicitudes con score_urgencia (3, 7, 5, 9) en estado 'Pendiente'

BLOQUE 3 — STORED PROCEDURES (5 procedimientos del núcleo de negocio)
  sp_registrar_cita_medica
  sp_cancelar_cita_reactiva
  sp_crear_bloques_horarios
  sp_registrar_asistencia_ticket
  sp_reprogramar_cita

BLOQUE 4 — FUNCIONES (2 funciones auxiliares)
  fn_calcular_edad(p_fecha_nacimiento DATE) RETURNS INT
  fn_verificar_slot_libre(p_bloque_id INT) RETURNS BOOLEAN
```

#### B.3 Especificación de los 5 Stored Procedures

**`sp_registrar_cita_medica`** _(el más crítico — coincide con el requerimiento central del examen)_
Basado en: `secuencia.mmd` pasos 10-12 y `diccionario_secuencias.md §1`
- IN: `p_paciente_id INT`, `p_bloque_horario_id INT`, `p_tipo_consulta_id INT`, `p_aseguradora_id INT`, `p_solicitud_id INT` (nullable)
- OUT: `p_cita_id INT`, `p_mensaje VARCHAR(255)`
- Lógica:
  1. `START TRANSACTION`
  2. `SELECT estado FROM BLOQUE_HORARIO WHERE id = p_bloque_horario_id FOR UPDATE`
  3. Si estado = 'Libre': INSERT en CITA, UPDATE BLOQUE_HORARIO a 'Ocupado', UPDATE SOLICITUD_TRIAJE a 'Agendado', `COMMIT`, retornar cita_id y 'Cita registrada exitosamente'
  4. Si no está libre: `ROLLBACK`, retornar p_cita_id = -1 y 'Error: Slot no disponible'

**`sp_cancelar_cita_reactiva`**
Basado en: `secuencia_reactiva.mmd` pasos 3-8 y `diccionario_secuencias.md §2`
- IN: `p_cita_id INT`, `p_motivo VARCHAR(500)`; OUT: `p_paciente_espera_id INT`
- Lógica:
  1. Obtener paciente_id y bloque_horario_id de la CITA
  2. UPDATE CITA → estado = 'Cancelada'
  3. UPDATE BLOQUE_HORARIO → estado = 'Libre'
  4. INSERT en HISTORIAL_REPROGRAMACION (motivo, fecha_transaccion, estado = 'Cancelacion')
  5. COUNT cancelaciones del paciente en HISTORIAL — si >= 3: UPDATE USUARIO a 'Bloqueado'
  6. SELECT primer paciente de LISTA_ESPERA con misma especialidad, ordenado por prioridad DESC
  7. OUT p_paciente_espera_id = id del candidato encontrado (o -1 si no hay)

**`sp_crear_bloques_horarios`**
Basado en: `backlog_tareas_jira.md §HU-08` — "Generador masivo de Bloques Horarios"
- IN: `p_medico_id INT`, `p_consultorio_id INT`, `p_fecha DATE`, `p_hora_inicio TIME`, `p_hora_fin TIME`, `p_intervalo_minutos INT`; OUT: `p_bloques_creados INT`
- Lógica: WHILE loop con variable `v_hora_actual` que avanza en intervalos de `p_intervalo_minutos`; en cada iteración verifica que no exista ya un bloque solapado, e inserta en BLOQUE_HORARIO con estado 'Libre'

**`sp_registrar_asistencia_ticket`**
Basado en: `diccionario_casos_de_uso.md §Módulo 7 — Registrar asistencia` y `backlog_tareas_jira.md §HU-09`
- IN: `p_cita_id INT`; OUT: `p_codigo_turno VARCHAR(10)`
- Lógica:
  1. Verificar CITA existe y está en estado 'Programada' o 'Pagada'
  2. Generar código único tipo `CONCAT('C-', LPAD(p_cita_id, 3, '0'))` (ej. C-042)
  3. INSERT en TICKET_ASISTENCIA con fecha_generacion = NOW(), estado = 'Impreso'
  4. OUT p_codigo_turno = código generado

**`sp_reprogramar_cita`**
Basado en: `secuencia_reprogramacion.mmd` y `diccionario_secuencias.md §3`
- IN: `p_cita_id INT`, `p_nuevo_bloque_id INT`, `p_motivo VARCHAR(500)`; OUT: `p_mensaje VARCHAR(255)`
- Lógica:
  1. `SELECT COUNT(*) FROM HISTORIAL_REPROGRAMACION WHERE cita_id = p_cita_id` → v_count
  2. Si v_count >= 3: UPDATE USUARIO.estado a 'Bloqueado', OUT 'Error 403: Límite de reprogramaciones excedido'
  3. Si v_count < 3: START TRANSACTION → UPDATE BLOQUE antiguo a 'Libre' → INSERT HISTORIAL → UPDATE CITA con p_nuevo_bloque_id y estado 'Reprogramada' → COMMIT → OUT '200 OK: Cita reprogramada'

**Archivo 2:** `pruebas_procedimientos_mysql.txt` — 5 escenarios ejecutables

```sql
-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ ESCENARIO 1: Generación de agenda + Reserva exitosa de cita     ║
-- ╚══════════════════════════════════════════════════════════════════╝
CALL sp_crear_bloques_horarios(1, 1, '2026-10-28', '08:00', '12:00', 15, @bloques);
SELECT @bloques AS bloques_creados; -- ESPERADO: 16

CALL sp_registrar_cita_medica(1, 1, 1, 1, 1, @cita_id, @msg);
SELECT @cita_id, @msg; -- ESPERADO: cita_id=1, msg='Cita registrada exitosamente'
SELECT id, estado FROM BLOQUE_HORARIO WHERE id = 1; -- ESPERADO: estado='Ocupado'

-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ ESCENARIO 2: Intento de reservar un slot ya ocupado (DEBE FALLAR)║
-- ╚══════════════════════════════════════════════════════════════════╝
CALL sp_registrar_cita_medica(2, 1, 1, 1, NULL, @cita_id2, @msg2);
SELECT @cita_id2, @msg2; -- ESPERADO: cita_id=-1, msg='Error: Slot no disponible'

-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ ESCENARIO 3: Cancelación reactiva y liberación de slot          ║
-- ╚══════════════════════════════════════════════════════════════════╝
CALL sp_cancelar_cita_reactiva(1, 'Emergencia familiar', @paciente_espera);
SELECT @paciente_espera AS candidato_lista_espera;
SELECT estado FROM BLOQUE_HORARIO WHERE id = 1; -- ESPERADO: 'Libre'
SELECT * FROM HISTORIAL_REPROGRAMACION;

-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ ESCENARIO 4: Bloqueo de cuenta por exceso de reprogramaciones   ║
-- ╚══════════════════════════════════════════════════════════════════╝
CALL sp_reprogramar_cita(1, 2, 'Cambio de horario laboral', @m1); SELECT @m1;
CALL sp_reprogramar_cita(1, 3, 'Compromiso familiar', @m2);       SELECT @m2;
CALL sp_reprogramar_cita(1, 4, 'Otra razón', @m3);
SELECT @m3; -- ESPERADO: 'Error 403: Límite de reprogramaciones excedido'
SELECT estado FROM USUARIO WHERE id = (SELECT usuario_id FROM PACIENTE WHERE id = 1);
-- ESPERADO: estado = 'Bloqueado'

-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ ESCENARIO 5: Check-in físico y generación de ticket             ║
-- ╚══════════════════════════════════════════════════════════════════╝
-- Primero crear una nueva cita en estado Programada para probar
CALL sp_registrar_cita_medica(2, 5, 1, 1, NULL, @cita_nueva, @msg_nueva);
CALL sp_registrar_asistencia_ticket(@cita_nueva, @codigo_turno);
SELECT @codigo_turno; -- ESPERADO: 'C-002' o similar
SELECT * FROM TICKET_ASISTENCIA;
```

---

### C · Casos de Uso + Diagramas de Secuencia + Mockups — 5 Puntos

#### C.1 Inventario exacto de lo que existe en el repositorio

| Artefacto | Ruta exacta | Estado |
| :--- | :--- | :--- |
| **CU PlantUML — Módulo 1 Autenticación** | `docs/diagrams/casos_de_uso/modulo_1_autenticacion.puml` | ✅ |
| **CU PlantUML — Módulo 2 Pacientes** | `docs/diagrams/casos_de_uso/modulo_2_pacientes.puml` | ✅ |
| **CU PlantUML — Módulo 3 Staff Médico** | `docs/diagrams/casos_de_uso/modulo_3_staff_medico.puml` | ✅ |
| **CU PlantUML — Módulo 4 Administración** | `docs/diagrams/casos_de_uso/modulo_4_administracion.puml` | ✅ |
| **CU PlantUML — Módulo 5 Lógica Negocio** | `docs/diagrams/casos_de_uso/modulo_5_logica_negocio.puml` | ✅ |
| **CU PlantUML — Módulo 6 Horarios** | `docs/diagrams/casos_de_uso/modulo_6_horarios.puml` | ✅ |
| **CU PlantUML — Módulo 7 Gestión Citas** | `docs/diagrams/casos_de_uso/modulo_7_gestion_citas.puml` | ✅ |
| **CU PlantUML — Módulo 8 Lista Espera** | `docs/diagrams/casos_de_uso/modulo_8_lista_espera.puml` | ✅ |
| **PNG Módulo 1 Autenticación** | `docs/diagrams/casos_de_uso/renders/modulo_1_autenticacion.png` | ✅ |
| **PNG Módulo 2 Pacientes** | `docs/diagrams/casos_de_uso/renders/modulo_2_pacientes.png` | ✅ |
| **PNG Módulo 3 Staff Médico** | `docs/diagrams/casos_de_uso/renders/modulo_3_staff_medico.png` | ✅ |
| **PNG Módulo 4 Administración** | `docs/diagrams/casos_de_uso/renders/modulo_4_administracion.png` | ✅ |
| **PNG Módulo 5 Lógica Negocio** | `docs/diagrams/casos_de_uso/renders/modulo_5_logica_negocio.png` | ✅ |
| **PNG Módulo 6 Horarios** | `docs/diagrams/casos_de_uso/renders/modulo_6_horarios.png` | ✅ |
| **PNG Módulo 7 Gestión Citas** | `docs/diagrams/casos_de_uso/renders/modulo_7_gestion_citas.png` | ✅ |
| **PNG Módulo 8 Lista Espera** | `docs/diagrams/casos_de_uso/renders/modulo_8_lista_espera.png` | ✅ |
| **Secuencia: Agendamiento Lote** | `docs/diagrams/secuencia/secuencia.mmd` + `secuencia.png` | ✅ 13 pasos: Paciente→Frontend→Triaje→IA→Bolsa→MotorSlotting→Notif |
| **Secuencia: Cancelación Reactiva** | `docs/diagrams/secuencia/secuencia_reactiva.mmd` + `.png` | ✅ 13 pasos con alt (slot libre vs ocupado) y bloqueo optimista |
| **Secuencia: Reprogramación/Bloqueo** | `docs/diagrams/secuencia/secuencia_reprogramacion.mmd` + `.png` | ✅ alt (límite excedido vs permitido), bloqueo de cuenta |
| **Diccionario CU (8 módulos)** | `docs/diccionarios/diccionario_casos_de_uso.md` | ✅ Tablas Actor/Caso de Uso/Descripción por módulo |
| **Diccionario Secuencias (3 flujos)** | `docs/diccionarios/diccionario_secuencias.md` | ✅ Pasos enumerados con Origen→Destino→Acción |
| **Mockup: Login ciudadano** | `document/stitch_.../sisalud_ingreso_ciudadano_y_pacientes/` | ✅ HTML + PNG |
| **Mockup: Triaje inteligente v1** | `document/stitch_.../sisalud_triaje_inteligente_y_solicitud_de_cita_1/` | ✅ HTML + PNG |
| **Mockup: Triaje inteligente v2** | `document/stitch_.../sisalud_triaje_inteligente_y_solicitud_de_cita_2/` | ✅ HTML + PNG |
| **Mockup: Registro/afiliación v1** | `document/stitch_.../sisalud_registro_y_afiliaci_n_de_paciente_1/` | ✅ HTML + PNG |
| **Mockup: Registro/afiliación v2** | `document/stitch_.../sisalud_registro_y_afiliaci_n_de_paciente_2/` | ✅ HTML + PNG |
| **Mockup: Mis citas v1** | `document/stitch_.../sisalud_mis_citas_y_gesti_n_de_paciente_1/` | ✅ HTML + PNG |
| **Mockup: Mis citas v2** | `document/stitch_.../sisalud_mis_citas_y_gesti_n_de_paciente_2/` | ✅ HTML + PNG |
| **Mockup: Agenda médica diaria** | `document/stitch_.../sisalud_agenda_m_dica_diaria_y_consulta/` | ✅ HTML + PNG |
| **Mockup: Agenda médica semanal** | `document/stitch_.../sisalud_agenda_m_dica_semanal/` | ✅ HTML + PNG |
| **Mockup: Agenda semanal minimalista** | `document/stitch_.../sisalud_agenda_m_dica_semanal_minimalista/` | ✅ HTML + PNG |
| **Mockup: Agenda + consulta clínica v1** | `document/stitch_.../sisalud_agenda_m_dica_y_consulta_cl_nica_1/` | ✅ HTML + PNG |
| **Mockup: Agenda + consulta clínica v2** | `document/stitch_.../sisalud_agenda_m_dica_y_consulta_cl_nica_2/` | ✅ HTML + PNG |
| **Mockup: Acceso médico clínico** | `document/stitch_.../sisalud_acceso_m_dico_y_cl_nico/` | ✅ HTML + PNG |
| **Mockup: Acceso paciente/médico** | `document/stitch_.../sisalud_acceso_y_registro_de_pacientes_y_m_dicos_1/` | ✅ HTML (sin PNG) |
| **Mockup: Login minimalista v1** | `document/stitch_.../sisalud_ingreso_ciudadano_minimalista_1/` | ✅ HTML + PNG |
| **Mockup: Login minimalista v2** | `document/stitch_.../sisalud_ingreso_ciudadano_minimalista_2/` | ✅ HTML + PNG |
| **Logotipo SI-SALUD** | `document/stitch_.../sisalud_logo/` | ✅ HTML + PNG |
| **Especificación plataforma** | `document/stitch_.../especificaci_n_de_plataforma_m_dica_p_blica.md` | ✅ REQ-001 al REQ-060 |
| **Design System** | `document/stitch_.../modern_public_healthcare_system/DESIGN.md` | ✅ Paleta, tipografía, componentes |

**Total mockups: 16 pantallas HTML/CSS + 15 capturas PNG**

#### C.2 ⚠️ GAP — Flujos Básicos y Alternativos Formales

El `diccionario_casos_de_uso.md` tiene descripciones resumidas en tabla. El docente exige
**flujos paso a paso con la siguiente estructura formal**:

```
CU-XX: [Nombre del Caso de Uso]
Actor Principal: [...]
Precondición: [...]
Disparador: [...]
Flujo Básico (Happy Path):
  1. El actor hace...
  2. El sistema responde...
  N. El sistema confirma...
Flujo Alternativo A1 — [Título del error/caso alternativo]:
  A1.1. En el paso N, el sistema detecta que...
  A1.2. El sistema retorna...
Postcondición: [Estado del sistema tras el CU exitoso]
```

Los 5 CU a expandir (toda la lógica ya está documentada — solo hay que transcribir al formato formal):

| CU | Nombre | Fuente de lógica existente |
| :--- | :--- | :--- |
| **CU-01** | Registro y Confirmación de Cita Médica | `secuencia.mmd` pasos 1-13 + `diccionario_secuencias.md §1` |
| **CU-02** | Formulario de Triaje con Análisis IA | `diccionario_casos_de_uso.md §Módulo 5` + `secuencia.mmd` pasos 1-6 |
| **CU-03** | Cancelación y Lista de Espera Reactiva | `secuencia_reactiva.mmd` pasos 1-13 + `diccionario_secuencias.md §2` |
| **CU-04** | Reprogramación con Control Anti-Abuso | `secuencia_reprogramacion.mmd` pasos 1-7 + `diccionario_secuencias.md §3` |
| **CU-05** | Check-in Físico y Generación de Ticket | `diccionario_casos_de_uso.md §Módulo 7 — Registrar asistencia` |

---

## 3. Resumen Visual: ¿Qué tenemos vs. qué falta?

```
COMPONENTE                                        EXISTE   PENDIENTE
─────────────────────────────────────────────────────────────────────
DER Mermaid (16 tablas, PK/FK/tipos)               ✅
DER PNG renderizado (legible)                       ✅      Reexportar HD para impresión (≥2400px)
Diccionario de datos (16 tablas, campos)            ✅      Convertir .md → PDF para el .zip
Diagrama de Arquitectura MMD + PNG                  ✅
8 Diagramas CU PlantUML (.puml) — Módulos 1-8      ✅
8 Renders PNG de CU — Módulos 1-8                  ✅
Diccionario de Casos de Uso (tablas resumidas)      ✅      Expandir CU-01..05 a flujos formales
3 Diagramas de Secuencia MMD + PNG                  ✅
Diccionario de Secuencias (paso a paso)             ✅
16 Mockups HTML/CSS · 15 capturas PNG               ✅
Design System + Especificación REQ                  ✅
─────────────────────────────────────────────────────────────────────
Script DDL MySQL (16 tablas ENGINE=InnoDB)                   🔴 CREAR
Datos semilla DML MySQL coherentes                           🔴 CREAR
sp_registrar_cita_medica (con FOR UPDATE/ACID)               🔴 CREAR
sp_cancelar_cita_reactiva (bloqueo optimista)                🔴 CREAR
sp_crear_bloques_horarios (generador de agenda)              🔴 CREAR
sp_registrar_asistencia_ticket (check-in)                    🔴 CREAR
sp_reprogramar_cita (anti-abuso, bloqueo cuenta)             🔴 CREAR
fn_calcular_edad / fn_verificar_slot_libre                   🔴 CREAR
Archivo pruebas_procedimientos_mysql.txt (5 escenarios)      🔴 CREAR
CU-01..05 con flujo básico y alternativos formales           🟡 REDACTAR
```

---

## 4. Agregados Estratégicos para Nota Máxima

### ⭐ Agregado 1: Demo Web Navegable (Fluidez de la plataforma)

Los 16 mockups HTML/CSS ya existen en `document/stitch_.../`. Solo hay que crear un
`index.html` de navegación que los enlace en el flujo del usuario:

```
Login → Triaje → Mis Citas → Dashboard Médico → Agenda Médica
```

**Esfuerzo estimado: < 1 hora.** Servirlo con `python3 -m http.server 8080` durante la exposición.
Pantallas clave disponibles:
- Login: `sisalud_ingreso_ciudadano_y_pacientes/code.html`
- Triaje: `sisalud_triaje_inteligente_y_solicitud_de_cita_1/code.html`
- Mis Citas: `sisalud_mis_citas_y_gesti_n_de_paciente_1/code.html`
- Agenda diaria: `sisalud_agenda_m_dica_diaria_y_consulta/code.html`
- Agenda semanal: `sisalud_agenda_m_dica_semanal/code.html`

### ⭐ Agregado 2: Pruebas con Formato de Resultados Esperados

Decorar el `.txt` con resultados esperados para cada escenario (ya especificados en §B.2),
demostrando rigor en testing de base de datos.

### ⭐ Agregado 3: Lámina "ACID y Concurrencia Resuelta"

Usar los argumentos ya documentados en el repositorio:
- `Plan_Proyecto_SI_SALUD.md §5.1 Time-Slotting Estricto` — justifica por qué se usa bloqueo fijo
- `Plan_Proyecto_SI_SALUD.md §RNF-03` — exige ACID y bloqueos optimistas/pesimistas
- `diccionario_secuencias.md §2 paso 11` — "Bloqueo Optimista" explícito en el diagrama

Esto responde la pregunta más frecuente en evaluaciones de BD: ¿cómo evitan el doble agendamiento?

### ⭐ Agregado 4: Guion de Exposición — 30 Minutos

| Segmento | Min | Responsable | Material |
| :--- | :---: | :--- | :--- |
| Contexto del problema + propuesta de valor SI-SALUD | 4 | P1 | README + arquitectura.png |
| Modelo Relacional: entidades, cardinalidades, normalización | 6 | P2 | DER HD + diccionario_datos |
| Casos de Uso clave + 3 Diagramas de Secuencia | 5 | P1 | 8 PNGs CU + 3 PNGs secuencias |
| **Demo en vivo MySQL Workbench** — ejecutar los 5 escenarios | 9 | P3 | MySQL abierto + script cargado |
| **Demo prototipo web navegable** — flujo completo | 4 | P2 | Navegador en localhost:8080 |
| Ronda de preguntas | 2 | Todos | — |

---

## 5. Estructura del Archivo `.zip` Final

```
SI_SALUD_Entrega_U1.zip
│
├── 01_Base_de_Datos_MySQL/
│   ├── si_salud_database_completa.sql         🔴 POR CREAR
│   └── pruebas_procedimientos_mysql.txt       🔴 POR CREAR
│
├── 02_Modelo_Relacional/
│   ├── modelo_relacional_hd.png               🟡 REEXPORTAR en alta resolución
│   └── diccionario_campos.pdf                 🟡 CONVERTIR desde diccionario_datos.md
│
├── 03_Casos_de_Uso_y_Secuencias/
│   ├── casos_de_uso_flujos_detallados.pdf     🟡 REDACTAR flujos formales CU-01..05
│   ├── diagramas_casos_de_uso/                ✅ copiar docs/diagrams/casos_de_uso/renders/
│   │   ├── modulo_1_autenticacion.png
│   │   ├── modulo_2_pacientes.png
│   │   ├── modulo_3_staff_medico.png
│   │   ├── modulo_4_administracion.png
│   │   ├── modulo_5_logica_negocio.png
│   │   ├── modulo_6_horarios.png
│   │   ├── modulo_7_gestion_citas.png
│   │   └── modulo_8_lista_espera.png
│   └── diagramas_secuencia/                   ✅ copiar docs/diagrams/secuencia/
│       ├── secuencia_agendamiento_lote.png
│       ├── secuencia_reactiva_cancelacion.png
│       └── secuencia_reprogramacion_bloqueo.png
│
├── 04_Mockups_e_Interfaz/
│   ├── capturas_pantallas/                    ✅ copiar todos los screen.png de stitch/
│   └── demo_navegable/                        ⭐ AGREGADO
│       └── index.html                         ⭐ POR CREAR (navegación entre mockups existentes)
│
└── LEAME_INSTRUCCIONES.txt                    📝 Instrucciones para el docente
    Paso 1: Abrir MySQL Workbench
    Paso 2: File > Run SQL Script > seleccionar si_salud_database_completa.sql
    Paso 3: Abrir pruebas_procedimientos_mysql.txt y ejecutar escenario por escenario
    Paso 4: Para ver la demo web: doble clic en demo_navegable/index.html
```

---

## 6. Checklist Final — Prioridad de Ejecución

```
PRIORIDAD 1 — CRÍTICO (componente B, 6 puntos en riesgo total)
  [ ] DDL MySQL: 16 tablas con ENGINE=InnoDB, ENUMs, FK, índices
  [ ] DML MySQL: datos semilla coherentes (sedes, médicos, pacientes, bloques, solicitudes)
  [ ] sp_registrar_cita_medica con START TRANSACTION + SELECT...FOR UPDATE
  [ ] sp_cancelar_cita_reactiva con historial + conteo cancelaciones + lista espera
  [ ] sp_crear_bloques_horarios con loop de intervalos
  [ ] sp_registrar_asistencia_ticket con generación de código de turno
  [ ] sp_reprogramar_cita con conteo historial y bloqueo de cuenta
  [ ] fn_calcular_edad y fn_verificar_slot_libre
  [ ] pruebas_procedimientos_mysql.txt con 5 escenarios y resultados esperados
  [ ] Probar script completo en MySQL Workbench local — cero errores de sintaxis

PRIORIDAD 2 — NECESARIO (parte de los 9 puntos del componente A)
  [ ] Reexportar DER en alta resolución (≥ 2400 px)
  [ ] Convertir diccionario_datos.md a PDF entregable

PRIORIDAD 3 — NECESARIO (completa los 5 puntos del componente C)
  [ ] Redactar CU-01 a CU-05 con flujo básico y flujos alternativos formales

PRIORIDAD 4 — DIFERENCIADOR (nota máxima + impacto en exposición)
  [ ] Crear demo_navegable/index.html enlazando los mockups HTML existentes
  [ ] Configurar MySQL Workbench con el script listo para la demo del viernes
  [ ] Asignar roles del equipo para la exposición de 30 minutos
  [ ] Empaquetar .zip y verificar que todo está incluido y sin enlaces externos
```
