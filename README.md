# SI-SALUD: Sistema Inteligente de Agendamiento Médico 🏥

**SI-SALUD** es una plataforma de gestión hospitalaria de próxima generación, diseñada específicamente para modernizar y optimizar la atención en **Entidades Estatales de Salud** (Hospitales Públicos, Ministerios de Salud, Redes de Seguridad Social y Clínicas del Estado).

Su objetivo principal es democratizar el acceso a la salud pública, erradicar las largas colas físicas de madrugada, y optimizar al máximo el tiempo de los profesionales médicos mediante Inteligencia Artificial y un motor de agendamiento elástico (*Smart Slotting*).

---

## 🎯 El Problema Público a Resolver

Históricamente, los sistemas de salud estatales sufren de los siguientes males endémicos:
1. **Embotellamiento en Triaje:** Pacientes esperando meses para una cita rutinaria, compitiendo ciegamente con pacientes que requieren atención urgente.
2. **Alta tasa de "No-Shows" (Ausentismo):** Citas perdidas por olvido o cancelaciones tardías, desperdiciando recursos públicos invaluables y subsidiados.
3. **Ineficiencia Espacial:** Consultorios vacíos y horas-hombre perdidas mientras hay cientos de ciudadanos esperando por atención.
4. **Acaparamiento de Cupos:** Usuarios, tramitadores o mafias que reservan múltiples citas para luego cancelarlas o reprogramarlas indiscriminadamente.

---

## 🚀 Solución SI-SALUD: Características Clave

SI-SALUD aborda estos desafíos estructurales con tecnología de punta orientada al ciudadano:

*   🧠 **Triaje Asíncrono con IA:** El paciente ingresa sus síntomas en lenguaje natural a través del portal. Un modelo de Inteligencia Artificial (NLP) evalúa el texto y le asigna un "Score de Urgencia". Los ciudadanos con condiciones más graves son priorizados automáticamente, garantizando equidad basada en la necesidad clínica real y no en "quién llegó primero a hacer fila".
*   ⏱️ **Motor de *Smart Slotting*:** Durante la madrugada, un algoritmo pesado (Cron Job) hace "Tetris" con la agenda pública de los médicos, asignando bloques de tiempo elásticos según la urgencia y edad del paciente, maximizando la ocupación de la infraestructura del Estado.
*   🔄 **Lista de Espera Reactiva:** Si un paciente cancela, su turno no se pierde. El sistema avisa instantáneamente mediante SMS/Email a los ciudadanos compatibles en la cola virtual para que tomen el cupo en segundos, evitando la pérdida del subsidio estatal.
*   🛡️ **Prevención de Abuso (Anti-Acaparamiento):** El sistema audita un Historial de Reprogramación continuo. Si un usuario cancela o mueve su cita repetidas veces injustificadamente, el sistema suspende su cuenta (requiriendo revisión administrativa), protegiendo la red pública para pacientes que realmente la necesitan.
*   🎫 **Transparencia y Trazabilidad:** Módulos integrados para Recepción (emisión de Tickets de Asistencia en el recinto) y Auditoría de Pagos/Vouchers para servicios tarifados, mitigando fugas financieras.

---

## 🏗️ Arquitectura y Stack Tecnológico

El sistema ha sido construido bajo una arquitectura modular y escalable para soportar la altísima concurrencia de una entidad estatal:

*   **Frontend (Portal Ciudadano y Panel Administrativo):**
    *   [Next.js](https://nextjs.org/) (App Router) y React.
    *   TailwindCSS + Shadcn UI para una interfaz accesible, rápida y 100% compatible con dispositivos móviles (por donde accede la mayoría de la población).
*   **Backend & Base de Datos:**
    *   Node.js operando sobre **PostgreSQL** mediante **Prisma ORM**. PostgreSQL garantiza el cumplimiento estricto de principios ACID, asegurando que nunca existan citas solapadas ni corrupción de datos bajo estrés masivo.
*   **Procesamiento Asíncrono y Colas:**
    *   **Redis** y **BullMQ** para manejar colas de notificaciones masivas a ciudadanos y el procesamiento pesado de algoritmos a medianoche sin colapsar el servidor principal.
*   **Inteligencia Artificial:**
    *   Integración API para el análisis de lenguaje natural (NLP) en el triaje de síntomas.

---

## 📁 Estructura de Documentación

Todo el análisis y arquitectura técnica del proyecto ha sido documentado para facilitar auditorías estatales y el onboarding ágil del equipo de desarrollo gubernamental:

- 📄 `docs/Plan_Proyecto_SI_SALUD.md`: Documento maestro y epicentro del proyecto.
- 🗄️ `docs/diccionarios/diccionario_datos.md`: Estructura estricta de la base de datos y relaciones.
- 👥 `docs/diccionarios/diccionario_casos_de_uso.md`: Explicación de los 8 módulos del sistema y sus actores.
- ⚙️ `docs/diccionarios/diccionario_secuencias.md`: Explicación de flujos lógicos, asincronía y motor de reglas.
- 🎟️ `docs/diccionarios/backlog_tareas_jira.md`: Desglose ágil en tickets técnicos listos para importar a herramientas de gestión (Jira).
- 🖼️ `docs/diagrams/`: Repositorio de todos los diagramas renderizados en alta calidad (Arquitectura, DER, Casos de Uso, Secuencias).

---
*Construido para hacer más humana, eficiente y transparente la salud pública.*