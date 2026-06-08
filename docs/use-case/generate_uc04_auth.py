import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam packageStyle rect
left to right direction

actor "Actor" as actor

rectangle {
    usecase "Login" as UC1
    usecase "Register" as UC2
    usecase "Authenticate & Issue JWT" as UC3
    usecase "Check Access Control (RBAC)" as UC4
    usecase "Logout" as UC5
}

actor --> UC1
actor --> UC2
actor --> UC5

UC1 ..> UC3 : <<include>>
UC3 ..> UC4 : <<include>>
@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_uc04.puml")
    output_file = os.path.join(dir_path, "uc04_auth.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating uc04_auth...")
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
