#!/usr/bin/env python3
import json
import subprocess
import sys
import time

REPO = "aron-quito/si-salud"

LABELS = [
    {"name": "critical-path", "color": "D93F0B", "description": "Ruta Crítica (CPM)"},
    {"name": "parallel", "color": "0E8A16", "description": "Ejecutable en Paralelo"},
    {"name": "backend", "color": "1D76DB", "description": "Backend & Lógica de Negocio"},
    {"name": "frontend", "color": "5319E7", "description": "Frontend & UI/UX"},
    {"name": "fullstack", "color": "B60205", "description": "Fullstack End-to-End"},
    {"name": "devops", "color": "FBCA04", "description": "Infraestructura & CI/CD"},
    {"name": "modulo-0", "color": "6C757D", "description": "Setup & Arquitectura Base"},
    {"name": "modulo-1", "color": "28A745", "description": "Autenticación & Pacientes"},
    {"name": "modulo-2", "color": "17A2B8", "description": "Staff Médico & Directorio"},
    {"name": "modulo-3", "color": "FFC107", "description": "Triaje Inteligente & NLP"},
    {"name": "modulo-4", "color": "FD7E14", "description": "Smart Slotting Batch"},
    {"name": "modulo-5", "color": "E83E8C", "description": "Lista de Espera & Contingencia"},
    {"name": "modulo-6", "color": "20C997", "description": "Admisión & Consultorio"}
]

DATA = [
    {
        "modulo": "MODULO 0: Infraestructura y Setup Core",
        "milestones": [
            {
                "title": "M0.1: Entorno de Desarrollo y Contenedores Base",
                "description": "Docker Compose con PostgreSQL y Redis BullMQ, e inicialización de Next.js.",
                "issues": [
                    {
                        "title": "[SETUP-01] Infra: Docker Compose para PostgreSQL y Redis BullMQ",
                        "labels": ["critical-path", "devops", "modulo-0"],
                        "body": """### Descripción
Levantar `docker-compose.yml` con servicios de PostgreSQL 16 (puerto 5432) y Redis 7 (puerto 6379) con volúmenes persistentes y variables de entorno configuradas.

### Dependencias y CPM
- **Tipo:** Ruta Crítica (CPM)
- **Bloqueado por:** Ninguna (Tarea Raíz)
- **Bloquea a:** [SETUP-03] Modelado Prisma Schema
- **Esfuerzo:** 3 Horas

### Criterios de Aceptación
- [ ] Contenedores PostgreSQL y Redis levantados con `docker compose up -d`.
- [ ] Persistencia de datos verificada con reinicio de contenedor.
- [ ] Conexión probada desde cliente local."""
                    },
                    {
                        "title": "[SETUP-02] Frontend: Inicializar Proyecto Next.js, TailwindCSS y Shadcn UI",
                        "labels": ["parallel", "frontend", "modulo-0"],
                        "body": """### Descripción
Inicializar proyecto Next.js (App Router, TypeScript) con TailwindCSS y catálogo de componentes Shadcn UI (botones, inputs, modales, toasts, badges). Configurar layout maestro.

### Dependencias y CPM
- **Tipo:** Paralelo (Ejecutable simultáneamente con SETUP-01)
- **Bloqueado por:** Ninguna
- **Bloquea a:** [SETUP-03] Modelado Prisma Schema
- **Esfuerzo:** 4 Horas

### Criterios de Aceptación
- [ ] `npm run dev` compila sin errores y renderiza la página base de bienvenida.
- [ ] Componentes base de Shadcn UI instalados en `@/components/ui`.
- [ ] Linter y Prettier configurados en el repositorio."""
                    }
                ]
            },
            {
                "title": "M0.2: Modelo de Datos Relacional y Seguridad Base",
                "description": "Schema Prisma relacional (17 tablas con cargas familiares) y autenticación NextAuth.",
                "issues": [
                    {
                        "title": "[SETUP-03] BD: Modelado Prisma Schema (17 Tablas con Cargas Familiares) y Migraciones",
                        "labels": ["critical-path", "backend", "modulo-0"],
                        "body": """### Descripción
Traducir el DER a `schema.prisma` (17 entidades, incluyendo `CARGA_FAMILIAR`, `INTERCONSULTA`, `TICKET_ASISTENCIA`). Ejecutar `npx prisma migrate dev` y crear seeder inicial de roles, especialidades y administrador.

### Dependencias y CPM
- **Tipo:** Ruta Crítica (CPM)
- **Bloqueado por:** [SETUP-01] Docker Compose, [SETUP-02] Inicializar Next.js
- **Bloquea a:** [SETUP-04] Autenticación NextAuth, [MED-01] CRUD Catálogos, [TRI-02] Servicio NLP
- **Esfuerzo:** 6 Horas

### Criterios de Aceptación
- [ ] Migración Prisma ejecutada en PostgreSQL sin errores de integridad referencial.
- [ ] Seed inicial genera roles (`Paciente`, `Medico`, `Admision`, `Admin`) y sedes de prueba.
- [ ] Cliente Prisma generado y tipado disponible en `@/lib/prisma`."""
                    },
                    {
                        "title": "[SETUP-04] Sec: Autenticación NextAuth.js (JWT, RBAC y 2FA)",
                        "labels": ["critical-path", "fullstack", "modulo-0"],
                        "body": """### Descripción
Configurar NextAuth.js para inicio de sesión por credenciales seguras (Bcrypt) con sesiones JWT. Crear middleware de protección de rutas basado en roles (Admin, Medico, Admision, Paciente).

### Dependencias y CPM
- **Tipo:** Ruta Crítica (CPM)
- **Bloqueado por:** [SETUP-03] Modelado Prisma Schema
- **Bloquea a:** [PAC-01] Registro Pacientes, [MED-03] Panel Médico
- **Esfuerzo:** 6 Horas

### Criterios de Aceptación
- [ ] Middleware redirige según rol y rechaza peticiones no autorizadas con 401/403.
- [ ] Soporte para sesiones JWT enriquecidas con `id`, `rol` y `permite_agendar`.
- [ ] Rutas públicas (Directorio médico) exentas de bloqueo de autenticación."""
                    }
                ]
            }
        ]
    },
    {
        "modulo": "MODULO 1: Autenticación, Pacientes y Cargas Familiares",
        "milestones": [
            {
                "title": "M1.1: Identidad Digital y Gestión de Cargas Familiares",
                "description": "Registro de pacientes y gestión de dependientes sin correo propio.",
                "issues": [
                    {
                        "title": "[PAC-01] Fullstack: Registro de Pacientes, Login y Doble Factor (2FA)",
                        "labels": ["critical-path", "fullstack", "modulo-1"],
                        "body": """### Descripción
Pantallas de registro por DNI, correo y teléfono. Integrar envío de código 2FA por SMS/correo para confirmación de cuenta y flujo de recuperación de contraseña.

### Dependencias y CPM
- **Tipo:** Dependiente
- **Bloqueado por:** [SETUP-04] Autenticación NextAuth.js
- **Bloquea a:** [PAC-02] Módulo de Cargas Familiares
- **Esfuerzo:** 5 Horas

### Criterios de Aceptación
- [ ] Paciente se registra y valida código 2FA de 6 dígitos.
- [ ] Flujo de recuperación de contraseña con token de un solo uso.
- [ ] Validaciones de formato de DNI y contraseña robusta."""
                    },
                    {
                        "title": "[PAC-02] Fullstack: Módulo de Cargas Familiares (Dependientes y Menores)",
                        "labels": ["critical-path", "fullstack", "modulo-1"],
                        "body": """### Descripción
Interfaz y endpoints para que el paciente titular registre a sus hijos menores de edad o adultos mayores tutelados (DNI, nombres, parentesco) vinculándolos a `CARGA_FAMILIAR` sin requerir correo propio.

### Dependencias y CPM
- **Tipo:** Dependiente
- **Bloqueado por:** [PAC-01] Registro de Pacientes
- **Bloquea a:** [PAC-03] Dashboard y Switcher
- **Esfuerzo:** 5 Horas

### Criterios de Aceptación
- [ ] Titular puede registrar dependientes con parentesco (Hijo/a, Cónyuge, Padre/Madre, Tutorado).
- [ ] Los dependientes no requieren email propio ni login separado.
- [ ] Endpoints GET / POST / DELETE validados por sesión del titular."""
                    },
                    {
                        "title": "[PAC-03] Frontend: Dashboard de Paciente y Switcher de Perfil Familiar",
                        "labels": ["parallel", "frontend", "modulo-1"],
                        "body": """### Descripción
Panel principal del paciente con selector de perfil activo (Titular vs Dependiente), vista de citas agendadas, recetas descargables en PDF e historial clínico.

### Dependencias y CPM
- **Tipo:** Dependiente
- **Bloqueado por:** [PAC-02] Módulo de Cargas Familiares
- **Bloquea a:** [TRI-01] Formulario de Triaje
- **Esfuerzo:** 4 Horas

### Criterios de Aceptación
- [ ] Switcher visual permite alternar el perfil activo del paciente.
- [ ] Las citas y recetas mostradas se filtran dinámicamente por el dependiente seleccionado.
- [ ] Interfaz completamente responsive."""
                    }
                ]
            }
        ]
    },
    {
        "modulo": "MODULO 2: Staff Médico y Directorio Público",
        "milestones": [
            {
                "title": "M2.1: Catálogos Médicos, Directorio SEO y Agenda",
                "description": "Directorio público SSR para SEO y panel de agenda médica diaria.",
                "issues": [
                    {
                        "title": "[MED-01] Backend: CRUD de Sedes, Consultorios y Especialidades",
                        "labels": ["critical-path", "backend", "modulo-2"],
                        "body": """### Descripción
Endpoints administrativos para gestionar Sedes físicas, Consultorios asignados y Catálogo maestro de Especialidades médicas.

### Dependencias y CPM
- **Tipo:** Ruta Crítica (CPM)
- **Bloqueado por:** [SETUP-03] Modelado Prisma Schema
- **Bloquea a:** [MED-02] Directorio Público, [MIA-01] Generador de Bloques
- **Esfuerzo:** 5 Horas

### Criterios de Aceptación
- [ ] Operaciones CRUD completas con validación Zod.
- [ ] Filtro por sedes activas y relación N:M entre médicos y especialidades."""
                    },
                    {
                        "title": "[MED-02] Frontend: Directorio Médico Público con SSR y Búsqueda Reactiva (SEO)",
                        "labels": ["parallel", "frontend", "modulo-2"],
                        "body": """### Descripción
Página de acceso público renderizada por servidor (SSR) para posicionamiento SEO. Búsqueda en tiempo real con debounce por médico y especialidad.

### Dependencias y CPM
- **Tipo:** Paralelo
- **Bloqueado por:** [MED-01] CRUD de Sedes y Especialidades
- **Bloquea a:** Ninguno (Consumidor final)
- **Esfuerzo:** 5 Horas

### Criterios de Aceptación
- [ ] Respuesta de búsqueda en tiempo real en < 3 segundos.
- [ ] Meta tags OpenGraph y SEO para indexación pública.
- [ ] Perfil médico con foto, CMP y horarios habituales de atención."""
                    },
                    {
                        "title": "[MED-03] Fullstack: Panel de Agenda Médica y Consulta de Historiales",
                        "labels": ["critical-path", "fullstack", "modulo-2"],
                        "body": """### Descripción
Vista del médico con calendario de citas diarias/semanales filtradas por `medico_id`. Visualización del score de triaje y motivo de consulta.

### Dependencias y CPM
- **Tipo:** Dependiente
- **Bloqueado por:** [MED-01] CRUD de Sedes, [SETUP-04] Autenticación
- **Bloquea a:** [CIT-04] Protocolo de Llamado en Consultorio
- **Esfuerzo:** 6 Horas

### Criterios de Aceptación
- [ ] Calendario interactivo con Shadcn UI filtrado por día y semana.
- [ ] Visualización de badges con Score de Urgencia y modalidad (Presencial / Virtual)."""
                    }
                ]
            }
        ]
    },
    {
        "modulo": "MODULO 3: Motor de Triaje Inteligente y Filtro Clínico",
        "milestones": [
            {
                "title": "M3.1: Captura de Síntomas, Evaluación NLP y Filtro de Urgencias",
                "description": "Triaje NLP, descarte de banderas rojas y bolsa de solicitudes.",
                "issues": [
                    {
                        "title": "[TRI-01] Frontend: Formulario de Triaje y Control Anti-Acaparamiento",
                        "labels": ["parallel", "frontend", "modulo-3"],
                        "body": """### Descripción
Formulario React Hook Form con captura de síntomas (> 20 caracteres), selector de beneficiario (Titular/Carga), modalidad (Presencial/Meet) y preferencia horaria (Mañana/Tarde). Validar que no tenga ya una solicitud activa para esa especialidad.

### Dependencias y CPM
- **Tipo:** Dependiente
- **Bloqueado por:** [PAC-03] Dashboard de Paciente
- **Bloquea a:** [TRI-04] Bolsa de Solicitudes
- **Esfuerzo:** 5 Horas

### Criterios de Aceptación
- [ ] Si el paciente seleccionado ya tiene una solicitud pendiente en la especialidad, bloquea el envío con alerta informativa.
- [ ] Validación de campos obligatorios en el cliente con Zod."""
                    },
                    {
                        "title": "[TRI-02] Backend: Servicio NLP de Triaje IA (Score Urgencia y Bloques Elásticos)",
                        "labels": ["critical-path", "backend", "modulo-3"],
                        "body": """### Descripción
Route Handler conectado a modelo LLM. Analiza los síntomas en texto natural y extrae: `score_urgencia` (0 a 100), `complejidad_bloques` (1, 2 o 3 bloques contiguos) y clasificación de especialidad.

### Dependencias y CPM
- **Tipo:** Ruta Crítica (CPM)
- **Bloqueado por:** [SETUP-03] Modelado Prisma Schema
- **Bloquea a:** [TRI-03] Banderas Rojas, [TRI-04] Bolsa de Solicitudes
- **Esfuerzo:** 7 Horas

### Criterios de Aceptación
- [ ] Retorna JSON estructurado en < 2 segundos con manejo de timeouts y fallbacks.
- [ ] Deducción de bloques elásticos según gravedad deducida."""
                    },
                    {
                        "title": "[TRI-03] Backend: Protocolo de Bloqueo por Emergencia Vital (Banderas Rojas >= 85)",
                        "labels": ["parallel", "fullstack", "modulo-3"],
                        "body": """### Descripción
Si `score_urgencia >= 85`, el backend no almacena la solicitud en la bolsa; retorna alerta roja inmediata con derivación a urgencias presenciales y números de emergencia (106/SAMU).

### Dependencias y CPM
- **Tipo:** Dependiente
- **Bloqueado por:** [TRI-02] Servicio NLP
- **Bloquea a:** Ninguno (Filtro de seguridad clínica)
- **Esfuerzo:** 4 Horas

### Criterios de Aceptación
- [ ] Se bloquea la creación de citas ambulatorias para casos potencialmente letales.
- [ ] Despliegue de pantalla roja de alerta vital con botón de llamada directa de emergencia."""
                    },
                    {
                        "title": "[TRI-04] Backend: Bolsa de Solicitudes y Enrutamiento (Primer Nivel vs Interconsulta)",
                        "labels": ["critical-path", "backend", "modulo-3"],
                        "body": """### Descripción
Persistencia en `SOLICITUD_TRIAJE` en estado `Pendiente`. Si la especialidad deducida es de alta complejidad y no cuenta con `INTERCONSULTA` previa, se enruta a Medicina General.

### Dependencias y CPM
- **Tipo:** Ruta Crítica (CPM)
- **Bloqueado por:** [TRI-01] Formulario Triaje, [TRI-02] Servicio NLP
- **Bloquea a:** [MIA-02] Worker Batch BullMQ, [MIA-04] Asignación Manual
- **Esfuerzo:** 6 Horas

### Criterios de Aceptación
- [ ] Registro exitoso en PostgreSQL en estado `Pendiente`.
- [ ] Encolado en Redis para el procesamiento nocturno."""
                    }
                ]
            }
        ]
    },
    {
        "modulo": "MODULO 4: Motor de Agendamiento Batch (Smart Slotting) y Cortesía",
        "milestones": [
            {
                "title": "M4.1: Time-Slotting Estricto y Procesamiento Batch a Medianoche",
                "description": "Algoritmo de asignación nocturna en BullMQ y ventana de cortesía de 12 horas.",
                "issues": [
                    {
                        "title": "[MIA-01] Backend: Generador Masivo de Bloques Horarios Fijos (ACID)",
                        "labels": ["critical-path", "backend", "modulo-4"],
                        "body": """### Descripción
Servicio para pre-poblar celdas de tiempo fijas (15 minutos) en `BLOQUE_HORARIO` por médico y consultorio. Validación estricta contra solapamientos físicos.

### Dependencias y CPM
- **Tipo:** Ruta Crítica (CPM)
- **Bloqueado por:** [MED-01] CRUD de Sedes y Consultorios
- **Bloquea a:** [MIA-02] Worker Batch BullMQ
- **Esfuerzo:** 5 Horas

### Criterios de Aceptación
- [ ] Inserción masiva de bloques con estado inicial `Libre`.
- [ ] Restricción única en base de datos para evitar cruces en consultorios."""
                    },
                    {
                        "title": "[MIA-02] Backend: Worker Batch BullMQ (Smart Slotting y Bloques Elásticos Contiguos)",
                        "labels": ["critical-path", "devops", "modulo-4"],
                        "body": """### Descripción
Cron Job a las 00:00 que extrae solicitudes pendientes en la Bolsa, ordena por Score de Urgencia y reprogramaciones, y aplica algoritmo de empaquetamiento contiguo en un horizonte de 1 a 30 días.

### Dependencias y CPM
- **Tipo:** Ruta Crítica (CPM)
- **Bloqueado por:** [TRI-04] Bolsa de Solicitudes, [MIA-01] Generador de Bloques
- **Bloquea a:** [MIA-03] Notificaciones y Cortesía, [ESP-01] Enrolamiento Doble Riel, [CIT-01] Admisión
- **Esfuerzo:** 9 Horas

### Criterios de Aceptación
- [ ] Cero solapamiento de horarios bajo transacciones ACID en PostgreSQL.
- [ ] Asignación estricta de bloques contiguos para citas elásticas (30 o 45 min)."""
                    },
                    {
                        "title": "[MIA-03] Fullstack: Notificaciones Nocturnas y Ventana de Cortesía 12h",
                        "labels": ["critical-path", "fullstack", "modulo-4"],
                        "body": """### Descripción
Envío de correo con detalles de cita y botón "Rechazar Horario" activo hasta las 12:00 PM. Si se rechaza, el bloque pasa inmediatamente a `Libre` y la solicitud vuelve a la bolsa sin consumir reprogramación.

### Dependencias y CPM
- **Tipo:** Ruta Crítica (CPM)
- **Bloqueado por:** [MIA-02] Worker Batch BullMQ
- **Bloquea a:** [ESP-02] Motor Reactivo de Lista de Espera
- **Esfuerzo:** 6 Horas

### Criterios de Aceptación
- [ ] El bloque rechazado queda libre de inmediato para lista de espera diurna.
- [ ] No se computa reprogramación ni falta al usuario por rechazo en ventana de 12h."""
                    },
                    {
                        "title": "[MIA-04] Fullstack: Asignación Manual Pre-Batch desde la Bolsa",
                        "labels": ["parallel", "fullstack", "modulo-4"],
                        "body": """### Descripción
Interfaz para que el Administrador inspeccione solicitudes pendientes en la Bolsa y pueda asignarlas manualmente a un bloque libre del médico antes del cron de medianoche.

### Dependencias y CPM
- **Tipo:** Paralelo
- **Bloqueado por:** [TRI-04] Bolsa de Solicitudes, [MIA-01] Generador de Bloques
- **Bloquea a:** Ninguno (Operación administrativa)
- **Esfuerzo:** 5 Horas

### Criterios de Aceptación
- [ ] Asignación inmediata respetando reglas ACID sin romper el procesamiento nocturno posterior.
- [ ] Registro de auditoría con `usuario_id` del administrador."""
                    }
                ]
            }
        ]
    },
    {
        "modulo": "MODULO 5: Lista de Espera Reactiva y Contingencia Institucional",
        "milestones": [
            {
                "title": "M5.1: Acelerador de Turnos, Hold Temporal y Contingencia Médica",
                "description": "Hold de 20 min en cupos liberados y protocolo de contingencia institucional.",
                "issues": [
                    {
                        "title": "[ESP-01] Backend: Enrolamiento Doble Riel a Lista de Espera",
                        "labels": ["critical-path", "backend", "modulo-5"],
                        "body": """### Descripción
Lógica automática en el cron batch: si un paciente tiene Urgencia Alta (65-84) y su cita asignada quedó a más de 7 días, se le inscribe automáticamente en `LISTA_ESPERA`.

### Dependencias y CPM
- **Tipo:** Dependiente
- **Bloqueado por:** [MIA-02] Worker Batch BullMQ
- **Bloquea a:** [ESP-02] Motor Reactivo de Lista de Espera
- **Esfuerzo:** 4 Horas

### Criterios de Aceptación
- [ ] Paciente conserva su cita garantizada lejana y queda activo en lista de espera reactiva.
- [ ] Priorización en la cola según score clínico y fecha de solicitud."""
                    },
                    {
                        "title": "[ESP-02] Backend: Motor Reactivo de Lista de Espera con Hold Exclusivo (20 min)",
                        "labels": ["critical-path", "backend", "modulo-5"],
                        "body": """### Descripción
Al cancelarse o rechazarse un slot, validar si faltan >= 80 min para la cita. Si aplica, colocar `BLOQUE_HORARIO` en `Hold_Temporal` por 20 min para el paciente #1 de la cola. Si acepta, se confirma; si expira, pasa al paciente #2.

### Dependencias y CPM
- **Tipo:** Ruta Crítica (CPM)
- **Bloqueado por:** [ESP-01] Enrolamiento Doble Riel, [MIA-03] Ventana de Cortesía
- **Bloquea a:** [ESP-03] Contingencia Médica
- **Esfuerzo:** 8 Horas

### Criterios de Aceptación
- [ ] Garantía de al menos 1 hora de margen de traslado para el paciente que acepte.
- [ ] Si faltan menos de 80 minutos para la cita, no se oferta a lista de espera remota."""
                    },
                    {
                        "title": "[ESP-03] Fullstack: Protocolo de Contingencia Institucional por Ausencia Médica",
                        "labels": ["parallel", "fullstack", "modulo-5"],
                        "body": """### Descripción
Flujo ante imprevisto médico: notificación masiva inmediata, reasignación automática a colega en la misma franja horaria (Escalón 1), paso a lista de espera diurna (Escalón 2) o reingreso a bolsa nocturna Top Priority (Escalón 3).

### Dependencias y CPM
- **Tipo:** Dependiente
- **Bloqueado por:** [ESP-02] Motor Reactivo, [MIA-02] Worker Batch
- **Bloquea a:** Ninguno
- **Esfuerzo:** 7 Horas

### Criterios de Aceptación
- [ ] Notificación Push/SMS inmediata a los pacientes del turno cancelado.
- [ ] Cero cómputo de faltas o sanciones a los pacientes afectados."""
                    },
                    {
                        "title": "[ESP-04] Backend: Motor de Reprogramaciones y Penalización en Citas (Límite 3)",
                        "labels": ["parallel", "backend", "modulo-5"],
                        "body": """### Descripción
Endpoint `/api/citas/reprogramar`. Reingresa a la bolsa nocturna con `es_reprogramacion = True`. Si acumula 3 reprogramaciones en el historial, desactiva `PACIENTE.permite_agendar = False` por 30 días sin bloquear el login.

### Dependencias y CPM
- **Tipo:** Dependiente
- **Bloqueado por:** [MIA-02] Worker Batch BullMQ
- **Bloquea a:** Ninguno
- **Esfuerzo:** 5 Horas

### Criterios de Aceptación
- [ ] Error 403 al intentar una cuarta reprogramación en el período auditado.
- [ ] Paciente sigue accediendo a sus recetas y atenciones médicas históricas."""
                    }
                ]
            }
        ]
    },
    {
        "modulo": "MODULO 6: Día de Atención: Admisión, Sala de Espera y Telemedicina",
        "milestones": [
            {
                "title": "M6.1: Check-in, Turnero Dual, Consultorio y Cierre de Jornada",
                "description": "Turnero digital en sala y móvil, atención médica y liquidación de No-Shows.",
                "issues": [
                    {
                        "title": "[CIT-01] Frontend: Módulo de Admisión Presencial y Emisión de Ticket de Turno",
                        "labels": ["critical-path", "frontend", "modulo-6"],
                        "body": """### Descripción
Pantalla rápida para recepción y tótem táctil. Búsqueda por DNI o código de cita, botón de check-in con un clic y generación de `TICKET_ASISTENCIA` con código de turno (ej. T-042).

### Dependencias y CPM
- **Tipo:** Ruta Crítica (CPM)
- **Bloqueado por:** [MIA-02] Worker Batch BullMQ
- **Bloquea a:** [CIT-03] Turnero Digital
- **Esfuerzo:** 5 Horas

### Criterios de Aceptación
- [ ] Cita pasa a `En_Sala_Espera` y genera ticket visible sin recargar la página.
- [ ] Integración con teclado numérico para tótem de auto-atención."""
                    },
                    {
                        "title": "[CIT-02] Fullstack: Check-in Virtual para Telemedicina (Meet / Llamada)",
                        "labels": ["parallel", "fullstack", "modulo-6"],
                        "body": """### Descripción
Sala de espera online en el portal del paciente. Botón "Entrar a Sala Virtual" activo 15 minutos antes. Actualiza el estado a `En_Sala_Virtual` para evitar falsos No-Shows.

### Dependencias y CPM
- **Tipo:** Paralelo (Simultáneo a CIT-01)
- **Bloqueado por:** [MIA-02] Worker Batch BullMQ
- **Bloquea a:** [CIT-03] Turnero Digital
- **Esfuerzo:** 5 Horas

### Criterios de Aceptación
- [ ] Al presionar el botón, el médico visualiza en su agenda que el paciente está conectado en la sala virtual.
- [ ] Enlace de Meet seguro generado de forma dinámica."""
                    },
                    {
                        "title": "[CIT-03] Fullstack: Turnero Digital en TV + Notificación Push Móvil",
                        "labels": ["critical-path", "fullstack", "modulo-6"],
                        "body": """### Descripción
Pantalla pública de TV para sala de espera que muestra en tiempo real el turno llamado, consultorio y sonido de alerta. Disparo concurrente de notificación push al móvil del paciente.

### Dependencias y CPM
- **Tipo:** Ruta Crítica (CPM)
- **Bloqueado por:** [CIT-01] Admisión Presencial, [CIT-02] Check-in Virtual
- **Bloquea a:** [CIT-04] Protocolo de Llamado en Consultorio
- **Esfuerzo:** 6 Horas

### Criterios de Aceptación
- [ ] Actualización mediante WebSockets en < 1 segundo al presionar el llamado en consultorio.
- [ ] Alerta auditiva en pantalla de sala y vibración/push en el móvil del paciente."""
                    },
                    {
                        "title": "[CIT-04] Fullstack: Protocolo de 2 Llamados, Rezagados, Recetas PDF e Interconsultas",
                        "labels": ["critical-path", "fullstack", "modulo-6"],
                        "body": """### Descripción
Panel de atención médica. Botón de llamado (1er y 2do llamado a los 3 min). Si no entra, pasa a `Rezagado`. Formulario de diagnóstico CIE-10, emisión de PDF de receta y generación de `INTERCONSULTA` a especialistas.

### Dependencias y CPM
- **Tipo:** Ruta Crítica (CPM)
- **Bloqueado por:** [CIT-03] Turnero Digital, [MED-03] Panel Médico
- **Bloquea a:** [CIT-05] Worker Cierre de Turno
- **Esfuerzo:** 7 Horas

### Criterios de Aceptación
- [ ] Si un rezagado entra más tarde, solo consume los minutos restantes de su bloque original.
- [ ] Generación de PDF con firma/CMP del médico e interconsulta vinculada en BD."""
                    },
                    {
                        "title": "[CIT-05] Backend: Worker de Cierre de Turno de Consultorio y Liquidación de No-Shows",
                        "labels": ["critical-path", "backend", "modulo-6"],
                        "body": """### Descripción
Cron/Worker que corre al finalizar la franja del consultorio (ej. 14:00 y 20:00). Revisa citas en `Programada`, `Confirmada` o `Rezagado` sin atención presencial/virtual, transiciona a `No_Show` e incrementa `+1` a `PACIENTE.contador_faltas`.

### Dependencias y CPM
- **Tipo:** Dependiente (Cierre de ciclo operativo)
- **Bloqueado por:** [CIT-04] Protocolo de Llamado
- **Bloquea a:** Ninguno
- **Esfuerzo:** 5 Horas

### Criterios de Aceptación
- [ ] Al concluir la jornada, todas las citas no atendidas quedan auditadas en estado `No_Show`.
- [ ] Si el paciente acumula 2 faltas injustificadas, se activa la suspensión temporal de reserva por 30 días."""
                    }
                ]
            }
        ]
    }
]

def run_cmd(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result

def setup_labels():
    print("Configurando labels...")
    for label in LABELS:
        cmd = f'gh label create "{label["name"]}" --color "{label["color"]}" --description "{label["description"]}" --force -R {REPO}'
        run_cmd(cmd)
    print("Labels listas.")

def get_or_create_milestone(title, description):
    res = run_cmd(f'gh api repos/{REPO}/milestones')
    if res.returncode == 0:
        try:
            milestones = json.loads(res.stdout)
            for m in milestones:
                if m["title"] == title:
                    return m["number"]
        except Exception:
            pass

    # Crear milestone
    payload = json.dumps({"title": title, "description": description})
    cmd = f"gh api repos/{REPO}/milestones --input - -X POST"
    create_res = subprocess.run(cmd, shell=True, input=payload, text=True, capture_output=True)
    if create_res.returncode == 0:
        data = json.loads(create_res.stdout)
        return data["number"]
    else:
        print(f"Error creando milestone {title}: {create_res.stderr}")
        return None

def main():
    setup_labels()
    
    total_issues = 0
    created_issues = 0
    
    for mod in DATA:
        print(f"\n==========================================")
        print(f"PROCESANDO: {mod['modulo']}")
        print(f"==========================================")
        for ms in mod["milestones"]:
            print(f"\n--- Milestone: {ms['title']} ---")
            ms_number = get_or_create_milestone(ms["title"], ms["description"])
            if not ms_number:
                print(f"No se pudo obtener/crear el milestone {ms['title']}, saltando...")
                continue
            
            for issue in ms["issues"]:
                total_issues += 1
                labels_arg = " ".join([f'--label "{l}"' for l in issue["labels"]])
                
                # Crear issue
                cmd = [
                    "gh", "issue", "create",
                    "-R", REPO,
                    "--title", issue["title"],
                    "--body", issue["body"],
                    "--milestone", ms["title"]
                ]
                for l in issue["labels"]:
                    cmd.extend(["--label", l])
                
                print(f"Creando Issue: {issue['title']}...")
                res = subprocess.run(cmd, capture_output=True, text=True)
                if res.returncode == 0:
                    created_issues += 1
                    print(f"  ✓ Creada: {res.stdout.strip()}")
                else:
                    print(f"  ✗ Error creando issue: {res.stderr.strip()}")
                time.sleep(1) # Rate limit friendly

    print(f"\n\nFINALIZADO: {created_issues}/{total_issues} issues creadas con éxito.")

if __name__ == "__main__":
    main()
