import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam packageStyle rect
left to right direction

actor "Seller" as seller

rectangle {
    usecase "Register Merchant" as UC1
    usecase "Manage Shop Profile" as UC2
    usecase "Manage Products (CRUD)" as UC3
    usecase "Upload Product Video" as UC4
    usecase "Transcode Video to HLS" as UC5
}

seller --> UC1
seller --> UC2
seller --> UC3

UC3 ..> UC4 : <<extend>>
UC4 ..> UC5 : <<include>>
@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_uc07.puml")
    output_file = os.path.join(dir_path, "uc07_store.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating uc07_store...")
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
