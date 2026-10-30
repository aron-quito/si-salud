# Estructura del Proyecto: Módulos, Milestones e Issues (CPM & GitHub Projects Ready)

Este documento define la estructura de descomposición del trabajo (WBS) bajo la jerarquía:
`MODULO X -> MILESTONES -> ISSUES`, integrando dependencias técnicas, identificador de **Ruta Crítica (CPM)** y tareas ejecutables en **Paralelo**.

---

## MODULO 0: Infraestructura y Setup Core (Sprint 0)

### MILESTONE 0.1: Entorno de Desarrollo y Contenedores Base
* **Fecha Objetivo:** Sprint 0 (Días 1 - 3)
* **Objetivo:** Disponer del entorno Dockerizado (PostgreSQL y Redis) y la arquitectura base de Next.js.

* **[ISSUE 0.1.1] [SETUP-01] Infra: Docker Compose para PostgreSQL y Redis BullMQ**
  * **Tipo:** Ruta Crítica (CPM)
  * **Dependencias:** Ninguna (Raíz)
  * **Bloquea a:** ISSUE 0.2.1
  * **Esfuerzo:** 3 Hrs | DevOps / Backend
  * **Descripción:** Levantar `docker-compose.yml` con servicios de PostgreSQL 16 (puerto 5432) y Redis 7 (puerto 6379) con volúmenes persistentes y variables de entorno configuradas.
  * **Criterios de Aceptación:** Contenedores corriendo y respondiendo a pruebas de conexión locales.

* **[ISSUE 0.1.2] [SETUP-02] Frontend: Inicializar Proyecto Next.js, TailwindCSS y Shadcn UI**
  * **Tipo:** Paralelo
  * **Dependencias:** Ninguna (Raíz)
  * **Bloquea a:** ISSUE 0.2.1
  * **Esfuerzo:** 4 Hrs | Frontend Dev
  * **Descripción:** Inicializar proyecto Next.js (App Router, TypeScript) con TailwindCSS y catálogo de componentes Shadcn UI (botones, inputs, modales, toasts, badges). Configurar layout maestro.
  * **Criterios de Aceptación:** `npm run dev` compila sin errores y renderiza la página base de bienvenida.

---

### MILESTONE 0.2: Modelo de Datos Relacional y Seguridad Base
* **Fecha Objetivo:** Sprint 0 (Días 4 - 6)
* **Objetivo:** Base de datos relacional creada con Prisma y pipeline de autenticación con RBAC y 2FA.

* **[ISSUE 0.2.1] [SETUP-03] BD: Modelado Prisma Schema (17 Tablas con Cargas Familiares) y Migraciones**
  * **Tipo:** Ruta Crítica (CPM)
  * **Dependencias:** ISSUE 0.1.1, ISSUE 0.1.2
  * **Bloquea a:** ISSUE 0.2.2, ISSUE 2.1.1, ISSUE 3.1.2
  * **Esfuerzo:** 6 Hrs | Backend Dev
  * **Descripción:** Traducir el DER a `schema.prisma` (17 entidades, incluyendo `CARGA_FAMILIAR`, `INTERCONSULTA`, `TICKET_ASISTENCIA`). Ejecutar `npx prisma migrate dev` y crear seeder inicial de roles, especialidades y administrador.
  * **Criterios de Aceptación:** Migración ejecutada en PostgreSQL sin errores de integridad referencial.

* **[ISSUE 0.2.2] [SETUP-04] Sec: Autenticación NextAuth.js (JWT, RBAC y 2FA)**
  * **Tipo:** Ruta Crítica (CPM)
  * **Dependencias:** ISSUE 0.2.1
  * **Bloquea a:** ISSUE 1.1.1, ISSUE 2.1.3
  * **Esfuerzo:** 6 Hrs | Fullstack Dev
  * **Descripción:** Configurar NextAuth.js para inicio de sesión por credenciales seguras (Bcrypt) con sesiones JWT. Crear middleware de protección de rutas basado en roles (Admin, Medico, Admision, Paciente).
  * **Criterios de Aceptación:** Middleware redirige según rol y rechaza peticiones no autorizadas con 401/403.

---

## MODULO 1: Autenticación, Pacientes y Cargas Familiares

### MILESTONE 1.1: Identidad Digital y Gestión de Cargas Familiares
* **Fecha Objetivo:** Sprint 1 (Semana 1)
* **Objetivo:** Registro de pacientes titulares y vinculación de dependientes (menores y ancianos) sin correo propio.

* **[ISSUE 1.1.1] [PAC-01] Fullstack: Registro de Pacientes, Login y Doble Factor (2FA)**
  * **Tipo:** Dependiente
  * **Dependencias:** ISSUE 0.2.2
  * **Bloquea a:** ISSUE 1.1.2
  * **Esfuerzo:** 5 Hrs | Fullstack Dev
  * **Descripción:** Pantallas de registro por DNI, correo y teléfono. Integrar envío de código 2FA por SMS/correo para confirmación de cuenta y flujo de recuperación de contraseña.
  * **Criterios de Aceptación:** Usuario se registra, recibe código de 6 dígitos y valida su cuenta exitosamente.

* **[ISSUE 1.1.2] [PAC-02] Fullstack: Módulo de Cargas Familiares (Dependientes y Menores)**
  * **Tipo:** Dependiente
  * **Dependencias:** ISSUE 1.1.1
  * **Bloquea a:** ISSUE 1.1.3
  * **Esfuerzo:** 5 Hrs | Fullstack Dev
  * **Descripción:** Interfaz y endpoints para que el paciente titular registre a sus hijos menores de edad o adultos mayores tutelados (DNI, nombres, parentesco) vinculándolos a `CARGA_FAMILIAR` sin requerir correo propio.
  * **Criterios de Aceptación:** Titular puede agregar, listar y eliminar dependientes de su perfil.

* **[ISSUE 1.1.3] [PAC-03] Frontend: Dashboard de Paciente y Switcher de Perfil Familiar**
  * **Tipo:** Dependiente
  * **Dependencias:** ISSUE 1.1.2
  * **Bloquea a:** ISSUE 3.1.1
  * **Esfuerzo:** 4 Hrs | Frontend Dev
  * **Descripción:** Panel principal del paciente con selector de perfil activo (Titular vs Dependiente), vista de citas agendadas, recetas descargables en PDF e historial clínico.
  * **Criterios de Aceptación:** Al alternar el perfil activo, las citas y recetas mostradas se filtran por el dependiente seleccionado.

---

## MODULO 2: Staff Médico y Directorio Público

### MILESTONE 2.1: Catálogos Médicos, Directorio SEO y Agenda
* **Fecha Objetivo:** Sprint 1 (Semana 2)
* **Objetivo:** Directorio público abierto para indexación y panel de agenda médica diaria.

* **[ISSUE 2.1.1] [MED-01] Backend: CRUD de Sedes, Consultorios y Especialidades**
  * **Tipo:** Ruta Crítica (CPM)
  * **Dependencias:** ISSUE 0.2.1
  * **Bloquea a:** ISSUE 2.1.2, ISSUE 4.1.1
  * **Esfuerzo:** 5 Hrs | Backend Dev
  * **Descripción:** Endpoints administrativos para gestionar Sedes físicas, Consultorios asignados y Catálogo maestro de Especialidades médicas.
  * **Criterios de Aceptación:** Operaciones CRUD completas con validación Zod y filtros por sede activa.

* **[ISSUE 2.1.2] [MED-02] Frontend: Directorio Médico Público con SSR y Búsqueda Reactiva (SEO)**
  * **Tipo:** Paralelo
  * **Dependencias:** ISSUE 2.1.1
  * **Bloquea a:** Ninguno (Consumidor final)
  * **Esfuerzo:** 5 Hrs | Frontend Dev
  * **Descripción:** Página de acceso público renderizada por servidor (SSR) para posicionamiento SEO. Búsqueda en tiempo real con debounce por médico y especialidad.
  * **Criterios de Aceptación:** Respuesta en < 3 segundos, meta-tags SEO presentes y navegación sin necesidad de iniciar sesión.

* **[ISSUE 2.1.3] [MED-03] Fullstack: Panel de Agenda Médica y Consulta de Historiales**
  * **Tipo:** Dependiente
  * **Dependencias:** ISSUE 2.1.1, ISSUE 0.2.2
  * **Bloquea a:** ISSUE 6.1.4
  * **Esfuerzo:** 6 Hrs | Fullstack Dev
  * **Descripción:** Vista del médico con calendario de citas diarias/semanales filtradas por `medico_id`. Visualización del score de triaje y motivo de consulta.
  * **Criterios de Aceptación:** Médico visualiza sus citas del día en tiempo real según fecha seleccionada.

---

## MODULO 3: Motor de Triaje Inteligente y Filtro Clínico

### MILESTONE 3.1: Captura de Síntomas, Evaluación NLP y Filtro de Urgencias
* **Fecha Objetivo:** Sprint 2 (Semana 3)
* **Objetivo:** Formulario de síntomas inteligente con detección de banderas rojas vitales y bolsa de solicitudes.

* **[ISSUE 3.1.1] [TRI-01] Frontend: Formulario de Triaje y Control Anti-Acaparamiento**
  * **Tipo:** Dependiente
  * **Dependencias:** ISSUE 1.1.3
  * **Bloquea a:** ISSUE 3.1.4
  * **Esfuerzo:** 5 Hrs | Frontend Dev
  * **Descripción:** Formulario React Hook Form con captura de síntomas (> 20 caracteres), selector de beneficiario (Titular/Carga), modalidad (Presencial/Meet) y preferencia horaria (Mañana/Tarde). Validar que no tenga ya una solicitud activa para esa especialidad.
  * **Criterios de Aceptación:** Si tiene una solicitud pendiente en la especialidad, bloquea el envío con alerta informativa.

* **[ISSUE 3.1.2] [TRI-02] Backend: Servicio NLP de Triaje IA (Score Urgencia y Bloques Elásticos)**
  * **Tipo:** Ruta Crítica (CPM)
  * **Dependencias:** ISSUE 0.2.1
  * **Bloquea a:** ISSUE 3.1.3, ISSUE 3.1.4
  * **Esfuerzo:** 7 Hrs | Backend Dev / AI
  * **Descripción:** Route Handler conectado a modelo LLM. Analiza los síntomas en texto natural y extrae: `score_urgencia` (0 a 100), `complejidad_bloques` (1, 2 o 3 bloques contiguos) y clasificación de especialidad.
  * **Criterios de Aceptación:** Retorna JSON estructurado en < 2 segundos con manejo de reintentos y timeouts.

* **[ISSUE 3.1.3] [TRI-03] Backend: Protocolo de Bloqueo por Emergencia Vital (Banderas Rojas >= 85)**
  * **Tipo:** Dependiente
  * **Dependencias:** ISSUE 3.1.2
  * **Bloquea a:** Ninguno (Filtro de seguridad)
  * **Esfuerzo:** 4 Hrs | Fullstack Dev
  * **Descripción:** Si `score_urgencia >= 85`, el backend no almacena la solicitud en la bolsa; retorna alerta roja inmediata con derivación a urgencias presenciales y números de emergencia (106/SAMU).
  * **Criterios de Aceptación:** Se bloquea la creación de citas ambulatorias para casos potencialmente letales.

* **[ISSUE 3.1.4] [TRI-04] Backend: Bolsa de Solicitudes y Enrutamiento (Primer Nivel vs Interconsulta)**
  * **Tipo:** Ruta Crítica (CPM)
  * **Dependencias:** ISSUE 3.1.1, ISSUE 3.1.2
  * **Bloquea a:** ISSUE 4.1.2, ISSUE 4.1.4
  * **Esfuerzo:** 6 Hrs | Backend Dev
  * **Descripción:** Persistencia en `SOLICITUD_TRIAJE` en estado `Pendiente`. Si la especialidad deducida es de alta complejidad y no cuenta con `INTERCONSULTA` previa, se enruta a Medicina General.
  * **Criterios de Aceptación:** Registro exitoso en PostgreSQL y sincronización con Redis para el procesamiento batch.

---

## MODULO 4: Motor de Agendamiento Batch (Smart Slotting) y Cortesía

### MILESTONE 4.1: Time-Slotting Estricto y Procesamiento Batch a Medianoche
* **Fecha Objetivo:** Sprint 2 (Semana 4)
* **Objetivo:** Asignación algorítmica de citas a medianoche, bloques elásticos contiguos y cortesía de 12h.

* **[ISSUE 4.1.1] [MIA-01] Backend: Generador Masivo de Bloques Horarios Fijos (ACID)**
  * **Tipo:** Ruta Crítica (CPM)
  * **Dependencias:** ISSUE 2.1.1
  * **Bloquea a:** ISSUE 4.1.2
  * **Esfuerzo:** 5 Hrs | Backend Dev
  * **Descripción:** Servicio para pre-poblar celdas de tiempo fijas (15 minutos) en `BLOQUE_HORARIO` por médico y consultorio. Validación estricta contra solapamientos físicos.
  * **Criterios de Aceptación:** Inserción masiva de bloques con estado inicial `Libre`.

* **[ISSUE 4.1.2] [MIA-02] Backend: Worker Batch BullMQ (Smart Slotting y Bloques Elásticos Contiguos)**
  * **Tipo:** Ruta Crítica (CPM)
  * **Dependencias:** ISSUE 3.1.4, ISSUE 4.1.1
  * **Bloquea a:** ISSUE 4.1.3, ISSUE 5.1.1, ISSUE 6.1.1
  * **Esfuerzo:** 9 Hrs | Backend Dev / DevOps
  * **Descripción:** Cron Job a las 00:00 que extrae solicitudes pendientes en la Bolsa, ordena por Score de Urgencia y reprogramaciones, y aplica algoritmo de empaquetamiento contiguo en un horizonte de 1 a 30 días.
  * **Criterios de Aceptación:** Cero solapamiento de horarios bajo transacciones ACID en PostgreSQL. Citas generadas en estado `Programada`.

* **[ISSUE 4.1.3] [MIA-03] Fullstack: Notificaciones Nocturnas y Ventana de Cortesía 12h**
  * **Tipo:** Dependiente
  * **Dependencias:** ISSUE 4.1.2
  * **Bloquea a:** ISSUE 5.1.2
  * **Esfuerzo:** 6 Hrs | Fullstack Dev
  * **Descripción:** Envío de correo con detalles de cita y botón "Rechazar Horario" activo hasta las 12:00 PM. Si se rechaza, el bloque pasa inmediatamente a `Libre` y la solicitud vuelve a la bolsa sin consumir reprogramación.
  * **Criterios de Aceptación:** El bloque rechazado queda libre de inmediato para lista de espera; no se computa sanción al usuario.

* **[ISSUE 4.1.4] [MIA-04] Fullstack: Asignación Manual Pre-Batch desde la Bolsa**
  * **Tipo:** Paralelo
  * **Dependencias:** ISSUE 3.1.4, ISSUE 4.1.1
  * **Bloquea a:** Ninguno (Operación administrativa)
  * **Esfuerzo:** 5 Hrs | Fullstack Dev
  * **Descripción:** Interfaz para que el Administrador inspeccione solicitudes pendientes en la Bolsa y pueda asignarlas manualmente a un bloque libre del médico antes del cron de medianoche.
  * **Criterios de Aceptación:** Asignación inmediata respetando reglas ACID sin romper el procesamiento nocturno posterior.

---

## MODULO 5: Lista de Espera Reactiva y Contingencia Institucional

### MILESTONE 5.1: Acelerador de Turnos, Hold Temporal y Contingencia Médica
* **Fecha Objetivo:** Sprint 3 (Semana 5)
* **Objetivo:** Optimización de cupos liberados mediante Hold de 20 min y contingencia ante bajas de médicos.

* **[ISSUE 5.1.1] [ESP-01] Backend: Enrolamiento Doble Riel a Lista de Espera**
  * **Tipo:** Dependiente
  * **Dependencias:** ISSUE 4.1.2
  * **Bloquea a:** ISSUE 5.1.2
  * **Esfuerzo:** 4 Hrs | Backend Dev
  * **Descripción:** Lógica automática en el cron batch: si un paciente tiene Urgencia Alta (65-84) y su cita asignada quedó a más de 7 días, se le inscribe automáticamente en `LISTA_ESPERA`.
  * **Criterios de Aceptación:** Paciente conserva su cita garantizada lejana y queda activo en lista de espera reactiva.

* **[ISSUE 5.1.2] [ESP-02] Backend: Motor Reactivo de Lista de Espera con Hold Exclusivo (20 min)**
  * **Tipo:** Ruta Crítica (CPM)
  * **Dependencias:** ISSUE 5.1.1, ISSUE 4.1.3
  * **Bloquea a:** ISSUE 5.1.3
  * **Esfuerzo:** 8 Hrs | Backend Dev
  * **Descripción:** Al cancelarse o rechazarse un slot, validar si faltan $\ge 80$ min para la cita. Si aplica, colocar `BLOQUE_HORARIO` en `Hold_Temporal` por 20 min para el paciente #1 de la cola. Si acepta, se confirma; si expira, pasa al paciente #2.
  * **Criterios de Aceptación:** Garantía de al menos 1 hora de margen de traslado para el paciente que acepte.

* **[ISSUE 5.1.3] [ESP-03] Fullstack: Protocolo de Contingencia Institucional por Ausencia Médica**
  * **Tipo:** Dependiente
  * **Dependencias:** ISSUE 5.1.2, ISSUE 4.1.2
  * **Bloquea a:** Ninguno
  * **Esfuerzo:** 7 Hrs | Fullstack Dev
  * **Descripción:** Flujo ante imprevisto médico: notificación masiva inmediata, reasignación automática a colega en la misma franja horaria (Escalón 1), paso a lista de espera diurna (Escalón 2) o reingreso a bolsa nocturna Top Priority (Escalón 3).
  * **Criterios de Aceptación:** Cero citas perdidas en el limbo sin computar faltas ni cancelaciones a los pacientes.

* **[ISSUE 5.1.4] [ESP-04] Backend: Motor de Reprogramaciones y Penalización en Citas (Límite 3)**
  * **Tipo:** Dependiente
  * **Dependencias:** ISSUE 4.1.2
  * **Bloquea a:** Ninguno
  * **Esfuerzo:** 5 Hrs | Backend Dev
  * **Descripción:** Endpoint `/api/citas/reprogramar`. Reingresa a la bolsa nocturna con `es_reprogramacion = True`. Si acumula 3 reprogramaciones en el historial, desactiva `PACIENTE.permite_agendar = False` por 30 días sin bloquear el login.
  * **Criterios de Aceptación:** Error 403 al intentar una cuarta reprogramación; paciente sigue accediendo a sus recetas.

---

## MODULO 6: Día de Atención: Admisión, Sala de Espera y Telemedicina

### MILESTONE 6.1: Check-in, Turnero Dual, Consultorio y Cierre de Jornada
* **Fecha Objetivo:** Sprint 3 (Semana 6)
* **Objetivo:** Admisión presencial y virtual, turnero digital en sala y móvil, y auditoría de inasistencias.

* **[ISSUE 6.1.1] [CIT-01] Frontend: Módulo de Admisión Presencial y Emisión de Ticket de Turno**
  * **Tipo:** Ruta Crítica (CPM)
  * **Dependencias:** ISSUE 4.1.2
  * **Bloquea a:** ISSUE 6.1.3
  * **Esfuerzo:** 5 Hrs | Frontend Dev
  * **Descripción:** Pantalla rápida para recepción y tótem táctil. Búsqueda por DNI o código de cita, botón de check-in con un clic y generación de `TICKET_ASISTENCIA` con código de turno (ej. T-042).
  * **Criterios de Aceptación:** Cita pasa a `En_Sala_Espera` y genera ticket visible sin recargar la página.

* **[ISSUE 6.1.2] [CIT-02] Fullstack: Check-in Virtual para Telemedicina (Meet / Llamada)**
  * **Tipo:** Paralelo a 6.1.1
  * **Dependencias:** ISSUE 4.1.2
  * **Bloquea a:** ISSUE 6.1.3
  * **Esfuerzo:** 5 Hrs | Fullstack Dev
  * **Descripción:** Sala de espera online en el portal del paciente. Botón "Entrar a Sala Virtual" activo 15 minutos antes. Actualiza el estado a `En_Sala_Virtual` para evitar falsos No-Shows.
  * **Criterios de Aceptación:** Al presionar el botón, el médico visualiza en su agenda que el paciente está conectado.

* **[ISSUE 6.1.3] [CIT-03] Fullstack: Turnero Digital en TV + Notificación Push Móvil**
  * **Tipo:** Dependiente
  * **Dependencias:** ISSUE 6.1.1, ISSUE 6.1.2
  * **Bloquea a:** ISSUE 6.1.4
  * **Esfuerzo:** 6 Hrs | Fullstack Dev
  * **Descripción:** Pantalla pública de TV para sala de espera que muestra en tiempo real el turno llamado, consultorio y sonido de alerta. Disparo concurrente de notificación push al móvil del paciente.
  * **Criterios de Aceptación:** Actualización mediante WebSockets en < 1 segundo al llamar el médico.

* **[ISSUE 6.1.4] [CIT-04] Fullstack: Protocolo de 2 Llamados, Rezagados, Recetas PDF e Interconsultas**
  * **Tipo:** Ruta Crítica (CPM)
  * **Dependencias:** ISSUE 6.1.3, ISSUE 2.1.3
  * **Bloquea a:** ISSUE 6.1.5
  * **Esfuerzo:** 7 Hrs | Fullstack Dev
  * **Descripción:** Panel de atención médica. Botón de llamado (1er y 2do llamado a los 3 min). Si no entra, pasa a `Rezagado`. Formulario de diagnóstico CIE-10, emisión de PDF de receta y generación de `INTERCONSULTA` a especialistas.
  * **Criterios de Aceptación:** Si un rezagado entra más tarde, solo consume los minutos restantes de su bloque original.

* **[ISSUE 6.1.5] [CIT-05] Backend: Worker de Cierre de Turno de Consultorio y Liquidación de No-Shows**
  * **Tipo:** Dependiente
  * **Dependencias:** ISSUE 6.1.4
  * **Bloquea a:** Ninguno (Cierre de ciclo operativo)
  * **Esfuerzo:** 5 Hrs | Backend Dev
  * **Descripción:** Cron/Worker que corre al finalizar la franja del consultorio (ej. 14:00 y 20:00). Revisa citas en `Programada`, `Confirmada` o `Rezagado` sin atención presencial/virtual, transiciona a `No_Show` e incrementa `+1` a `PACIENTE.contador_faltas`.
  * **Criterios de Aceptación:** Si el paciente acumula 2 faltas injustificadas, se activa la suspensión temporal de reserva por 30 días.
