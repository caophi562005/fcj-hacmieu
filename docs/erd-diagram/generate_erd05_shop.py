import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam theme carbon
hide circle

entity "Merchant" as merchant {
  * id : string <<PK>>
  --
  * userId : string <<UK>>
  * type : string
  legalName : string
  taxCode : string
  * approvalStatus : string
  * canSell : boolean
  * createdAt : datetime
  * updatedAt : datetime
  deletedAt : datetime
}

entity "Shop" as shop {
  * id : string <<PK>>
  --
  * merchantId : string <<FK>>
  * userId : string
  * name : string
  description : string
  logo : string
  banner : string
  phone : string
  * status : string
  pickupAddress : json
  returnAddress : json
  bankName : string
  bankAccountNumber : string
  bankCode : string
  bankAccountName : string
  * createdAt : datetime
  * updatedAt : datetime
  deletedAt : datetime
}

merchant ||--|| shop : "owns"

@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_erd05.puml")
    output_file = os.path.join(dir_path, "erd05_shop.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating erd05_shop.svg...")
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
