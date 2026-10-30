#!/usr/bin/env python3
import subprocess
import time
import json

REPO = "aron-quito/si-salud"

def delete_issues():
    # Obtener todas las issues excepto la #1
    res = subprocess.run(f"gh issue list -R {REPO} --limit 50 --json number,title", shell=True, capture_output=True, text=True)
    if res.returncode == 0:
        issues = json.loads(res.stdout)
        for issue in issues:
            num = issue["number"]
            if num != 1: # Mantener la issue #1 original
                print(f"Eliminando issue #{num}...")
                subprocess.run(f"gh issue delete {num} --yes -R {REPO}", shell=True)
                time.sleep(0.5)

def delete_milestones():
    res = subprocess.run(f"gh api repos/{REPO}/milestones", shell=True, capture_output=True, text=True)
    if res.returncode == 0:
        milestones = json.loads(res.stdout)
        for m in milestones:
            num = m["number"]
            print(f"Eliminando milestone #{num} ({m['title']})...")
            subprocess.run(f"gh api repos/{REPO}/milestones/{num} -X DELETE", shell=True)

if __name__ == "__main__":
    print("Iniciando eliminación de issues en GitHub...")
    delete_issues()
    print("Iniciando eliminación de milestones en GitHub...")
    delete_milestones()
    print("Limpieza en GitHub completada.")
