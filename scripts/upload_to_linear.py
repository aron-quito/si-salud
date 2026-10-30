#!/usr/bin/env python3
"""
SI-SALUD → Linear GraphQL Upload
Crea: Proyectos → Milestones → Issues (CPM labels) → Relaciones de bloqueo
"""
import json, os, sys, time, urllib.request, urllib.error

LINEAR_GRAPHQL_URL = "https://api.linear.app/graphql"

MODULES_DATA = [
    {
        "module":    "MODULO 0: Infraestructura y Setup Core",
        "project":   "SI-SALUD: Setup e Infraestructura",
        "milestone": "M0: Entorno Base y Seguridad",
        "issues": [
            {
                "ref": "SETUP-01",
                "title": "[SETUP-01] Infra: Docker Compose para PostgreSQL y Redis BullMQ",
                "priority": 1, "estimate": 3, "is_cpm": True,
                "description": "Levantar docker-compose.yml con PostgreSQL 16 y Redis 7 con volúmenes persistentes.\n\n### Criterios de Aceptación\n- Contenedores levantados con `docker compose up -d`.\n- Persistencia verificada con reinicio.\n- Conexión probada desde cliente local.",
                "blocked_by": []
            },
            {
                "ref": "SETUP-02",
                "title": "[SETUP-02] Frontend: Inicializar Proyecto Next.js, TailwindCSS y Shadcn UI",
                "priority": 2, "estimate": 4, "is_cpm": False,
                "description": "Inicializar proyecto Next.js (App Router, TypeScript) con TailwindCSS y Shadcn UI.\n\n### Criterios de Aceptación\n- `npm run dev` compila sin errores.\n- Componentes base de Shadcn UI instalados.\n- Linter y Prettier configurados.",
                "blocked_by": []
            },
            {
                "ref": "SETUP-03",
                "title": "[SETUP-03] BD: Modelado Prisma Schema (17 Tablas con Cargas Familiares) y Migraciones",
                "priority": 1, "estimate": 6, "is_cpm": True,
                "description": "Traducir el DER a schema.prisma (17 entidades: CARGA_FAMILIAR, INTERCONSULTA, TICKET_ASISTENCIA). Migraciones y seeder inicial.\n\n### Criterios de Aceptación\n- Migración ejecutada sin errores de integridad referencial.\n- Seed genera roles y especialidades.",
                "blocked_by": ["SETUP-01", "SETUP-02"]
            },
            {
                "ref": "SETUP-04",
                "title": "[SETUP-04] Sec: Autenticación NextAuth.js (JWT, RBAC y 2FA)",
                "priority": 1, "estimate": 6, "is_cpm": True,
                "description": "NextAuth.js con credenciales Bcrypt, sesiones JWT y RBAC por roles.\n\n### Criterios de Aceptación\n- Middleware redirige según rol (Paciente, Médico, Admin, Recepción).\n- Sesiones JWT enriquecidas con rol y permisos.",
                "blocked_by": ["SETUP-03"]
            }
        ]
    },
    {
        "module":    "MODULO 1: Autenticación, Pacientes y Cargas Familiares",
        "project":   "SI-SALUD: Pacientes y Cargas Familiares",
        "milestone": "M1: Identidad Digital Familiar",
        "issues": [
            {
                "ref": "PAC-01",
                "title": "[PAC-01] Fullstack: Registro de Pacientes, Login y Doble Factor (2FA)",
                "priority": 1, "estimate": 5, "is_cpm": True,
                "description": "Pantallas de registro por DNI, correo y teléfono. Código 2FA por SMS/correo.\n\n### Criterios de Aceptación\n- Paciente valida código 2FA de 6 dígitos.\n- Sesión redirige al dashboard por rol.",
                "blocked_by": ["SETUP-04"]
            },
            {
                "ref": "PAC-02",
                "title": "[PAC-02] Fullstack: Módulo de Cargas Familiares (Dependientes y Menores)",
                "priority": 1, "estimate": 5, "is_cpm": True,
                "description": "Interfaz para que el titular registre dependientes vinculados a CARGA_FAMILIAR sin requerir correo propio.\n\n### Criterios de Aceptación\n- Titular registra dependientes con parentesco y fecha de nacimiento.\n- Dependientes aparecen en el switcher de perfil.",
                "blocked_by": ["PAC-01"]
            },
            {
                "ref": "PAC-03",
                "title": "[PAC-03] Frontend: Dashboard de Paciente y Switcher de Perfil Familiar",
                "priority": 2, "estimate": 4, "is_cpm": False,
                "description": "Panel con selector de perfil activo (Titular vs Dependiente) y vista de citas agendadas.\n\n### Criterios de Aceptación\n- Switcher visual permite alternar perfil activo.\n- Lista de citas con estado visual (Confirmada, Pendiente, Cancelada).",
                "blocked_by": ["PAC-02"]
            }
        ]
    },
    {
        "module":    "MODULO 2: Staff Médico y Directorio Público",
        "project":   "SI-SALUD: Staff Médico y Directorio",
        "milestone": "M2: Directorio y Agenda Médica",
        "issues": [
            {
                "ref": "MED-01",
                "title": "[MED-01] Backend: CRUD de Sedes, Consultorios y Especialidades",
                "priority": 1, "estimate": 5, "is_cpm": True,
                "description": "Endpoints CRUD para gestionar Sedes, Consultorios y Especialidades médicas.\n\n### Criterios de Aceptación\n- CRUD completo con validación Zod.\n- Relaciones médico-consultorio-especialidad correctas en BD.",
                "blocked_by": ["SETUP-03"]
            },
            {
                "ref": "MED-02",
                "title": "[MED-02] Frontend: Directorio Médico Público con SSR y Búsqueda Reactiva (SEO)",
                "priority": 3, "estimate": 5, "is_cpm": False,
                "description": "Página SSR de acceso público para SEO. Búsqueda con debounce por nombre, especialidad y sede.\n\n### Criterios de Aceptación\n- Búsqueda en tiempo real en < 3s.\n- Accesible sin autenticación con metadata OpenGraph.",
                "blocked_by": ["MED-01"]
            },
            {
                "ref": "MED-03",
                "title": "[MED-03] Fullstack: Panel de Agenda Médica y Consulta de Historiales",
                "priority": 1, "estimate": 6, "is_cpm": True,
                "description": "Calendario de citas diarias/semanales del médico con acceso a historial clínico.\n\n### Criterios de Aceptación\n- Calendario interactivo con Shadcn UI.\n- Médico puede ver diagnósticos e interconsultas previas.",
                "blocked_by": ["MED-01", "SETUP-04"]
            }
        ]
    },
    {
        "module":    "MODULO 3: Motor de Triaje Inteligente y Filtro Clínico",
        "project":   "SI-SALUD: Triaje NLP y Bolsa",
        "milestone": "M3: Triaje Inteligente y NLP",
        "issues": [
            {
                "ref": "TRI-01",
                "title": "[TRI-01] Frontend: Formulario de Triaje y Control Anti-Acaparamiento",
                "priority": 2, "estimate": 5, "is_cpm": False,
                "description": "Formulario de síntomas, beneficiario, modalidad y preferencia horaria. Bloqueo de duplicidades.\n\n### Criterios de Aceptación\n- Bloqueo si ya tiene solicitud pendiente en la misma especialidad.\n- Selector de beneficiario (Titular o Dependiente) funcional.",
                "blocked_by": ["PAC-03"]
            },
            {
                "ref": "TRI-02",
                "title": "[TRI-02] Backend: Servicio NLP de Triaje IA (Score Urgencia y Bloques Elásticos)",
                "priority": 1, "estimate": 7, "is_cpm": True,
                "description": "Route handler con LLM que extrae score_urgencia (0-100), bloques elásticos y especialidad.\n\n### Criterios de Aceptación\n- Retorna JSON estructurado en < 2 segundos.\n- Score documentado en SOLICITUD_TRIAJE.",
                "blocked_by": ["SETUP-03"]
            },
            {
                "ref": "TRI-03",
                "title": "[TRI-03] Backend: Protocolo de Bloqueo por Emergencia Vital (Banderas Rojas >= 85)",
                "priority": 2, "estimate": 4, "is_cpm": False,
                "description": "Si score_urgencia >= 85, bloquea cita ambulatoria y emite alerta roja con derivación a Urgencias.\n\n### Criterios de Aceptación\n- Bloqueo de citas para emergencias letales.\n- Notificación inmediata al personal de Urgencias.",
                "blocked_by": ["TRI-02"]
            },
            {
                "ref": "TRI-04",
                "title": "[TRI-04] Backend: Bolsa de Solicitudes y Enrutamiento (Primer Nivel vs Interconsulta)",
                "priority": 1, "estimate": 6, "is_cpm": True,
                "description": "Persistencia en SOLICITUD_TRIAJE estado Pendiente. Enrutamiento automático a Medicina General si no tiene interconsulta.\n\n### Criterios de Aceptación\n- Registro exitoso en PostgreSQL y Redis.\n- Enrutamiento correcto según nivel de interconsulta.",
                "blocked_by": ["TRI-01", "TRI-02"]
            }
        ]
    },
    {
        "module":    "MODULO 4: Motor de Agendamiento Batch (Smart Slotting) y Cortesía",
        "project":   "SI-SALUD: Smart Slotting Batch",
        "milestone": "M4: Agendamiento Batch y Cortesía",
        "issues": [
            {
                "ref": "MIA-01",
                "title": "[MIA-01] Backend: Generador Masivo de Bloques Horarios Fijos (ACID)",
                "priority": 1, "estimate": 5, "is_cpm": True,
                "description": "Pre-poblar celdas de 15 min en BLOQUE_HORARIO por médico y consultorio con transacciones ACID.\n\n### Criterios de Aceptación\n- Inserción masiva sin solapamientos.\n- Bloques generados para horizonte de 30 días.",
                "blocked_by": ["MED-01"]
            },
            {
                "ref": "MIA-02",
                "title": "[MIA-02] Backend: Worker Batch BullMQ (Smart Slotting y Bloques Elásticos Contiguos)",
                "priority": 1, "estimate": 9, "is_cpm": True,
                "description": "Cron job a las 00:00. Extrae solicitudes pendientes y aplica empaquetamiento contiguo en horizonte 1-30 días según preferencia de turno.\n\n### Criterios de Aceptación\n- Cero solapamiento bajo transacciones ACID.\n- Prioridad por score_urgencia y flag es_reprogramacion.",
                "blocked_by": ["TRI-04", "MIA-01"]
            },
            {
                "ref": "MIA-03",
                "title": "[MIA-03] Fullstack: Notificaciones Nocturnas y Ventana de Cortesía 12h",
                "priority": 1, "estimate": 6, "is_cpm": True,
                "description": "Notificación de cita asignada con botón 'Rechazar Horario' activo hasta las 12:00 PM sin penalización.\n\n### Criterios de Aceptación\n- Bloque pasa a Libre al rechazar dentro de la ventana.\n- Expiración automática del botón pasadas las 12:00 PM.",
                "blocked_by": ["MIA-02"]
            },
            {
                "ref": "MIA-04",
                "title": "[MIA-04] Fullstack: Asignación Manual Pre-Batch desde la Bolsa",
                "priority": 3, "estimate": 5, "is_cpm": False,
                "description": "Interfaz para asignación manual de solicitudes antes del cron 00:00.\n\n### Criterios de Aceptación\n- Asignación respeta reglas ACID.\n- Solo roles Admin y Recepción pueden asignar manualmente.",
                "blocked_by": ["TRI-04", "MIA-01"]
            }
        ]
    },
    {
        "module":    "MODULO 5: Lista de Espera Reactiva y Contingencia Institucional",
        "project":   "SI-SALUD: Lista de Espera y Contingencia",
        "milestone": "M5: Lista de Espera y Contingencia",
        "issues": [
            {
                "ref": "ESP-01",
                "title": "[ESP-01] Backend: Enrolamiento Doble Riel a Lista de Espera",
                "priority": 1, "estimate": 4, "is_cpm": True,
                "description": "Inscripción automática en LISTA_ESPERA si urgencia 65-84 y cita asignada > 7 días.\n\n### Criterios de Aceptación\n- Paciente conserva cita lejana y queda activo en espera reactiva.\n- Cola ordenada por score_urgencia DESC y fecha_solicitud ASC.",
                "blocked_by": ["MIA-02"]
            },
            {
                "ref": "ESP-02",
                "title": "[ESP-02] Backend: Motor Reactivo de Lista de Espera con Hold Exclusivo (20 min)",
                "priority": 1, "estimate": 8, "is_cpm": True,
                "description": "Al cancelarse slot con >= 80 min anticipación, Hold Temporal de 20 min al paciente #1 de la cola.\n\n### Criterios de Aceptación\n- Margen garantizado de 1 hora de traslado tras aceptación.\n- Hold expira y pasa al siguiente si no se acepta.\n- Slots < 80 min NO se ofrecen a la lista de espera.",
                "blocked_by": ["ESP-01", "MIA-03"]
            },
            {
                "ref": "ESP-03",
                "title": "[ESP-03] Fullstack: Protocolo de Contingencia Institucional por Ausencia Médica",
                "priority": 2, "estimate": 7, "is_cpm": False,
                "description": "Cascada 3 escalones ante ausencia médica:\n1. Reasignación a colega disponible en la misma franja.\n2. Lista de espera diurna con máxima prioridad.\n3. Bolsa nocturna Top Priority.\n\n### Criterios de Aceptación\n- Notificación masiva a pacientes afectados.\n- Cero cómputo de falta al paciente.",
                "blocked_by": ["ESP-02", "MIA-02"]
            },
            {
                "ref": "ESP-04",
                "title": "[ESP-04] Backend: Motor de Reprogramaciones y Penalización en Citas (Límite 3)",
                "priority": 2, "estimate": 5, "is_cpm": False,
                "description": "Reingreso a bolsa nocturna con es_reprogramacion = True. Tras 3 reprogramaciones, suspende nuevas reservas 30 días.\n\n### Criterios de Aceptación\n- Error 403 informativo al intentar cuarta reprogramación.\n- Contador visible en perfil del paciente.",
                "blocked_by": ["MIA-02"]
            }
        ]
    },
    {
        "module":    "MODULO 6: Día de Atención: Admisión, Sala de Espera y Telemedicina",
        "project":   "SI-SALUD: Admisión y Consultorio",
        "milestone": "M6: Admisión, Turnero y Consultorio",
        "issues": [
            {
                "ref": "CIT-01",
                "title": "[CIT-01] Frontend: Módulo de Admisión Presencial y Emisión de Ticket de Turno",
                "priority": 1, "estimate": 5, "is_cpm": True,
                "description": "Check-in presencial por DNI/QR y generación de TICKET_ASISTENCIA con código de turno (T-042).\n\n### Criterios de Aceptación\n- Cita pasa a En_Sala_Espera en tiempo real sin recargar la página.\n- Ticket imprimible con código de turno único.",
                "blocked_by": ["MIA-02"]
            },
            {
                "ref": "CIT-02",
                "title": "[CIT-02] Fullstack: Check-in Virtual para Telemedicina (Meet / Llamada)",
                "priority": 2, "estimate": 5, "is_cpm": False,
                "description": "Botón 'Entrar a Sala Virtual' activo 15 min antes. Marca En_Sala_Virtual para evitar falsos No-Shows.\n\n### Criterios de Aceptación\n- Médico visualiza que el paciente está conectado en sala virtual.\n- Botón activo 15 min antes y se desactiva 5 min después del inicio.",
                "blocked_by": ["MIA-02"]
            },
            {
                "ref": "CIT-03",
                "title": "[CIT-03] Fullstack: Turnero Digital en TV + Notificación Push Móvil",
                "priority": 1, "estimate": 6, "is_cpm": True,
                "description": "Pantalla de TV con turno llamado en tiempo real vía WebSockets + push móvil al paciente.\n\n### Criterios de Aceptación\n- Actualización en < 1 segundo al llamar el médico.\n- Push enviado al paciente cuando es su turno.",
                "blocked_by": ["CIT-01", "CIT-02"]
            },
            {
                "ref": "CIT-04",
                "title": "[CIT-04] Fullstack: Protocolo de 2 Llamados, Rezagados, Recetas PDF e Interconsultas",
                "priority": 1, "estimate": 7, "is_cpm": True,
                "description": "Panel de atención: 1er llamado, 2do llamado a los 3 min, pasa a Rezagado si no responde. Recetas PDF e interconsultas.\n\n### Criterios de Aceptación\n- Control de minutos de bloque para rezagados sin afectar al siguiente.\n- Receta PDF generada y visible en historial del paciente.",
                "blocked_by": ["CIT-03", "MED-03"]
            },
            {
                "ref": "CIT-05",
                "title": "[CIT-05] Backend: Worker de Cierre de Turno de Consultorio y Liquidación de No-Shows",
                "priority": 1, "estimate": 5, "is_cpm": True,
                "description": "Cron al cierre de jornada: liquida citas no atendidas a No_Show y suma falta al historial.\n\n### Criterios de Aceptación\n- Suspensión temporal al acumular 2 inasistencias injustificadas.\n- Log de auditoría por cada cierre de jornada.",
                "blocked_by": ["CIT-04"]
            }
        ]
    }
]

def gql(api_key, query, variables=None):
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        LINEAR_GRAPHQL_URL, data=data,
        headers={"Content-Type": "application/json", "Authorization": api_key.strip()}
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8")
        print(f"  HTTP {e.code}: {err[:200]}")
        return {"errors": [{"message": err}]}
    except Exception as e:
        print(f"  Error de red: {e}")
        return {"errors": [{"message": str(e)}]}

def check_errors(res, label):
    if "errors" in res:
        print(f"  ERROR en {label}: {res['errors'][0].get('message','?')[:150]}")
        return True
    return False

def get_viewer_and_teams(api_key):
    res = gql(api_key, "{ viewer { id name email } teams { nodes { id name key } } }")
    if check_errors(res, "auth"): return None, None
    return res["data"]["viewer"], res["data"]["teams"]["nodes"]

def create_project(api_key, team_id, name, description):
    q = """mutation($input: ProjectCreateInput!) {
      projectCreate(input: $input) { success project { id name } }
    }"""
    res = gql(api_key, q, {"input": {"name": name, "description": description, "teamIds": [team_id], "color": "#6366f1"}})
    if check_errors(res, f"createProject"): return None
    node = res.get("data", {}).get("projectCreate", {})
    return node["project"]["id"] if node.get("success") else None

def create_milestone(api_key, project_id, name, description):
    q = """mutation($input: ProjectMilestoneCreateInput!) {
      projectMilestoneCreate(input: $input) { success projectMilestone { id name } }
    }"""
    res = gql(api_key, q, {"input": {"projectId": project_id, "name": name, "description": description}})
    if check_errors(res, f"createMilestone"): return None
    node = res.get("data", {}).get("projectMilestoneCreate", {})
    if node.get("success"):
        mid = node["projectMilestone"]["id"]
        print(f"    📍 Milestone: {name}")
        return mid
    print(f"    WARN: milestone no creado para {name}")
    return None

def create_issue(api_key, team_id, project_id, milestone_id, title, description, priority, estimate):
    q = """mutation($input: IssueCreateInput!) {
      issueCreate(input: $input) { success issue { id title identifier } }
    }"""
    inp = {"teamId": team_id, "title": title, "description": description, "priority": priority, "estimate": estimate}
    if project_id:    inp["projectId"] = project_id
    if milestone_id:  inp["projectMilestoneId"] = milestone_id
    res = gql(api_key, q, {"input": inp})
    if check_errors(res, f"createIssue"): return None
    node = res.get("data", {}).get("issueCreate", {})
    return node["issue"] if node.get("success") else None

def create_relation(api_key, blocker_id, blocked_id):
    q = """mutation($input: IssueRelationCreateInput!) {
      issueRelationCreate(input: $input) { success }
    }"""
    res = gql(api_key, q, {"input": {"issueId": blocker_id, "relatedIssueId": blocked_id, "type": "blocks"}})
    if check_errors(res, "createRelation"): return False
    return res.get("data", {}).get("issueRelationCreate", {}).get("success", False)

def main():
    api_key = os.environ.get("LINEAR_API_KEY") or (sys.argv[1] if len(sys.argv) > 1 else None)
    if not api_key:
        print("ERROR: Proporciona tu LINEAR_API_KEY")
        print("Uso:  python3 scripts/upload_to_linear.py lin_api_...")
        sys.exit(1)

    print("\n🚀 Conectando con Linear GraphQL API...")
    viewer, teams = get_viewer_and_teams(api_key)
    if not viewer:
        print("Fallo de autenticación. Verifica tu API Key.")
        sys.exit(1)

    print(f"✓ Autenticado: {viewer['name']} ({viewer['email']})")
    team = teams[0]
    print(f"✓ Equipo: {team['name']} (key={team['key']}, id={team['id']})")

    created_map    = {}   # ref -> linear issue id
    identifier_map = {}   # ref -> identifier (SI-5)

    # ── FASE 1: Proyectos → Milestones → Issues ──────────────────────────
    for mod in MODULES_DATA:
        print(f"\n{'='*58}")
        print(f"📦 {mod['project']}")
        print(f"{'='*58}")

        project_id = create_project(api_key, team["id"], mod["project"], mod["module"])
        print(f"  {'✓ Proyecto creado (ID: '+project_id+')' if project_id else '✗ Sin proyecto'}")
        time.sleep(0.5)

        milestone_id = None
        if project_id:
            milestone_id = create_milestone(api_key, project_id, mod["milestone"], mod["module"])
        time.sleep(0.4)

        for issue_data in mod["issues"]:
            badge = "🔴 **[RUTA CRÍTICA - CPM]**" if issue_data["is_cpm"] else "🟢 **[Paralelo]**"
            deps  = ""
            if issue_data["blocked_by"]:
                deps = "\n\n### Dependencias (bloqueado por)\n" + "\n".join(f"- `{r}`" for r in issue_data["blocked_by"])
            full_desc = f"{badge}\n\n**Módulo:** {mod['module']}\n**Milestone:** {mod['milestone']}\n\n{issue_data['description']}{deps}"

            print(f"\n  ➕ {issue_data['ref']} | {issue_data['title'][:55]}...")
            created = create_issue(api_key, team["id"], project_id, milestone_id,
                                   issue_data["title"], full_desc,
                                   issue_data["priority"], issue_data["estimate"])
            if created:
                created_map[issue_data["ref"]]    = created["id"]
                identifier_map[issue_data["ref"]] = created["identifier"]
                cpm = " 🔴 CPM" if issue_data["is_cpm"] else " 🟢"
                print(f"  ✓ {created['identifier']}{cpm} | prio={issue_data['priority']} est={issue_data['estimate']}pt")
            else:
                print(f"  ✗ FALLO: {issue_data['ref']}")
            time.sleep(0.35)

    # ── FASE 2: Relaciones de bloqueo ────────────────────────────────────
    print(f"\n{'='*58}")
    print("🔗 Vinculando relaciones de bloqueo (blocks)...")
    print(f"{'='*58}")
    ok_count = err_count = 0

    for mod in MODULES_DATA:
        for issue_data in mod["issues"]:
            cur_ref = issue_data["ref"]
            cur_id  = created_map.get(cur_ref)
            cur_key = identifier_map.get(cur_ref, cur_ref)
            if not cur_id: continue

            for blocker_ref in issue_data["blocked_by"]:
                blk_id  = created_map.get(blocker_ref)
                blk_key = identifier_map.get(blocker_ref, blocker_ref)
                if not blk_id:
                    print(f"  ⚠ Blocker no encontrado: {blocker_ref}")
                    continue
                ok = create_relation(api_key, blk_id, cur_id)
                if ok:
                    print(f"  🔒 {blk_key} ──blocks──▶ {cur_key}")
                    ok_count += 1
                else:
                    print(f"  ✗ Error: {blocker_ref} → {cur_ref}")
                    err_count += 1
                time.sleep(0.25)

    # ── RESUMEN ───────────────────────────────────────────────────────────
    total   = len(created_map)
    cpm_cnt = sum(1 for m in MODULES_DATA for i in m["issues"] if i["is_cpm"])
    print(f"\n{'='*58}")
    print("🎉  SUBIDA A LINEAR COMPLETADA")
    print(f"{'='*58}")
    print(f"  📦 Proyectos    : {len(MODULES_DATA)}")
    print(f"  📍 Milestones   : {len(MODULES_DATA)}")
    print(f"  📋 Issues       : {total}")
    print(f"     🔴 CPM       : {cpm_cnt}")
    print(f"     🟢 Paralelas : {total - cpm_cnt}")
    print(f"  🔗 Relaciones   : {ok_count} OK / {err_count} errores")
    print(f"\n  👉 https://linear.app/")
    print(f"{'='*58}\n")

if __name__ == "__main__":
    main()
