import os

style = """
skinparam shadowing false
skinparam actor {
  BackgroundColor #F4F6F7
  BorderColor #2C3E50
  FontColor #2C3E50
}
skinparam usecase {
  BackgroundColor #EBF5FB
  BorderColor #2980B9
  FontColor #154360
  ArrowColor #2980B9
}
skinparam arrow {
  Color #34495E
  Thickness 1.5
}
skinparam package {
  BackgroundColor #FDEDEC
  BorderColor #C0392B
  FontColor #922B21
}
"""

files = {
    "modulo_1_autenticacion.puml": """@startuml
left to right direction
__STYLE__

actor "Público General" as Pub
actor "Paciente" as Pac
actor "Médico" as Med
actor "Administrador" as Adm

package "MÓDULO 1: Portal y autenticación" {
  usecase "Mostrar portal público" as UC1
  usecase "Iniciar sesión" as UC2
  usecase "Recuperar cuenta" as UC3
  usecase "Aplicar doble factor de autenticación" as UC5
  usecase "Personalizar cuenta" as UC4
}

UC1 .> UC2 : <<include>>

Pub -[#5D6D7E]-> UC1

Pac -[#27AE60]-> UC1
Pac -[#27AE60]-> UC3
Pac -[#27AE60]-> UC5
Pac -[#27AE60]-> UC4

Med -[#D35400]-> UC1
Med -[#D35400]-> UC3
Med -[#D35400]-> UC5

Adm -[#8E44AD]-> UC1
Adm -[#8E44AD]-> UC3
Adm -[#8E44AD]-> UC5
@enduml""",

    "modulo_2_pacientes.puml": """@startuml
left to right direction
__STYLE__

actor "Paciente" as Pac

package "MÓDULO 2: Pacientes" {
  usecase "Registrar paciente" as UC1
  usecase "Gestionar perfil" as UC2
  usecase "Mostrar dashboard" as UC3
  usecase "Descargar documentos" as UC4
  usecase "Ver historial de citas" as UC5
}

Pac -[#27AE60]-> UC1
Pac -[#27AE60]-> UC2
Pac -[#27AE60]-> UC3
Pac -[#27AE60]-> UC4
Pac -[#27AE60]-> UC5
@enduml""",

    "modulo_3_staff_medico.puml": """@startuml
left to right direction
__STYLE__

actor "Público General" as Pub
actor "Paciente" as Pac
actor "Médico" as Med
actor "Admin" as Adm
actor "Sistema" as Sis

package "MÓDULO 3: Directorio y staff médico" {
  usecase "CRUD para médicos" as UC1
  usecase "Asignar especialidades y jerarquía" as UC2
  usecase "Realizar búsqueda y filtros" as UC3
  usecase "Mostrar staff público de médico" as UC4
  usecase "Mostrar agenda médica (Diaria/Semanal)" as UC5
  usecase "Restringir atención" as UC6
  usecase "Emitir recetas (mock)" as UC7
}

UC1 .> UC2 : <<include>>
UC5 .> UC6 : <<include>>

Adm -[#8E44AD]-> UC1

Pac -[#27AE60]-> UC3
Pac -[#27AE60]-> UC4

Pub -[#5D6D7E]-> UC3
Pub -[#5D6D7E]-> UC4

Med -[#D35400]-> UC5
Med -[#D35400]-> UC7

Sis -[#E74C3C]-> UC6
@enduml""",

    "modulo_4_administracion.puml": """@startuml
left to right direction
__STYLE__

actor "Admin" as Adm

package "MÓDULO 4: Administración y catálogos" {
  usecase "CRUD de sedes, consultorios y especialidades" as UC1
  usecase "Forzar consultas emergentes" as UC2
  usecase "Limitar reprogramaciones" as UC3
  usecase "Mostrar dashboard admin" as UC4
  usecase "Aprobar excepciones" as UC5
  usecase "Forzar asignaciones" as UC6
}

Adm -[#8E44AD]-> UC1
Adm -[#8E44AD]-> UC2
Adm -[#8E44AD]-> UC3
Adm -[#8E44AD]-> UC4
Adm -[#8E44AD]-> UC5
Adm -[#8E44AD]-> UC6
@enduml""",

    "modulo_5_logica_negocio.puml": """@startuml
left to right direction
__STYLE__

actor "Sistema" as Sis

package "MÓDULO 5: Motor de lógica de negocio" {
  usecase "Detectar formularios de urgencia" as UC1
  usecase "Asignar consultorios" as UC2
  usecase "Validar edad" as UC3
  usecase "Validar formularios de pacientes" as UC4
  usecase "Prevenir el solapamiento" as UC5
  usecase "Compatibilidad de especialidad" as UC6
}

UC1 <.[#E74C3C]. UC2 : <<extend>>
UC2 .[#E74C3C].> UC3 : <<include>>
UC2 .[#E74C3C].> UC4 : <<include>>
UC2 .[#E74C3C].> UC5 : <<include>>
UC2 .[#E74C3C].> UC6 : <<include>>

Sis -[#E74C3C]-> UC1
Sis -[#E74C3C]-> UC3
Sis -[#E74C3C]-> UC4
Sis -[#E74C3C]-> UC5
Sis -[#E74C3C]-> UC6
@enduml""",

    "modulo_6_horarios.puml": """@startuml
left to right direction
__STYLE__

actor "Admin" as Adm
actor "Sistema" as Sis

package "MÓDULO 6: Horarios y disponibilidad" {
  usecase "Creación de slot de tiempo en bloques" as UC1
  usecase "Aplicar políticas de reserva" as UC2
  usecase "Sugerir alternativas" as UC3
  usecase "Modificar la disponibilidad de horarios" as UC4
}

Sis -[#E74C3C]-> UC1
Sis -[#E74C3C]-> UC2
Sis -[#E74C3C]-> UC3

Adm -[#8E44AD]-> UC1
Adm -[#8E44AD]-> UC4
@enduml""",

    "modulo_7_gestion_citas.puml": """@startuml
left to right direction
__STYLE__

actor "Paciente" as Pac
actor "Recepción" as Rec
actor "Sistema" as Sis

package "MÓDULO 7: Gestión de citas" {
  usecase "Realizar formulario" as UC1
  usecase "Generar ticket temporal" as UC2
  usecase "Confirmar cita" as UC3
  usecase "Cancelar la cita" as UC4
  usecase "Reprogramar la cita" as UC5
  usecase "Bloquear por límite de cambio" as UC6
  usecase "Registrar asistencia" as UC7
}

UC1 .> UC2 : <<include>>
UC2 .> UC3 : <<include>>
UC5 .> UC6 : <<include>>
UC7 .> UC2 : <<include>>

Pac -[#27AE60]-> UC1
Pac -[#27AE60]-> UC4
Pac -[#27AE60]-> UC5

Sis -[#E74C3C]-> UC3
Sis -[#E74C3C]-> UC6

Rec -[#F1C40F]-> UC7
@enduml""",

    "modulo_8_lista_espera.puml": """@startuml
left to right direction
__STYLE__

actor "Paciente" as Pac
actor "Admin" as Adm
actor "Sistema" as Sis

package "MÓDULO 8: Lista de espera y prioridades" {
  usecase "Ingresar a la lista de espera" as UC1
  usecase "Clasificar por prioridad" as UC2
  usecase "Asignar desde la lista" as UC3
  usecase "Dar de baja una consulta" as UC4
  usecase "Ordenar la cola de pacientes" as UC5
}

UC1 .> UC5 : <<include>>
UC2 .> UC5 : <<include>>
UC3 .> UC5 : <<include>>
UC4 .> UC5 : <<include>>

Pac -[#27AE60]-> UC1

Sis -[#E74C3C]-> UC2
Sis -[#E74C3C]-> UC3

Adm -[#8E44AD]-> UC4
@enduml"""
}

for filename, content in files.items():
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content.replace("__STYLE__", style))
    print(f"Updated {filename}")
