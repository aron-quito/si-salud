# Casos de Uso Detallados — SI-SALUD
## Flujos Básicos y Flujos Alternativos Formales

> **Fuente:** Cada caso de uso está derivado directamente de los diagramas de secuencia
> (`secuencia.mmd`, `secuencia_reactiva.mmd`, `secuencia_reprogramacion.mmd`) y
> el `diccionario_casos_de_uso.md` del repositorio SI-SALUD.

---

## Actores del Sistema

| Actor | Descripción |
| :--- | :--- |
| **Paciente** | Usuario autenticado con rol Paciente. Agenda, cancela y reprograma sus citas. |
| **Médico** | Profesional de salud. Atiende citas y gestiona su calendario. |
| **Recepción/Caja** | Personal que valida llegada física y emite tickets. |
| **Admin** | Administrador del sistema, gestiona catálogos, bloqueos y configuraciones globales. |
| **Sistema/IA** | Actor automatizado: Motor de Agendamiento (Smart Slotting), Cron Job nocturno y Notificaciones. |

---

## CU-01: Registro y Confirmación de Cita Médica

**Actor Principal:** Paciente  
**Actores Secundarios:** Sistema/IA (Motor de Agendamiento)  
**Precondición:**
- El Paciente tiene sesión activa en el sistema (rol: Paciente).
- El Paciente tiene estado `Activo` en la tabla `USUARIO` (no bloqueado).
- Existe al menos una `SOLICITUD_TRIAJE` del Paciente en estado `Pendiente` en la bolsa.

**Disparador:** El Cron Job del sistema se activa a las 12:00 AM (medianoche) iniciando el ciclo de Smart Slotting.

---

### Flujo Básico (Happy Path)

| Paso | Actor | Acción |
| :---: | :--- | :--- |
| 1 | Paciente | Llena el formulario de triaje en el portal web indicando sus síntomas, preferencia de horario (Mañanas/Tardes) y modalidad de atención (Presencial/Meet/Llamada). |
| 2 | Sistema | El servicio de triaje recibe la petición `POST /solicitud`, valida que los campos obligatorios estén completos y que la especialidad seleccionada esté activa. |
| 3 | Sistema/IA | El texto de síntomas es enviado al módulo NLP para análisis. El algoritmo asigna un `score_urgencia` de 1 a 10 (10 = crítico). |
| 4 | Sistema | Guarda la `SOLICITUD_TRIAJE` en la base de datos con estado `Pendiente` y el score calculado. |
| 5 | Sistema | Retorna al Paciente confirmación: "Tu solicitud fue recibida. Recibirás una notificación cuando se asigne tu cita." |
| 6 | Sistema (Cron) | A las 12:00 AM, el Motor de Agendamiento se activa y consulta todas las `SOLICITUD_TRIAJE` con estado `Pendiente`. |
| 7 | Sistema | Ordena las solicitudes por `score_urgencia` descendente (mayor urgencia = mayor prioridad). |
| 8 | Sistema | Para cada solicitud, ejecuta Smart Slotting: verifica disponibilidad de `BLOQUE_HORARIO` con estado `Libre` para un médico con la especialidad requerida, validando la edad del paciente contra restricciones (ej. Pediatría: edad ≤ 18 años). |
| 9 | Sistema | Ejecuta `sp_registrar_cita_medica`: inicia `START TRANSACTION`, bloquea el bloque con `SELECT ... FOR UPDATE`, inserta en `CITA` con estado `Programada`, actualiza `BLOQUE_HORARIO` a `Ocupado`, actualiza `SOLICITUD_TRIAJE` a `Agendado`, ejecuta `COMMIT`. |
| 10 | Sistema | Dispara notificación al Paciente vía correo/SMS: "Cita asignada para el [fecha] a las [hora] con el Dr. [nombre] en [sede]". |
| 11 | Paciente | Recibe la notificación y puede ver el detalle de su cita en el dashboard personal (sección "Mis Citas"). |

**Postcondición:**
- La `CITA` existe en la base de datos con estado `Programada`.
- El `BLOQUE_HORARIO` asociado tiene estado `Ocupado`.
- La `SOLICITUD_TRIAJE` tiene estado `Agendado`.
- El Paciente recibió notificación de confirmación.

---

### Flujo Alternativo A1 — No existe bloque disponible para la especialidad

| Paso | Actor | Acción |
| :---: | :--- | :--- |
| A1.1 | Sistema | En el paso 8, el Motor no encuentra ningún `BLOQUE_HORARIO` libre con médico de la especialidad requerida. |
| A1.2 | Sistema | Agrega al Paciente automáticamente a `LISTA_ESPERA` con la especialidad correspondiente y prioridad basada en su `score_urgencia`. |
| A1.3 | Sistema | Notifica al Paciente: "No hay cupos disponibles actualmente. Fuiste agregado a la lista de espera. Te notificaremos ante cualquier cancelación." |
| A1.4 | Paciente | El flujo finaliza sin cita asignada; el paciente queda en la cola de espera. |

### Flujo Alternativo A2 — Slot ocupado por concurrencia (colisión)

| Paso | Actor | Acción |
| :---: | :--- | :--- |
| A2.1 | Sistema | En el paso 9, al intentar el `SELECT ... FOR UPDATE`, el sistema detecta que el bloque fue tomado por otra transacción concurrente (estado `Ocupado`). |
| A2.2 | Sistema | Ejecuta `ROLLBACK`. Busca el siguiente bloque disponible para el mismo médico y fecha. |
| A2.3 | Sistema | Si hay bloque alternativo: reintenta el paso 9 con el nuevo bloque. |
| A2.4 | Sistema | Si no hay alternativa: aplica el Flujo A1 (lista de espera). |

### Flujo Alternativo A3 — Paciente bloqueado

| Paso | Actor | Acción |
| :---: | :--- | :--- |
| A3.1 | Paciente | En el paso 1, intenta acceder al formulario de triaje. |
| A3.2 | Sistema | Verifica el `USUARIO.estado`. Si es `Bloqueado`, rechaza el acceso con mensaje: "Tu cuenta está suspendida. Contacta a administración." |
| A3.3 | — | El flujo termina sin registrar solicitud. |

---

## CU-02: Formulario de Triaje con Análisis de Urgencia (IA)

**Actor Principal:** Paciente  
**Actores Secundarios:** Sistema/IA (módulo NLP)  
**Precondición:**
- El Paciente tiene sesión activa y estado `Activo`.
- El sistema de IA/NLP está operativo.

**Disparador:** El Paciente selecciona "Solicitar Cita" en su dashboard y elige una especialidad.

---

### Flujo Básico (Happy Path)

| Paso | Actor | Acción |
| :---: | :--- | :--- |
| 1 | Paciente | Selecciona la especialidad médica requerida del catálogo (`ESPECIALIDAD.activa = 1`). |
| 2 | Paciente | Completa el formulario de triaje: describe síntomas en campo de texto libre, selecciona modalidad (Presencial/Meet/Llamada) y preferencia horaria. |
| 3 | Sistema | Valida que el campo `sintomas` no esté vacío y tenga al menos 20 caracteres. Valida que la especialidad seleccionada exista y esté activa. |
| 4 | Sistema | Valida la edad del Paciente contra restricciones de la especialidad (función `fn_calcular_edad`). Ej.: Pediatría requiere edad ≤ 18. |
| 5 | Sistema/IA | Envía el texto de síntomas al algoritmo NLP para análisis semántico de urgencia. |
| 6 | Sistema/IA | El algoritmo retorna un `score_urgencia` (1-10) y un resumen automatizado del motivo. |
| 7 | Sistema | Persiste la `SOLICITUD_TRIAJE` en base de datos con estado `Pendiente` y el score obtenido. |
| 8 | Sistema | Muestra al Paciente: "Solicitud recibida (Urgencia: Alta/Media/Baja). Te contactaremos pronto." |

**Postcondición:**
- La `SOLICITUD_TRIAJE` existe en BD con estado `Pendiente`.
- El `score_urgencia` está asignado y determina la prioridad de asignación en el siguiente ciclo nocturno.

---

### Flujo Alternativo A1 — Validación fallida: campos incompletos

| Paso | Actor | Acción |
| :---: | :--- | :--- |
| A1.1 | Sistema | En el paso 3, detecta que el campo `sintomas` está vacío o es demasiado corto. |
| A1.2 | Sistema | Retorna error de validación en el formulario: "Por favor describe tus síntomas con al menos 20 caracteres." |
| A1.3 | Paciente | Corrige el formulario y reintenta. El flujo regresa al paso 2. |

### Flujo Alternativo A2 — Restricción de edad para la especialidad

| Paso | Actor | Acción |
| :---: | :--- | :--- |
| A2.1 | Sistema | En el paso 4, `fn_calcular_edad` retorna edad = 25. La especialidad elegida es Pediatría (máx 18 años). |
| A2.2 | Sistema | Rechaza la solicitud y muestra: "La especialidad de Pediatría es exclusiva para pacientes de 0 a 18 años. Por favor selecciona otra especialidad." |
| A2.3 | Paciente | Selecciona una especialidad adecuada. El flujo regresa al paso 1. |

### Flujo Alternativo A3 — Fallo en el servicio de IA/NLP

| Paso | Actor | Acción |
| :---: | :--- | :--- |
| A3.1 | Sistema | En el paso 5, el módulo NLP no responde dentro del timeout de 30 segundos. |
| A3.2 | Sistema | Asigna un `score_urgencia` por defecto de 5 (prioridad media) para no bloquear al paciente. |
| A3.3 | Sistema | Registra la solicitud normalmente con score por defecto y continúa desde el paso 7. |

---

## CU-03: Cancelación de Cita y Lista de Espera Reactiva

**Actor Principal:** Paciente  
**Actores Secundarios:** Sistema (Motor Reactivo), Paciente en Lista de Espera  
**Precondición:**
- El Paciente tiene una `CITA` propia en estado `Programada` o `Pagada`.
- El Paciente tiene sesión activa y estado `Activo`.

**Disparador:** El Paciente hace clic en "Cancelar Cita" en la sección "Mis Citas" de su dashboard.

---

### Flujo Básico (Happy Path)

| Paso | Actor | Acción |
| :---: | :--- | :--- |
| 1 | Paciente | En su dashboard, selecciona la cita a cancelar y hace clic en "Cancelar". |
| 2 | Paciente | Ingresa el motivo de cancelación en el campo requerido y confirma la acción. |
| 3 | Sistema | Recibe `POST /citas/cancelar` con `cita_id` y `motivo`. |
| 4 | Sistema | Ejecuta `sp_cancelar_cita_reactiva`: actualiza `CITA.estado` a `Cancelada`. |
| 5 | Sistema | Actualiza `BLOQUE_HORARIO.estado` a `Libre` (slot recuperado). |
| 6 | Sistema | Inserta registro en `HISTORIAL_REPROGRAMACION` con el motivo, fecha y estado `Valido`. |
| 7 | Sistema | Cuenta las cancelaciones totales del Paciente en `HISTORIAL_REPROGRAMACION`. Si total ≥ 3, actualiza `USUARIO.estado` a `Bloqueado`. |
| 8 | Sistema | Consulta `LISTA_ESPERA` buscando el paciente con mayor prioridad para la misma especialidad del médico. |
| 9 | Sistema | Si hay candidato: dispara notificación push/email al paciente en lista de espera: "¡Hay un cupo disponible! Resérvalo antes que otro paciente." |
| 10 | Sistema | Notifica al Paciente cancelador: "Tu cita ha sido cancelada exitosamente." |

**Postcondición:**
- La `CITA` tiene estado `Cancelada`.
- El `BLOQUE_HORARIO` tiene estado `Libre`.
- Existe registro en `HISTORIAL_REPROGRAMACION`.
- Si corresponde: el paciente fue notificado de la disponibilidad del slot.

---

### Flujo Alternativo A1 — Cuenta bloqueada por exceso de cancelaciones

| Paso | Actor | Acción |
| :---: | :--- | :--- |
| A1.1 | Sistema | En el paso 7, el conteo de cancelaciones del Paciente alcanza o supera 3. |
| A1.2 | Sistema | Actualiza `USUARIO.estado` a `Bloqueado`. |
| A1.3 | Sistema | Notifica al Paciente: "Has excedido el número máximo de cancelaciones. Tu cuenta ha sido suspendida temporalmente. Contacta a administración para reactivarla." |

### Flujo Alternativo A2 — No hay candidatos en lista de espera

| Paso | Actor | Acción |
| :---: | :--- | :--- |
| A2.1 | Sistema | En el paso 8, la consulta a `LISTA_ESPERA` retorna 0 registros con estado `En Espera` para la especialidad. |
| A2.2 | Sistema | El slot liberado queda disponible públicamente para nuevas reservas. No se envían notificaciones reactivas. |
| A2.3 | — | El flujo continúa normalmente desde el paso 10. |

### Flujo Alternativo A3 — Paciente en lista de espera no responde

| Paso | Actor | Acción |
| :---: | :--- | :--- |
| A3.1 | Sistema | El paciente candidato recibe la notificación pero no reserva el slot dentro de 30 minutos. |
| A3.2 | Sistema | Ofrece el slot al siguiente candidato en la `LISTA_ESPERA` por prioridad descendente. |
| A3.3 | — | El proceso se repite hasta que algún candidato confirme o la lista se agote. |

---

## CU-04: Reprogramación de Cita con Control Anti-Abuso

**Actor Principal:** Paciente  
**Actores Secundarios:** Sistema (Motor de Citas)  
**Precondición:**
- El Paciente tiene una `CITA` propia en estado `Programada` o `Pagada`.
- El `HISTORIAL_REPROGRAMACION` de esa cita tiene menos de 3 registros (no ha excedido el límite).
- El nuevo `BLOQUE_HORARIO` seleccionado tiene estado `Libre`.

**Disparador:** El Paciente selecciona "Reprogramar" en el detalle de su cita.

---

### Flujo Básico (Happy Path)

| Paso | Actor | Acción |
| :---: | :--- | :--- |
| 1 | Paciente | En el detalle de su cita, hace clic en "Reprogramar" e ingresa el motivo del cambio. |
| 2 | Paciente | Navega por el calendario del médico y selecciona un nuevo `BLOQUE_HORARIO` disponible (estado `Libre`). |
| 3 | Sistema | Recibe `POST /citas/reprogramar` con `cita_id`, `nuevo_bloque_id` y `motivo`. |
| 4 | Sistema | Ejecuta `sp_reprogramar_cita`: consulta `COUNT(*)` en `HISTORIAL_REPROGRAMACION WHERE cita_id = p_cita_id`. |
| 5 | Sistema | Verifica que el `BLOQUE_HORARIO` nuevo tenga estado `Libre` con `SELECT ... FOR UPDATE`. |
| 6 | Sistema | Inicia `START TRANSACTION`. Actualiza el bloque horario anterior a `Libre`. |
| 7 | Sistema | Inserta registro en `HISTORIAL_REPROGRAMACION` con el motivo y fecha. |
| 8 | Sistema | Actualiza la `CITA` asignando el nuevo `bloque_horario_id` y estado `Reprogramada`. |
| 9 | Sistema | Actualiza el nuevo `BLOQUE_HORARIO` a `Ocupado`. Ejecuta `COMMIT`. |
| 10 | Sistema | Retorna al Paciente confirmación: "Tu cita ha sido reprogramada para el [nueva fecha] a las [nueva hora]." |

**Postcondición:**
- La `CITA` tiene el nuevo `bloque_horario_id` y estado `Reprogramada`.
- El bloque anterior tiene estado `Libre`.
- El nuevo bloque tiene estado `Ocupado`.
- Existe un nuevo registro en `HISTORIAL_REPROGRAMACION`.

---

### Flujo Alternativo A1 — Límite de reprogramaciones excedido (≥ 3)

| Paso | Actor | Acción |
| :---: | :--- | :--- |
| A1.1 | Sistema | En el paso 4, el `COUNT(*)` retorna 3 o más. |
| A1.2 | Sistema | Actualiza `USUARIO.estado` a `Bloqueado` (protección anti-abuso). |
| A1.3 | Sistema | Retorna error 403: "Has excedido el límite de 3 reprogramaciones para esta cita. Tu cuenta ha sido suspendida. Contacta a administración." |
| A1.4 | Admin | (Posterior) Puede revisar el caso y desbloquear manualmente si el motivo es justificado, actualizando el registro en `HISTORIAL_REPROGRAMACION` a estado `Justificado`. |

### Flujo Alternativo A2 — Nuevo slot no disponible (concurrencia)

| Paso | Actor | Acción |
| :---: | :--- | :--- |
| A2.1 | Sistema | En el paso 5, al verificar el nuevo bloque, detecta que su estado ya es `Ocupado` (otro paciente lo tomó concurrentemente). |
| A2.2 | Sistema | Retorna error: "El horario seleccionado ya no está disponible. Por favor elige otro turno." |
| A2.3 | Paciente | El calendario se refresca mostrando los bloques actualizados. El flujo regresa al paso 2. |

### Flujo Alternativo A3 — Paciente ya tiene otra cita en esa fecha/hora

| Paso | Actor | Acción |
| :---: | :--- | :--- |
| A3.1 | Sistema | Detecta que el Paciente ya tiene una `CITA` activa (`Programada`/`Pagada`) en el mismo rango horario del nuevo bloque seleccionado. |
| A3.2 | Sistema | Rechaza la reprogramación: "Ya tienes una cita programada en ese horario. Por favor selecciona un horario diferente." |

---

## CU-05: Check-in Físico y Generación de Ticket de Asistencia

**Actor Principal:** Recepción/Caja  
**Actores Secundarios:** Sistema, Paciente (presencialmente)  
**Precondición:**
- La `CITA` existe en base de datos con estado `Programada` o `Pagada`.
- El Paciente se presenta físicamente en la clínica.
- El personal de Recepción tiene acceso al módulo de check-in (rol `Cajero` o `Admin`).

**Disparador:** El Paciente llega a la ventanilla de recepción y entrega su DNI o muestra su código de cita.

---

### Flujo Básico (Happy Path)

| Paso | Actor | Acción |
| :---: | :--- | :--- |
| 1 | Paciente | Presenta su DNI o código de cita al personal de recepción. |
| 2 | Recepción | Busca la cita en el sistema por DNI o ID de cita. Verifica que la cita sea del día actual y esté en estado `Programada` o `Pagada`. |
| 3 | Recepción | Hace clic en "Registrar Llegada" en el módulo de recepción. |
| 4 | Sistema | Ejecuta `sp_registrar_asistencia_ticket(p_cita_id)`: verifica el estado de la cita y que no exista ticket previo. |
| 5 | Sistema | Genera el código de turno con formato `C-XXX` (ej. `C-042`) usando `CONCAT('C-', LPAD(cita_id, 3, '0'))`. |
| 6 | Sistema | Inserta en `TICKET_ASISTENCIA` con estado `Impreso` y `fecha_generacion = NOW()`. |
| 7 | Sistema | Retorna el `codigo_turno` al módulo de recepción. |
| 8 | Recepción | Imprime o muestra el ticket al Paciente con el número de turno, nombre del médico, consultorio y hora de cita. |
| 9 | Paciente | Toma asiento en sala de espera aguardando ser llamado por el código de turno en las pantallas digitales. |

**Postcondición:**
- Existe un registro en `TICKET_ASISTENCIA` con estado `Impreso` vinculado a la `CITA`.
- El Paciente tiene su código de turno y espera su llamado.

---

### Flujo Alternativo A1 — Cita no encontrada o en estado inválido

| Paso | Actor | Acción |
| :---: | :--- | :--- |
| A1.1 | Sistema | En el paso 4, la cita no existe, o tiene estado `Cancelada`, `Atendida` o `Reprogramada`. |
| A1.2 | Sistema | Retorna error: "No se encontró una cita activa para los datos ingresados. Verifique el DNI o código de cita." |
| A1.3 | Recepción | Asiste al paciente manualmente para resolver la situación (contactar administración o verificar datos). |

### Flujo Alternativo A2 — Ticket ya generado anteriormente (doble check-in)

| Paso | Actor | Acción |
| :---: | :--- | :--- |
| A2.1 | Sistema | En el paso 4, detecta que ya existe un `TICKET_ASISTENCIA` para esa `cita_id`. |
| A2.2 | Sistema | No crea un duplicado. Retorna el `codigo_turno` del ticket existente. |
| A2.3 | Recepción | Informa al Paciente que ya está registrado y le muestra su número de turno previo. |

### Flujo Alternativo A3 — Paciente llega tarde (cita expirada)

| Paso | Actor | Acción |
| :---: | :--- | :--- |
| A3.1 | Recepción | Detecta que la hora actual es posterior a la `hora_fin` del `BLOQUE_HORARIO` de la cita. |
| A3.2 | Recepción | Consulta con el médico si puede atender al paciente tarde o debe reprogramar. |
| A3.3 | Admin | Puede marcar la cita como `Atendida` (si el médico la acepta) o `Cancelada` con motivo "No show / Tardanza". |

---

## Resumen de Casos de Uso

| ID | Nombre | Actor Principal | SP / Función Relacionada |
| :---: | :--- | :--- | :--- |
| **CU-01** | Registro y Confirmación de Cita Médica | Paciente + Sistema | `sp_registrar_cita_medica` |
| **CU-02** | Formulario de Triaje con Análisis IA | Paciente + Sistema/IA | `fn_calcular_edad` |
| **CU-03** | Cancelación y Lista de Espera Reactiva | Paciente + Sistema | `sp_cancelar_cita_reactiva` |
| **CU-04** | Reprogramación con Control Anti-Abuso | Paciente + Sistema | `sp_reprogramar_cita` |
| **CU-05** | Check-in Físico y Generación de Ticket | Recepción + Sistema | `sp_registrar_asistencia_ticket` |
