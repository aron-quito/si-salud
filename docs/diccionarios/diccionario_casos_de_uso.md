# Diccionario de Casos de Uso: Sistema SI-SALUD

Este documento detalla exhaustivamente las acciones que pueden realizar los distintos actores dentro de los 8 módulos del sistema SI-SALUD, mapeando directamente los diagramas de casos de uso (PlantUML).

---

## Actores del Sistema

| Actor | Descripción |
| :--- | :--- |
| **Paciente** | Usuario final que busca atención médica, autogestiona sus citas y su perfil. |
| **Médico** | Profesional de la salud que atiende las citas y gestiona su horario. |
| **Admin** | Administrador de la plataforma, gestiona catálogos, sedes y bloqueos manuales. |
| **Recepción / Caja** | Personal de la clínica que confirma asistencia física y aprueba pagos (Vouchers). |
| **Sistema / IA** | Actor automatizado (Motor "Smart Slotting" y Algoritmo NLP) que opera en segundo plano y medianoche. |
| **Público General**| Visitante no autenticado que navega por la Landing Page y directorio médico. |

---

## Módulo 1: Portal y Autenticación
**Descripción General:** Este módulo controla la capa de acceso y seguridad del sistema. Administra cómo los diferentes actores ingresan a sus respectivos perfiles, asegurando que las cuentas críticas tengan autenticación de doble factor y permitiendo a los pacientes recuperar accesos perdidos sin intervención administrativa.

| Caso de Uso | Actor(es) Principal(es) | Descripción de la Interacción |
| :--- | :--- | :--- |
| **Mostrar portal público** | Todos | Acceso a la *Landing Page*, vista de información clínica general. |
| **Iniciar sesión** | Paciente, Médico, Admin | Ingreso de credenciales. |
| **Recuperar cuenta** | Paciente, Médico, Admin | Flujo de "Olvidé mi contraseña" vía correo electrónico. |
| **Aplicar 2FA** | Paciente, Médico, Admin | Validación de doble factor (SMS/Email) al loguearse para seguridad de datos de salud. |
| **Personalizar cuenta** | Paciente | Configuración de preferencias (fotos, notificaciones). |

---

## Módulo 2: Pacientes
**Descripción General:** Enfocado exclusivamente en la autogestión del paciente. Permite a los usuarios llevar el control de su propia información clínica, modificar datos de contacto que son vitales para las notificaciones y tener un panorama centralizado de su historial y documentos médicos sin tener que llamar a la clínica.

| Caso de Uso | Actor(es) Principal(es) | Descripción de la Interacción |
| :--- | :--- | :--- |
| **Registrar paciente** | Paciente | Proceso de alta (Onboarding) validando DNI y Edad. |
| **Gestionar perfil** | Paciente | Modificación de datos de contacto (teléfono) o seguros médicos. |
| **Mostrar dashboard** | Paciente | Vista principal logueada: resumen de próximas citas y notificaciones urgentes. |
| **Descargar documentos**| Paciente | Exportación de recetas médicas, tickets y comprobantes de pago en PDF. |
| **Ver historial citas** | Paciente | Lista de atenciones pasadas, canceladas y reprogramadas con sus estados. |

---

## Módulo 3: Directorio y Staff Médico
**Descripción General:** Constituye el núcleo de la oferta de servicios de salud. Para los pacientes, es la vitrina donde buscan a los especialistas; para los médicos, es el panel donde revisan sus turnos de trabajo y emiten indicaciones post-consulta. La administración centraliza aquí el alta y baja del personal de salud.

| Caso de Uso | Actor(es) Principal(es) | Descripción de la Interacción |
| :--- | :--- | :--- |
| **CRUD para médicos** | Admin | Alta, baja y edición de la nómina médica. Incluye la asignación de especialidades y jerarquías. |
| **Búsqueda y Filtros** | Paciente, Público | Búsqueda interactiva por nombre del doctor, especialidad, sede y disponibilidad en tiempo real. |
| **Mostrar Staff** | Paciente, Público | Visualización de la ficha pública de un médico (CV, jerarquía, áreas de experiencia). |
| **Mostrar agenda** | Médico | Visualización del calendario personal (diaria/semanal) con sus bloques ocupados. |
| **Restringir atención** | Sistema | Bloqueo automático de la agenda según políticas de feriados u horas de descanso. |
| **Emitir recetas** | Médico | Formulario (mock) para emitir una orden médica o receta tras finalizar la consulta clínica. |

---

## Módulo 4: Administración y Catálogos
**Descripción General:** Es el panel de control maestro. Permite a los directores médicos o administradores configurar las reglas globales (sedes, políticas, bloqueos de usuarios maliciosos) e intervenir manualmente la lógica del sistema para casos excepcionales (como forzar citas de extrema urgencia pasando por alto la bolsa).

| Caso de Uso | Actor(es) Principal(es) | Descripción de la Interacción |
| :--- | :--- | :--- |
| **CRUD Sedes/Consult.** | Admin | Mantenimiento del catálogo físico e infraestructura de la clínica hospitalaria. |
| **Consultas emergentes** | Admin | Forzar la apertura de un espacio de tiempo (slot) ignorando las reglas paramétricas de la IA. |
| **Límite reprogramaciones**| Admin | Configuración global (Ej. "Máximo 3 cambios por cita antes de bloqueo de cuenta"). |
| **Dashboard Admin** | Admin | Visualización de métricas de ocupación, cancelaciones y cuellos de botella estadísticos. |
| **Forzar asignaciones** | Admin | Mover un paciente a una cita directamente de forma manual (bypass de la Bolsa). |
| **Aprobar excepciones** | Admin | Desbloquear pacientes manualmente luego de haber sido sancionados por exceso de cambios. |

---

## Módulo 5: Motor de Lógica de Negocio (IA)
**Descripción General:** Es el "cerebro" en la sombra del sistema. No tiene interfaz gráfica propia, sino que procesa grandes volúmenes de datos mediante algoritmos (NLP e IA) para asignar citas basándose en la gravedad médica, las limitantes de edad de las especialidades y la optimización extrema del espacio (Smart Slotting).

| Caso de Uso | Actor(es) Principal(es) | Descripción de la Interacción |
| :--- | :--- | :--- |
| **Detectar urgencias** | Sistema | La IA lee el texto (NLP) del triaje y asigna un Score de Urgencia. (Extiende a Asignar Consultorios). |
| **Asignar consultorios** | Sistema | Algoritmo principal core. Ejecuta validaciones críticas en masa durante la noche (cron job). |
| **Validar edad** | Sistema | Verifica si la fecha de nacimiento cumple con las restricciones de la especialidad (Ej. Pediatría). |
| **Validar formularios** | Sistema | Comprueba que los campos médicos mínimos estén completos para no entorpecer al doctor. |
| **Prevenir solapamiento** | Sistema | Transacción ACID que garantiza que no se asigne el mismo consultorio a dos personas a la vez (Bloqueo Optimista). |

---

## Módulo 6: Horarios y Disponibilidad
**Descripción General:** Gobierna la capa temporal de la clínica. Define los fragmentos de tiempo (slots) que el motor inteligente puede utilizar y administra las políticas que dictan cuánto tiempo antes un paciente puede cancelar para que otro paciente tenga tiempo de reacción para tomar su cupo liberado.

| Caso de Uso | Actor(es) Principal(es) | Descripción de la Interacción |
| :--- | :--- | :--- |
| **Creación Slot tiempo** | Admin, Sistema | Generación de Bloques de Horario base (Ej. fragmentar de 08:00 a 14:00 en intervalos de 15 minutos). |
| **Políticas de reserva** | Sistema | Lógica paramétrica de cuánto tiempo antes se puede reservar o cancelar una cita. |
| **Sugerir alternativas** | Sistema | Cuando no hay cupo exacto solicitado, el motor ofrece los 3 "slots" más cercanos disponibles. |
| **Modificar disponib.** | Admin | Pausa manual temporal de la agenda de un médico por vacaciones, incapacidad o contingencia. |

---

## Módulo 7: Gestión de Citas
**Descripción General:** Abarca todo el ciclo de vida de una cita formal: desde que el paciente redacta sus síntomas iniciales, hasta que la reserva pasa a estado "Pagada", y culminando con el momento físico en el que la Recepcionista valida la llegada del paciente y emite el ticket físico para la consulta.

| Caso de Uso | Actor(es) Principal(es) | Descripción de la Interacción |
| :--- | :--- | :--- |
| **Realizar formulario** | Paciente | Llenado asíncrono de triaje/malestar. Origina la generación de un ticket temporal. |
| **Generar ticket temp.**| Sistema | Reserva en caché (pre-confirmada) que espera la validación de pago o cruce con IA. |
| **Confirmar cita** | Sistema | Confirmación formal asíncrona; cambia estado de la cita a 'Programada/Pagada'. |
| **Cancelar cita** | Paciente | Dar de baja una reserva (libera el slot y dispara triggers hacia la Lista de Espera). |
| **Reprogramar cita** | Paciente | Modificar la fecha. Evalúa el Historial de Reprogramaciones (y si excede el límite bloquea la cuenta). |
| **Registrar asistencia** | Recepción | El paciente llega físicamente al establecimiento y se emite su `Ticket de Asistencia` para la sala de espera. |

---

## Módulo 8: Lista de Espera y Prioridades
**Descripción General:** El componente reactivo para optimizar la ocupación de consultorios (evitar "no-shows" o vacíos). Si un médico está lleno, los pacientes esperan en una cola virtual, y ante una cancelación, este módulo prioriza de manera automatizada quién debe ser el primero en recibir el cupo liberado.

| Caso de Uso | Actor(es) Principal(es) | Descripción de la Interacción |
| :--- | :--- | :--- |
| **Ingresar a la lista** | Paciente | Subscribirse a notificaciones de alerta para cazar cancelaciones de un médico lleno. |
| **Clasificar prioridad** | Sistema | La IA ordena a quién avisarle primero basándose en el score de urgencia del triaje y tiempo de espera. |
| **Asignar desde lista** | Sistema | Cruce reactivo automático cuando un slot queda libre; ofrece la cita al primer paciente de la cola. |
| **Dar de baja consulta** | Admin | Remover a un usuario inactivo o erróneo de la lista de espera virtual. |
| **Ordenar cola pacientes**| Sistema | Proceso continuo de reacomodo del array/cola de la lista de espera (Redis / BullMQ). |
