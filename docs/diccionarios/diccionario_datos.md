# Diccionario de Datos: Sistema SI-SALUD

Este documento detalla la estructura y propósito de las entidades presentes en el **Diagrama Entidad-Relación (DER)** de la plataforma SI-SALUD. Sirve como base para la construcción de la base de datos (PostgreSQL/Prisma).

---

## Entidades y Atributos

### 1. `USUARIO`
**Descripción:** Almacena la información de acceso principal del sistema. Maneja la autenticación y autorización (roles) para toda la plataforma.

| Atributo | Tipo de Dato | Tipo de Llave | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Entero (int) | PK | Identificador único del usuario. |
| `email` | Cadena (string) | Única | Correo electrónico usado para iniciar sesión. |
| `password` | Cadena (string) | - | Hash seguro de la contraseña. |
| `rol` | Enum (string) | - | Define el nivel de acceso: `Paciente`, `Medico`, `Cajero`, `Admin`. |
| `estado` | Enum (string) | - | Condición del usuario frente a penalizaciones: `Activo`, `Bloqueado`. |

### 2. `PACIENTE`
**Descripción:** Perfil clínico y personal de un usuario con rol 'Paciente'.

| Atributo | Tipo de Dato | Tipo de Llave | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Entero (int) | PK | Identificador único del paciente. |
| `usuario_id` | Entero (int) | FK | Relación 1:1 con la tabla `USUARIO`. |
| `dni` | Cadena (string) | Única | Documento de identidad nacional. |
| `fecha_nacimiento` | Fecha (date) | - | Utilizado para validar restricciones de edad por especialidad. |
| `telefono` | Cadena (string) | - | Número de contacto directo (SMS/WhatsApp). |

### 3. `MEDICO`
**Descripción:** Perfil profesional de un usuario con rol 'Medico'.

| Atributo | Tipo de Dato | Tipo de Llave | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Entero (int) | PK | Identificador único del médico. |
| `usuario_id` | Entero (int) | FK | Relación 1:1 con la tabla `USUARIO`. |
| `cmp` | Cadena (string) | Única | Colegio Médico del Perú u homólogo (número de colegiatura). |
| `nombres` | Cadena (string) | - | Nombres del profesional. |
| `apellidos` | Cadena (string) | - | Apellidos del profesional. |
| `jerarquia` | Cadena (string) | - | Nivel de experiencia o cargo directivo. |

### 4. `SEDE`
**Descripción:** Ubicaciones físicas de la clínica o red hospitalaria.

| Atributo | Tipo de Dato | Tipo de Llave | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Entero (int) | PK | Identificador único de la sede. |
| `nombre` | Cadena (string) | - | Nombre comercial de la sede (Ej. "Sede Central", "Sede Norte"). |
| `direccion` | Cadena (string) | - | Dirección física. |
| `activa` | Booleano | - | Flag para pausar o cerrar operaciones temporalmente en una sede. |

### 5. `CONSULTORIO`
**Descripción:** Espacios físicos dentro de una Sede donde se realizan las atenciones médicas.

| Atributo | Tipo de Dato | Tipo de Llave | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Entero (int) | PK | Identificador único del consultorio. |
| `sede_id` | Entero (int) | FK | Sede a la que pertenece el consultorio. |
| `numero_nombre` | Cadena (string) | - | Identificador visual para el paciente (Ej. "Consultorio 104A"). |
| `activo` | Booleano | - | Determina si el consultorio está en mantenimiento o habilitado. |

### 6. `ESPECIALIDAD`
**Descripción:** Áreas de la medicina ofertadas por el sistema (Pediatría, Cardiología, etc.).

| Atributo | Tipo de Dato | Tipo de Llave | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Entero (int) | PK | Identificador único de la especialidad. |
| `nombre` | Cadena (string) | - | Nombre de la especialidad. |
| `descripcion` | Cadena (string) | - | Detalles generales de los padecimientos que abarca. |
| `activa` | Booleano | - | Flag para habilitar la especialidad en el motor de agendamiento. |

### 7. `MEDICO_ESPECIALIDAD`
**Descripción:** Tabla pivote que maneja la relación N:M entre Médicos y Especialidades, dado que un médico puede tener más de una especialidad.

| Atributo | Tipo de Dato | Tipo de Llave | Descripción |
| :--- | :--- | :--- | :--- |
| `medico_id` | Entero (int) | FK | Referencia al médico. |
| `especialidad_id` | Entero (int) | FK | Referencia a la especialidad asignada. |

### 8. `TIPO_CONSULTA`
**Descripción:** Define el tipo de cita (Primera vez, Control, Procedimiento menor) y dicta la duración base que el motor de "Smart Slotting" asignará.

| Atributo | Tipo de Dato | Tipo de Llave | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Entero (int) | PK | Identificador único. |
| `nombre` | Cadena (string) | - | Nombre descriptivo del tipo (Ej: Control Post-Operación). |
| `duracion_base_minutos`| Entero (int) | - | Tiempo estándar que bloquea en el calendario (ej. 15, 30, 45 min). |
| `activo` | Booleano | - | Determina si se sigue ofreciendo este tipo de consulta. |

### 9. `ASEGURADORA`
**Descripción:** Entidades prestadoras de salud o seguros que cubren parte o el 100% de la consulta.

| Atributo | Tipo de Dato | Tipo de Llave | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Entero (int) | PK | Identificador único. |
| `nombre` | Cadena (string) | - | Nombre de la aseguradora (Ej. "Pacífico", "Mapfre", "Particular"). |
| `tipo` | Cadena (string) | - | EPS, Privado, Público, etc. |
| `activa` | Booleano | - | Habilita su selección en el formulario. |

### 10. `BLOQUE_HORARIO`
**Descripción:** Entidad core del "Smart Slotting". Representa un fragmento de tiempo asignado a un médico en un consultorio.

| Atributo | Tipo de Dato | Tipo de Llave | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Entero (int) | PK | Identificador único. |
| `medico_id` | Entero (int) | FK | Médico dueño del bloque de tiempo. |
| `consultorio_id`| Entero (int) | FK | Espacio físico reservado durante este bloque. |
| `fecha` | Fecha (date) | - | Fecha calendario. |
| `hora_inicio` | Tiempo (time) | - | Hora de apertura del bloque. |
| `hora_fin` | Tiempo (time) | - | Hora de finalización. |
| `estado` | Enum (string) | - | Estado actual: `Libre`, `Ocupado`, `Bloqueado`. |

### 11. `SOLICITUD_TRIAJE`
**Descripción:** Formularios asíncronos ingresados a la "Bolsa". Son analizados por IA para determinar urgencia antes de convertirlos en citas formales.

| Atributo | Tipo de Dato | Tipo de Llave | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Entero (int) | PK | Identificador único. |
| `paciente_id` | Entero (int) | FK | Paciente que emite la solicitud. |
| `especialidad_id`| Entero (int) | FK | Especialidad requerida por la solicitud. |
| `sintomas` | Texto (text) | - | Redacción del paciente procesable vía NLP. |
| `preferencia_horario`| Cadena (string)| - | Hint de disponibilidad del paciente ("Mañanas", "Tardes"). |
| `score_urgencia` | Entero (int) | - | Puntuación generada por la IA (ej. 1 al 10). |
| `modalidad` | Enum (string) | - | Canal: `Presencial`, `Meet`, `Llamada`. |
| `estado` | Enum (string) | - | Estado en la bolsa: `Pendiente`, `Agendado`, `Cancelado`. |

### 12. `LISTA_ESPERA`
**Descripción:** Registro de pacientes que no lograron cupo. Tienen prioridad ante cancelaciones reactivas.

| Atributo | Tipo de Dato | Tipo de Llave | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Entero (int) | PK | Identificador único. |
| `paciente_id` | Entero (int) | FK | Paciente a la espera. |
| `especialidad_id`| Entero (int) | FK | Especialidad en demanda. |
| `fecha_ingreso` | Datetime | - | Control de antigüedad (FIFO o por severidad). |
| `prioridad` | Entero (int) | - | Peso en la lista según análisis clínico previo. |
| `estado` | Enum (string) | - | `En Espera`, `Atendido` (cuando toma un cupo liberado). |

### 13. `CITA`
**Descripción:** La confirmación final. Vincula todas las entidades una vez que el motor de agendamiento cruza los datos o el usuario aparta un turno disponible.

| Atributo | Tipo de Dato | Tipo de Llave | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Entero (int) | PK | Identificador único del encuentro. |
| `paciente_id` | Entero (int) | FK | Paciente atendido. |
| `medico_id` | Entero (int) | FK | Profesional tratante. |
| `bloque_horario_id`| Entero (int)| FK | Slot consumido. |
| `tipo_consulta_id` | Entero (int) | FK | Referencia al tipo para definir el tamaño del bloque. |
| `solicitud_id` | Entero (int) | FK | (Opcional) Referencia a la Bolsa de Triaje que la originó. |
| `aseguradora_id` | Entero (int) | FK | Responsable financiero. |
| `estado` | Enum (string) | - | `Programada`, `Pagada`, `Atendida`, `Cancelada`, `Reprogramada`. |

### 14. `HISTORIAL_REPROGRAMACION`
**Descripción:** Auditoría de cada movimiento o cambio de una cita. Activa el trigger de castigo/bloqueo de cuentas.

| Atributo | Tipo de Dato | Tipo de Llave | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Entero (int) | PK | Identificador único. |
| `cita_id` | Entero (int) | FK | Cita original que sufrió el cambio. |
| `motivo_cambio` | Cadena (string) | - | Razón esgrimida por el paciente o admin. |
| `fecha_transaccion`| Datetime | - | Exactitud del momento de edición. |
| `estado` | Cadena (string) | - | Válido o Justificado (Admin bypass). |

### 15. `TICKET_ASISTENCIA`
**Descripción:** Generado cuando el paciente cruza las puertas de la clínica (en el Módulo Recepción/Caja) o a través de un tótem digital.

| Atributo | Tipo de Dato | Tipo de Llave | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Entero (int) | PK | Identificador único. |
| `cita_id` | Entero (int) | FK | Cita verificada al presentarse. |
| `fecha_generacion` | Datetime | - | Hora real en la que el paciente anunció su llegada. |
| `codigo_turno` | Cadena (string) | - | Ej: "C-12" (para visualización en las pantallas de espera). |
| `estado` | Enum (string) | - | `Impreso`, `Llamado`, `Finalizado`. |

### 16. `PAGO_VOUCHER`
**Descripción:** Mecanismo de subida/verificación de pagos de la cita (e.g. transferencias, Yape/Plin o pasarelas) con flujo de auditoría manual/automática.

| Atributo | Tipo de Dato | Tipo de Llave | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Entero (int) | PK | Identificador único. |
| `cita_id` | Entero (int) | FK | Cita asociada a la deuda. |
| `url_imagen` | Cadena (string) | - | Enlace a AWS S3 o bucket con la foto del voucher. |
| `monto` | Decimal | - | Valor transaccionado. |
| `estado_auditoria`| Enum (string) | - | Recepción/Admin evalúa: `Pendiente`, `Aprobado`, `Rechazado`. |

---

## Conexiones y Cardinalidad (Relaciones)

Para garantizar la integridad relacional de la plataforma (ACID) y permitir el flujo cruzado de datos, las tablas principales se conectan mediante estas reglas:

| Origen | Tipo | Destino | Explicación Funcional |
| :--- | :---: | :--- | :--- |
| **USUARIO** | `1:1` | **PACIENTE** | Un usuario logueado mapea estrictamente a un perfil paciente. |
| **USUARIO** | `1:1` | **MEDICO** | Un usuario de rol médico mapea estrictamente a un perfil profesional. |
| **SEDE** | `1:N` | **CONSULTORIO** | Una clínica u hospital puede alojar múltiples habitaciones de consulta. |
| **MEDICO** | `N:M` | **ESPECIALIDAD** | Se resuelve mediante la tabla pivote `MEDICO_ESPECIALIDAD`. |
| **MEDICO** | `1:N` | **BLOQUE_HORARIO** | El médico provee su capacidad de atención como "Bloques de tiempo". |
| **CONSULTORIO** | `1:N` | **BLOQUE_HORARIO** | El bloque requiere obligatoriamente un espacio físico disponible. |
| **PACIENTE** | `1:N` | **SOLICITUD_TRIAJE** | Un paciente puede enviar múltiples síntomas/solicitudes a la bolsa a lo largo de su vida. |
| **ESPECIALIDAD**| `1:N` | **SOLICITUD_TRIAJE** | La IA enruta la solicitud hacia una especialidad destino. |
| **SOLICITUD_TRIAJE**| `1:1` | **CITA** | (Opcional) Cuando el Smart Slotting evalúa la bolsa, la convierte en un registro formal de cita. |
| **BLOQUE_HORARIO**| `1:1` | **CITA** | La cita aparta y ocupa íntegramente un bloque de tiempo de la agenda. |
| **PACIENTE** | `1:N` | **CITA** | Relación histórica de atenciones o futuras agendadas. |
| **MEDICO** | `1:N` | **CITA** | Calendario formal y oficial de atenciones médicas cruzadas con pacientes. |
| **TIPO_CONSULTA**| `1:N` | **CITA** | Clasifica si es un primer contacto o seguimiento de rutina. |
| **ASEGURADORA** | `1:N` | **CITA** | Define qué póliza será reportada administrativamente. |
| **CITA** | `1:N` | **HISTORIAL_REPRO...** | Registro pormenorizado de cuántas veces el paciente ha aplazado esta cita en particular. |
| **PACIENTE** | `1:N` | **LISTA_ESPERA** | Si no consigue cupo en la CITA, queda orbitando a la espera de espacios liberados. |
| **ESPECIALIDAD**| `1:N` | **LISTA_ESPERA** | Define por qué rubro médico está esperando el paciente en la cola virtual. |
| **CITA** | `1:1` | **TICKET_ASISTENCIA**| La cita formal (digital) se convierte en un evento en vivo al llegar a recepción. |
| **CITA** | `1:1` | **PAGO_VOUCHER** | Auditoría y comprobación física de los pagos subidos por el portal. |
