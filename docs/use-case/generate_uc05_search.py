import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam packageStyle rect
left to right direction

actor "Customer" as customer

rectangle {
    usecase "Search Product by Keyword" as UC1
    usecase "Filter Product by Category" as UC2
    usecase "View Product Detail" as UC3
    usecase "View AI Review Summary" as UC4
    usecase "View Customer Reviews" as UC5
}

customer --> UC1
customer --> UC3

UC1 ..> UC2 : <<extend>>
UC3 ..> UC4 : <<include>>
UC3 ..> UC5 : <<include>>
@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_uc05.puml")
    output_file = os.path.join(dir_path, "uc05_search.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating uc05_search...")
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
