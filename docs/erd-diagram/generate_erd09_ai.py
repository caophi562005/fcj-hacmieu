import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam theme carbon
hide circle

entity "ReviewSummary" as reviewSummary {
  * id : string <<PK>>
  --
  * productId : string <<UK>>
  pros : string[]
  cons : string[]
  * summary : string
  * reviewCount : int
  lastReviewAt : datetime
  * createdAt : datetime
  * updatedAt : datetime
}

@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_erd09.puml")
    output_file = os.path.join(dir_path, "erd09_ai.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating erd09_ai.svg...")
    try:
        server.processes_file(puml_file, outfile=output_file)
        print(f"Success! Generated: {output_file}")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
    finally:
        if os.path.exists(puml_file):
            os.remove(puml_file)

if __name__ == "__main__":
    generate()
