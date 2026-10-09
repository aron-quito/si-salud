import os
from plantuml import PlantUML

os.makedirs("renders", exist_ok=True)
puml = PlantUML(url='http://www.plantuml.com/plantuml/png/')

for file in os.listdir("."):
    if file.endswith(".puml"):
        output_file = f"renders/{file.replace('.puml', '.png')}"
        try:
            puml.processes_file(file, outfile=output_file)
            print(f"Rendered {file} to {output_file}")
        except Exception as e:
            print(f"Error rendering {file}: {e}")
