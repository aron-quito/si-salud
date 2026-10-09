# Backlog Técnico de Tareas (Jira Ready)

Este documento contiene el desglose técnico de las Historias de Usuario (HU) en tareas granulares orientadas a la acción. Cada tabla representa un "Ticket" listo para ser importado o copiado a tableros ágiles como Jira o Trello.

---

## Módulo: Gestión de Citas y Triaje

### Historia de Usuario: HU-01 (Formulario de Triaje y Captura)

| Campo | Detalle |
| :--- | :--- |
| **Título** | Desarrollar interfaz de formulario de triaje (Frontend) |
| **Cómo** | Crear un componente en Next.js con React Hook Form y Zod para validación. Consumirá el estado global del usuario y recogerá: síntomas (text), modalidad (enum) y preferencia horaria. |
| **Checklist** | - [ ] Validar que síntomas tenga al menos 20 caracteres.<br>- [ ] Diseño responsivo (Mobile First).<br>- [ ] Test unitario de renderizado. |
| **Esfuerzo** | 4 Horas |
| **Asignado a** | Frontend Developer |

| Campo | Detalle |
| :--- | :--- |
| **Título** | Crear endpoint POST de Triaje y conexión NLP (Backend) |
| **Cómo** | Crear un Route Handler en Next.js (`/api/triaje/solicitud`). Recibir el body validado, conectarse mediante SDK a la API del LLM, inyectar el prompt de triaje y extraer el `score_urgencia` del JSON resultante para guardar todo en BD vía Prisma. |
| **Checklist** | - [ ] Guardar en tabla `SOLICITUD_TRIAJE`.<br>- [ ] Manejo de errores (Timeout de IA).<br>- [ ] Mock test del SDK de IA. |
| **Esfuerzo** | 6 Horas |
| **Asignado a** | Backend Developer |

---

## Módulo: Motor de Lógica de Negocio (IA)

### Historia de Usuario: HU-02 (Procesamiento Batch Medianoche)

| Campo | Detalle |
| :--- | :--- |
| **Título** | Implementar Cron Job con BullMQ para procesamiento batch |
| **Cómo** | Levantar una cola `agendaQueue` en BullMQ apoyada en Redis. Configurar un Cron worker que dispare el trabajo exactamente a las 00:00 (UTC-5), el cual extraerá todas las solicitudes "Pendientes" de Prisma, ordenándolas por `score_urgencia` (DESC). |
| **Checklist** | - [ ] Levantar instancia local de Redis (Docker).<br>- [ ] Cola programada no bloqueante.<br>- [ ] Logs de inicio y fin de procesamiento. |
| **Esfuerzo** | 5 Horas |
| **Asignado a** | Backend / DevOps |

| Campo | Detalle |
| :--- | :--- |
| **Título** | Desarrollar algoritmo Smart Slotting (Motor de Agendamiento) |
| **Cómo** | Script core: Iterar el array ordenado de solicitudes. Para cada una, buscar en `BLOQUE_HORARIO` del médico/especialidad solicitada un bloque `Libre` que calce. Aplicar Bloqueo Optimista (cambiar estado a `Ocupado`). Generar registro en tabla `CITA`. |
| **Checklist** | - [ ] Transacción ACID con Prisma (`$transaction`).<br>- [ ] Evitar Race Conditions.<br>- [ ] Enviar evento de notificación tras confirmación. |
| **Esfuerzo** | 8 Horas |
| **Asignado a** | Backend Developer |

---

## Módulo: Lista de Espera y Prioridades

### Historia de Usuario: HU-04 (Cancelación y Lista de Espera)

| Campo | Detalle |
| :--- | :--- |
| **Título** | Crear endpoint de cancelación de cita |
| **Cómo** | Endpoint `POST /api/citas/cancelar` que reciba `citaId` y justificación. Validar que el paciente sea dueño de la cita. Actualizar el `BLOQUE_HORARIO` a `Libre` y disparar evento asíncrono para notificar a la Lista de Espera. |
| **Checklist** | - [ ] Validar token JWT.<br>- [ ] Cambiar estado de cita a `Cancelada`.<br>- [ ] Disparar evento de liberación (`eventEmitter` o BullMQ). |
| **Esfuerzo** | 4 Horas |
| **Asignado a** | Backend Developer |

| Campo | Detalle |
| :--- | :--- |
| **Título** | Desarrollar trigger reactivo de cacería de cupos |
| **Cómo** | Al recibir el evento de liberación, hacer query en `LISTA_ESPERA` filtrando por especialidad y limitando a los 5 pacientes con mayor prioridad. Llamar a servicio de Notificaciones (Email/SMS). Crear endpoint de "Reclamo Optimista". |
| **Checklist** | - [ ] Envío real de correos (Resend/SendGrid).<br>- [ ] Lógica First-Come, First-Served con `$transaction`. |
| **Esfuerzo** | 6 Horas |
| **Asignado a** | Backend Developer |

---

## Módulo: Directorio y Staff Médico

### Historia de Usuario: HU-05 (Panel Médico e Historia Clínica)

| Campo | Detalle |
| :--- | :--- |
| **Título** | Maquetar Dashboard del Médico (Agenda y Resumen) |
| **Cómo** | Crear interfaz en React (Server Components para carga inicial de la agenda diaria). Usar Shadcn UI Calendar para visualización. Tarjetas de resumen para visualizar el "Score de Urgencia" de cada paciente agendado. |
| **Checklist** | - [ ] Vista diaria/semanal.<br>- [ ] Componente Modal de Historia Clínica.<br>- [ ] Conexión a API. |
| **Esfuerzo** | 5 Horas |
| **Asignado a** | Frontend Developer |

| Campo | Detalle |
| :--- | :--- |
| **Título** | Implementar generación de recetas médicas (PDF) |
| **Cómo** | Usar librería `pdfkit` o `puppeteer` en un endpoint protegido. Recibir JSON con diagnóstico y fármacos, compilar plantilla HTML/CSS interna, generar buffer PDF y retornarlo al cliente para descarga directa. |
| **Checklist** | - [ ] Plantilla con membrete de clínica.<br>- [ ] Peso del PDF optimizado.<br>- [ ] Firma digital mockeada. |
| **Esfuerzo** | 6 Horas |
| **Asignado a** | Backend Developer |

---

## Módulo: Administración y Catálogos

### Historia de Usuario: HU-06 y HU-09 (Módulo Recepción y Validación Pagos)

| Campo | Detalle |
| :--- | :--- |
| **Título** | Diseñar pantalla de Recepción y Búsqueda |
| **Cómo** | Interfaz tipo "POS" o Panel administrativo. Campo de búsqueda rápida con debounce que consulte la API por DNI o código. Tabla de resultados mostrando estado de Cita (Pagar / Check-in). |
| **Checklist** | - [ ] Búsqueda reactiva sin recargar.<br>- [ ] Filtro rápido: "Solo citas de hoy". |
| **Esfuerzo** | 4 Horas |
| **Asignado a** | Frontend Developer |

| Campo | Detalle |
| :--- | :--- |
| **Título** | Integrar subida y auditoría de Vouchers (AWS S3) |
| **Cómo** | Crear flujo presigned-url para AWS S3 (o almacenamiento directo temporal). El paciente sube la foto, el endpoint guarda la URL en `PAGO_VOUCHER`. El endpoint del Cajero aprueba el voucher y cambia la Cita a "Pagada". |
| **Checklist** | - [ ] Restringir tamaño y formato de imagen (JPEG/PNG, Max 2MB).<br>- [ ] Actualización relacional en cascada. |
| **Esfuerzo** | 7 Horas |
| **Asignado a** | Fullstack Developer |

| Campo | Detalle |
| :--- | :--- |
| **Título** | Implementar Generación de Ticket de Asistencia |
| **Cómo** | Al hacer click en "Registrar Asistencia", insertar registro en `TICKET_ASISTENCIA`. Retornar un código alfanumérico corto (Ej. C-14) y mandar señal (WebSocket) a una posible pantalla pública de la sala de espera. |
| **Checklist** | - [ ] Relación correcta en Prisma con Cita ID.<br>- [ ] Generación de código de turno único en el día. |
| **Esfuerzo** | 5 Horas |
| **Asignado a** | Backend Developer |

---

## Módulo: Reglas de Sistema y Seguridad

### Historia de Usuario: HU-10 (Reglas de Reprogramación y Bloqueos)

| Campo | Detalle |
| :--- | :--- |
| **Título** | Middleware de Bloqueo por Abuso de Reprogramación |
| **Cómo** | En el controlador de Reprogramar Cita, antes de alterar bloques, realizar un `count()` en `HISTORIAL_REPROGRAMACION` para esa cita y paciente. Si `count >= 3`, actualizar la columna `estado` en `USUARIO` a `Bloqueado` y retornar HTTP 403. |
| **Checklist** | - [ ] Condicionales de bypass para Admins.<br>- [ ] Registro exitoso en `HISTORIAL` si está permitido. |
| **Esfuerzo** | 4 Horas |
| **Asignado a** | Backend Developer |
