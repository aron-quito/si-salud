# Especificación Técnica y Requerimientos de Plataforma Hospitalaria Pública: SISALUD / TeleSalud Nacional

## Resumen del Proyecto
Sistema hospitalario público integral de citas, triaje inteligente (Triage 1 al 5) y gestión de agenda médica para pacientes y facultativos.

### Módulos Principales:
1. **Portal Ciudadano & Autenticación Unificada (REQ-001 al REQ-008):**
   - Acceso con DNI / Cédula y contraseña.
   - Switch de perfil: Paciente Ciudadano vs. Personal Médico / Especialista.
   - Registro con validación de documento de identidad (DNI), nombres, fecha nacimiento, teléfono, correo y seguro de salud (SIS / EsSalud / Particular).

2. **Flujo de Agendamiento Inteligente con Triaje Clínico Evaluativo (REQ-036 al REQ-051):**
   - Cuestionario estructurado de signos de alarma y dolor (Escala analógica 1 al 5, fiebre, disnea, síntomas sistémicos).
   - Clasificación algorítmica:
     * Urgencia / Prioridad 1-2: Asignación automática prioritaria en 24h con alerta clínica y consultorio de guardia.
     * Prioridad 3-5 (Baja gravedad/rutina): Selector inteligente de slots alternativos (2 o más opciones de horarios recomendados) para elección del usuario.
   - Emisión de comprobante de solicitud / Ticket de Turno oficial con QR, código de seguimiento único y confirmación estimada al día siguiente.

3. **Portal Paciente - Mis Citas & Historial (REQ-011 al REQ-016, REQ-052 al REQ-054):**
   - Pestañas organizadas: Próximas Citas (Confirmadas / En validación), Citas Pasadas / Historial.
   - Detalle del médico asignado (especialidad, consultorio físico en sede central, credencial CMP).
   - Acciones de gestión: Cancelar cita (con confirmación inmediata y liberación de slot), reprogramación e impresión/descarga de ticket/receta PDF.

4. **Portal Médico & Consulta Clínica Especializada (REQ-022 al REQ-026, REQ-055 al REQ-060):**
   - Vista de Agenda Interactiva con conmutador estilo Google Calendar: Modo Vista Diaria (bloques horarios cronológicos de 08:00 a 18:00) y Vista Semanal (grilla 7 días).
   - Panel de consulta de paciente al seleccionar cita:
     * Nivel de gravedad asignado por el sistema de triaje (Badge de riesgo 1-5 codificado por color Manchester/ESI).
     * Respuestas del cuestionario inicial del paciente.
     * Historial clínico abreviado (antecedentes, alergias, citas previas).
     * Formulario para notas de evolución y emisión de receta e indicaciones médicas (Mock REQ-026).
