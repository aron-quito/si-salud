#!/usr/bin/env python3
import subprocess
import time

REPO = "aron-quito/si-salud"

DEPENDENCIES = {
    2: {"blocked_by": [], "blocks": [4]},
    3: {"blocked_by": [], "blocks": [4]},
    4: {"blocked_by": [2, 3], "blocks": [5, 9, 13]},
    5: {"blocked_by": [4], "blocks": [6, 11]},
    6: {"blocked_by": [5], "blocks": [7]},
    7: {"blocked_by": [6], "blocks": [8]},
    8: {"blocked_by": [7], "blocks": [12]},
    9: {"blocked_by": [4], "blocks": [10, 16]},
    10: {"blocked_by": [9], "blocks": []},
    11: {"blocked_by": [9, 5], "blocks": [26]},
    12: {"blocked_by": [8], "blocks": [15]},
    13: {"blocked_by": [4], "blocks": [14, 15]},
    14: {"blocked_by": [13], "blocks": []},
    15: {"blocked_by": [12, 13], "blocks": [17, 19]},
    16: {"blocked_by": [9], "blocks": [17]},
    17: {"blocked_by": [15, 16], "blocks": [18, 20, 24, 28]},
    18: {"blocked_by": [17], "blocks": [21]},
    19: {"blocked_by": [15, 16], "blocks": []},
    20: {"blocked_by": [17], "blocks": [21]},
    21: {"blocked_by": [20, 18], "blocks": [22]},
    22: {"blocked_by": [21, 17], "blocks": []},
    23: {"blocked_by": [17], "blocks": []},
    24: {"blocked_by": [17], "blocks": [25]},
    28: {"blocked_by": [17], "blocks": [25]},
    25: {"blocked_by": [24, 28], "blocks": [26]},
    26: {"blocked_by": [25, 11], "blocks": [27]},
    27: {"blocked_by": [26], "blocks": []}
}

def update_issue(issue_num, deps):
    # Obtener body actual
    res = subprocess.run(f"gh issue view {issue_num} -R {REPO} --json body,title", shell=True, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error leyendo issue #{issue_num}")
        return
    import json
    data = json.loads(res.stdout)
    body = data["body"]
    
    # Construir sección de bloqueo interactivo nativo
    blocked_by_text = "\n".join([f"- [ ] #{b}" for b in deps["blocked_by"]]) if deps["blocked_by"] else "*(Ninguna - Tarea Inicial)*"
    blocks_text = ", ".join([f"#{b}" for b in deps["blocks"]]) if deps["blocks"] else "*(Ninguna - Tarea Terminal)*"
    
    dep_section = f"""### Dependencias Interactivas (GitHub Tasklist)
**Bloqueado por (Requisitos previos obligatorios):**
{blocked_by_text}

**Desbloquea (Tareas sucesoras):**
{blocks_text}
"""
    # Si ya tiene Dependencias y CPM, anexar o reemplazar
    new_body = body + "\n\n" + dep_section
    
    # Actualizar issue
    cmd = ["gh", "issue", "edit", str(issue_num), "-R", REPO, "--body", new_body]
    edit_res = subprocess.run(cmd, capture_output=True, text=True)
    if edit_res.returncode == 0:
        print(f"✓ Issue #{issue_num} vinculada con éxito ({len(deps['blocked_by'])} requisitos)")
    else:
        print(f"✗ Error editando #{issue_num}: {edit_res.stderr}")

def main():
    print("Vinculando dependencias interactivas nativas en GitHub...")
    for issue_num, deps in DEPENDENCIES.items():
        update_issue(issue_num, deps)
        time.sleep(1)
    print("Vinculación completa.")

if __name__ == "__main__":
    main()
