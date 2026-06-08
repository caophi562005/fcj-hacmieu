import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam theme carbon
hide circle

entity "Payment" as payment {
  * id : string <<PK>>
  --
  * code : string <<UK>>
  * userId : string
  * orderId : string[]
  * method : string
  * status : string
  * amount : float
  * createdAt : datetime
  * updatedAt : datetime
  deletedAt : datetime
}

entity "Transaction" as transaction {
  * id : int <<PK>>
  --
  * gateway : string
  * transactionDate : datetime
  * accountNumber : string
  subAccount : string
  * amountIn : float
  * amountOut : float
  * accumulated : float
  code : string
  transactionContent : string
  referenceNumber : string
  body : string
}

entity "Refund" as refund {
  * id : string <<PK>>
  --
  * userId : string
  * orderId : string
  * amount : float
  * status : string
  reason : string
  * createdAt : datetime
  * updatedAt : datetime
  deletedAt : datetime
}

payment ||--o{ transaction : "matched by code in content"
payment ||--o{ refund : "refunded via"

@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_erd02.puml")
    output_file = os.path.join(dir_path, "erd02_payment.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating erd02_payment.svg...")
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
