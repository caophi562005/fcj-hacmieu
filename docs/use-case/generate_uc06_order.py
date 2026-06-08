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
    usecase "Add Product to Cart" as UC1
    usecase "Checkout & Select Payment" as UC2
    usecase "Pay via V-Xu Wallet" as UC3
    usecase "Pay via VietQR Code" as UC4
    usecase "Verify Transaction via SePay Webhook" as UC5
    usecase "Deduct Wallet Balance" as UC6
}

customer --> UC1
customer --> UC2

UC2 ..> UC3 : <<extend>>
UC2 ..> UC4 : <<extend>>
UC4 ..> UC5 : <<include>>
UC3 ..> UC6 : <<include>>
@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_uc06.puml")
    output_file = os.path.join(dir_path, "uc06_order.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating uc06_order...")
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
