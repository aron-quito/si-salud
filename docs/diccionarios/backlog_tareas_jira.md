# Backlog Técnico de Tareas (Jira Ready)

Este documento contiene el desglose técnico de **las 10 Historias de Usuario (HU)** y de las tareas fundacionales de **Infraestructura**, resultando en tickets orientados a la acción. Cada tabla representa un "Ticket" listo para ser importado o copiado a tableros ágiles como Jira o Trello.

---

## Módulo 0: Infraestructura y Setup Core (Sprint 0)

| Título | Cómo | Checklist | Esfuerzo | Asignado a |
| :--- | :--- | :--- | :--- | :--- |
| **[SETUP-01] Infra: Inicializar proyecto Next.js y UI** | Crear repo. Configurar Next.js (App Router), TailwindCSS y Shadcn UI. Crear layout maestro y sistema de rutas protegido/público. | - Repositorio en GitHub<br>- Linting y Prettier<br>- Shadcn configurado | 4 Hrs | Frontend Dev |
| **[SETUP-02] Infra: Levantar contenedores Docker** | Crear `docker-compose.yml` para levantar PostgreSQL (BD) y Redis (para colas BullMQ). | - Puertos mapeados (5432, 6379)<br>- Volumenes persistentes | 3 Hrs | DevOps / Backend |
| **[SETUP-03] BD: Modelado Prisma Schema y Migraciones** | Traducir el Diccionario de Datos (16 tablas) a `schema.prisma`. Ejecutar la primera migración `npx prisma migrate dev`. | - Llaves foráneas exactas<br>- Seed inicial de roles/Admin | 6 Hrs | Backend Dev |
| **[SETUP-04] Sec: Configurar Autenticación (NextAuth)** | Integrar NextAuth.js (Auth.js) para Login por Credenciales. Crear middleware de protección de rutas basado en roles (Admin, Medico, Paciente). | - Sesión JWT segura<br>- Middleware funcionando | 6 Hrs | Fullstack Dev |

---

## Módulo: Gestión de Citas y Triaje

### HU-01: Formulario de Triaje y Captura de Preferencias
| Título | Cómo | Checklist | Esfuerzo | Asignado a |
| :--- | :--- | :--- | :--- | :--- |
| **[HU-01] Frontend: Desarrollar interfaz de triaje** | Crear componente Next.js con React Hook Form. Consumirá el estado del paciente y recogerá: síntomas, modalidad y preferencia horaria. | - Validar síntomas > 20 chars<br>- Diseño responsivo | 4 Hrs | Frontend Dev |
| **[HU-01] Backend: Endpoint POST Triaje y NLP** | Route Handler `/api/triaje/solicitud`. Recibir body, conectar a API de IA, extraer `score_urgencia` y guardar en BD. | - Guardar en `SOLICITUD_TRIAJE`<br>- Manejo de Timeout IA | 6 Hrs | Backend Dev |

### HU-03: Check-in de Confirmación (2 días antes)
| Título | Cómo | Checklist | Esfuerzo | Asignado a |
| :--- | :--- | :--- | :--- | :--- |
| **[HU-03] Backend: Cron Job de Recordatorios 48h** | Script que consulte citas con 48h de proximidad. Generar token único JWT en enlace. Enviar notificación al paciente. | - Query eficiente<br>- Uso de Resend/SendGrid | 5 Hrs | Backend Dev |
| **[HU-03] Frontend: Vista de Confirmación Express** | Landing page ligera que reciba el token JWT en URL y tenga botones grandes: "Sí asistiré" / "No podré ir (Cancelar)". | - Validación de token expirado<br>- Endpoint de resolución | 3 Hrs | Frontend Dev |

---

## Módulo: Motor de Lógica de Negocio (IA)

### HU-02: Procesamiento Batch a Medianoche
| Título | Cómo | Checklist | Esfuerzo | Asignado a |
| :--- | :--- | :--- | :--- | :--- |
| **[HU-02] Infra: Implementar Cron Job con BullMQ** | Levantar cola en BullMQ/Redis. Configurar worker a las 00:00 que extraiga solicitudes "Pendientes" y las ordene por Score. | - Redis en Docker/Upstash<br>- Cola no bloqueante | 5 Hrs | DevOps / Backend |
| **[HU-02] Backend: Algoritmo Smart Slotting** | Iterar solicitudes ordenadas. Buscar `BLOQUE_HORARIO` libre compatible (edad/especialidad). Aplicar Bloqueo Optimista y generar `CITA`. | - Transacción ACID<br>- Evitar colisiones | 8 Hrs | Backend Dev |

---

## Módulo: Lista de Espera y Prioridades

### HU-04: Cancelación Justificada y Lista de Espera
| Título | Cómo | Checklist | Esfuerzo | Asignado a |
| :--- | :--- | :--- | :--- | :--- |
| **[HU-04] Backend: Endpoint de Cancelación** | POST `/api/citas/cancelar` con justificación. Actualizar bloque a Libre. Disparar evento de liberación. | - Validar dueño cita<br>- Disparador de eventos | 4 Hrs | Backend Dev |
| **[HU-04] Backend: Trigger reactivo (Cacería Cupos)** | Escuchar evento liberación. Query a `LISTA_ESPERA` por prioridad. Enviar Push/Email masivo a los 5 primeros compatibles. | - Envíos asíncronos<br>- Lógica First-Come | 6 Hrs | Backend Dev |

---

## Módulo: Directorio y Staff Médico

### HU-05: Panel del Médico e Historia Clínica
| Título | Cómo | Checklist | Esfuerzo | Asignado a |
| :--- | :--- | :--- | :--- | :--- |
| **[HU-05] Frontend: Maquetar Dashboard del Médico** | Interfaz React (SSR). Shadcn UI Calendar para agenda. Tarjetas con Score de Urgencia y acceso a Historia Médica. | - Vista diaria/semanal<br>- Conexión API | 5 Hrs | Frontend Dev |
| **[HU-05] Backend: Generación de recetas médicas PDF** | Usar `pdfkit` o `puppeteer`. Recibir JSON de receta, compilar HTML, generar buffer PDF y retornar para descarga. | - Membrete de clínica<br>- Peso optimizado | 6 Hrs | Backend Dev |

### HU-07: Directorio Médico Público
| Título | Cómo | Checklist | Esfuerzo | Asignado a |
| :--- | :--- | :--- | :--- | :--- |
| **[HU-07] Frontend: Vista SSR Directorio (SEO)** | Página Next.js Server-Side Rendered. Lista de médicos con perfiles, especialidad. Input de búsqueda en tiempo real. | - Meta tags SEO<br>- Búsqueda reactiva (Debounce) | 5 Hrs | Frontend Dev |

---

## Módulo: Administración y Catálogos

### HU-08: Gestión de Sedes, Aseguradoras y Bloques
| Título | Cómo | Checklist | Esfuerzo | Asignado a |
| :--- | :--- | :--- | :--- | :--- |
| **[HU-08] Frontend: CRUD de Catálogos Maestros** | Tablas de datos en Admin Panel para Sedes, Aseguradoras y Especialidades. Formularios de creación/edición. | - Validaciones Zod<br>- Data tables con paginación | 6 Hrs | Frontend Dev |
| **[HU-08] Backend: Generador masivo de Bloques Horarios**| Script que permita a un Admin seleccionar un Médico, días y rango (ej 08:00 a 14:00) y genere automáticamente todos los records `BLOQUE_HORARIO`. | - Bulk inserts Prisma<br>- Validar solapamientos previos| 5 Hrs | Backend Dev |

### HU-06: Facturación y Validación de Pagos
| Título | Cómo | Checklist | Esfuerzo | Asignado a |
| :--- | :--- | :--- | :--- | :--- |
| **[HU-06] Fullstack: Integrar subida Vouchers (AWS S3)** | Flujo presigned-url a S3. Guardar URL en `PAGO_VOUCHER`. Endpoint de Cajero que cambie estado a "Aprobado". | - Restringir tamaño img<br>- Interfaz Cajero aprobación | 7 Hrs | Fullstack Dev |

### HU-09: Recepción y Registro de Asistencia
| Título | Cómo | Checklist | Esfuerzo | Asignado a |
| :--- | :--- | :--- | :--- | :--- |
| **[HU-09] Frontend: Pantalla de Recepción (POS)** | Interfaz rápida tipo POS. Búsqueda por DNI o código. Botón de un click para Check-in físico. | - Sin recargas de página<br>- Alertas de éxito sonoras | 4 Hrs | Frontend Dev |
| **[HU-09] Backend: Generación de Ticket Asistencia** | Endpoint `POST /api/asistencia`. Crear `TICKET_ASISTENCIA`, generar código alfanumérico corto y disparar socket. | - Código corto único<br>- Relación con Cita | 4 Hrs | Backend Dev |

---

## Módulo: Reglas de Sistema y Seguridad

### HU-10: Reglas de Reprogramación y Bloqueos
| Título | Cómo | Checklist | Esfuerzo | Asignado a |
| :--- | :--- | :--- | :--- | :--- |
| **[HU-10] Backend: Middleware Anti-Abuso (Bloqueos)** | En controlador Reprogramar Cita: `count()` en `HISTORIAL_REPROGRAMACION`. Si `>= 3`, actualizar `USUARIO` a Bloqueado y retornar Error 403. | - Bloqueo de cuenta<br>- Historial auditado | 4 Hrs | Backend Dev |
