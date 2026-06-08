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
actor "Seller" as seller

rectangle {
    usecase "Send Message (1-1 Chat)" as UC1
    usecase "Sync Message Real-time" as UC2
    usecase "Chat with AI Chatbot" as UC3
    usecase "Retrieve Knowledge Base (RAG)" as UC4
}

customer --> UC1
customer --> UC3
seller --> UC1

UC1 ..> UC2 : <<include>>
UC3 ..> UC4 : <<include>>
@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_uc08.puml")
    output_file = os.path.join(dir_path, "uc08_chat.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating uc08_chat...")
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
