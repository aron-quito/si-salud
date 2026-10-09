# Diccionario de Diagramas de Secuencia: Sistema SI-SALUD

Este documento detalla paso a paso las interacciones y flujos de datos expuestos en los diagramas de secuencia del sistema (Agendamiento Lote, Flujo Reactivo y Flujos de Bloqueo).

---

## 1. Flujo de Agendamiento Lote (Smart Slotting)
**Descripción:** Proceso asíncrono. Las solicitudes (triajes) se acumulan en una "Bolsa", y durante la madrugada un algoritmo de Inteligencia Artificial (Cron Job) las evalúa para encajarlas en el calendario médico (Slotting).

| Paso | Origen | Destino | Acción / Descripción |
| :---: | :--- | :--- | :--- |
| **1** | Paciente | Frontend | El paciente llena el formulario de triaje con sus síntomas. |
| **2** | Frontend | Serv. Triaje | Petición POST `/solicitud`. |
| **3** | Serv. Triaje | Algoritmo IA| Se envía el texto para análisis NLP (Natural Language Processing). |
| **4** | Algoritmo IA| Serv. Triaje | Retorna un Score numérico de Urgencia y un resumen. |
| **5** | Serv. Triaje | Bolsa (DB) | Guarda la Solicitud temporalmente en la Bolsa (En Espera). |
| **6** | Serv. Triaje | Frontend | Devuelve una confirmación de recepción al paciente. |
| **7** | Cron Job | Motor Agenda | *Evento de Medianoche (12:00 AM)* - El motor se despierta. |
| **8** | Motor Agenda | Bolsa (DB) | Obtiene todas las solicitudes pendientes de la bolsa. |
| **9** | Motor Agenda | Interno | Ordena los registros por Score de Urgencia (Descendente). |
| **10**| Motor Agenda | Interno | Aplica "Smart Slotting" asignando bloques horarios según edad y especialidad. |
| **11**| Motor Agenda | DB (Citas) | Actualiza el estado convirtiendo Solicitudes en Citas confirmadas ('Agendado'). |
| **12**| Motor Agenda | Notificacio. | Dispara los triggers para informar a los usuarios seleccionados. |
| **13**| Notificacio. | Paciente | Envía el Correo/SMS indicando "Cita Asignada". |

---

## 2. Flujo Reactivo: Cancelación y Lista de Espera
**Descripción:** Lógica "Push" en tiempo real que sucede cuando un paciente cancela su cita. El sistema reacciona buscando pacientes en "Lista de Espera" y ofreciendo el cupo liberado bajo estricta concurrencia (Bloqueo Optimista).

| Paso | Origen | Destino | Acción / Descripción |
| :---: | :--- | :--- | :--- |
| **1** | Paciente | Frontend | El paciente solicita la Cancelación con una justificación. |
| **2** | Frontend | Motor Agenda | Petición POST `/citas/cancelar`. |
| **3** | Motor Agenda | Base Datos | Actualiza `CITA` (Estado: Cancelado). |
| **4** | Motor Agenda | Base Datos | Actualiza `BLOQUE_HORARIO` (Estado: Libre). |
| **5** | Motor Agenda | Base Datos | *Reacción:* Consulta ¿Hay pacientes en Lista de Espera para esta especialidad? |
| **6** | Base Datos | Motor Agenda | Retorna el listado de pacientes con Alta Urgencia en la cola. |
| **7** | Motor Agenda | Notificacio. | Dispara el evento de "Liberación de Horario". |
| **8** | Notificacio. | Pac. Espera | Envía alertas push/email: "Nuevo horario disponible, resérvalo rápido". |
| **9** | Pac. Espera | Frontend | Un paciente reacciona e intenta reclamar el cupo. |
| **10**| Frontend | Motor Agenda | Petición POST `/citas/reclamar`. |
| **11**| Motor Agenda | Base Datos | Inicia Transacción con **Bloqueo Optimista** (Verifica colisiones). |
| **12a**| Motor Agenda | Base Datos | *(Si el slot está libre)*: Actualiza `BLOQUE_HORARIO` a "Ocupado". |
| **12b**| Motor Agenda | Pac. Espera | Retorna al paciente "Cita Confirmada Exitosamente". |
| **13**| Motor Agenda | Pac. Espera | *(Si el slot ya fue tomado por otra persona antes)*: Error: "Slot ya ocupado". |

---

## 3. Flujo Lógico: Bloqueos y Límites de Reprogramación
**Descripción:** Mecanismo de seguridad contra usuarios maliciosos o indecisos (Abuse Prevention) que reprograman sus citas excesivas veces, reteniendo cupos.

| Paso | Origen | Destino | Acción / Descripción |
| :---: | :--- | :--- | :--- |
| **1** | Paciente | Frontend | Solicita Reprogramar su Cita ya confirmada. |
| **2** | Frontend | Motor Citas | Petición POST `/citas/reprogramar`. |
| **3** | Motor Citas | Base Datos | Realiza Query: Cuenta los registros previos en `HISTORIAL_REPROGRAMACION`. |
| **4** | Base Datos | Motor Citas | Retorna la cantidad de cambios realizados anteriormente por ese paciente para esa cita. |
| **5a**| Motor Citas | Base Datos | *(Si Límite Excedido >= 3)*: Actualiza la tabla `USUARIO` a Estado: "Bloqueado". |
| **5b**| Motor Citas | Frontend | Retorna Error 403: "Límite de cambios excedido". |
| **5c**| Frontend | Paciente | Muestra alerta roja en pantalla informando que la cuenta ha sido suspendida. |
| **6a**| Motor Citas | Base Datos | *(Si Límite Permitido < 3)*: Libera el `BLOQUE_HORARIO` anterior a "Libre". |
| **6b**| Motor Citas | Base Datos | Inserta un registro de auditoría en `HISTORIAL_REPROGRAMACION`. |
| **6c**| Motor Citas | Base Datos | Actualiza `CITA` atándola al nuevo bloque horario (Estado: "Reprogramada"). |
| **6d**| Motor Citas | Frontend | Devuelve un 200 OK de confirmación de reprogramación. |
| **6e**| Frontend | Paciente | Muestra la interfaz de confirmación con la nueva fecha y hora. |
