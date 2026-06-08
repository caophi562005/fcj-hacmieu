import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam theme carbon
hide circle

entity "Promotion" as promotion {
  * id : string <<PK>>
  --
  * code : string <<UK>>
  * name : string
  description : string
  * status : string
  * startsAt : datetime
  * endsAt : datetime
  * scope : string
  * minOrderSubtotal : float
  * discountType : string
  * discountValue : float
  * maxDiscount : float
  * totalLimit : int
  * usedCount : int
  * createdAt : datetime
  * updatedAt : datetime
  deletedAt : datetime
}

entity "Redemption" as redemption {
  * id : string <<PK>>
  --
  * promotionId : string <<FK>>
  * userId : string
  orderIds : string[]
  * code : string <<UK>>
  * discountType : string
  * discountValue : float
  * minOrderSubtotal : float
  * maxDiscount : float
  * claimedAt : datetime
  usedAt : datetime
  cancelledAt : datetime
}

promotion ||--o{ redemption : "claimed by users"

@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_erd08.puml")
    output_file = os.path.join(dir_path, "erd08_promotion.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating erd08_promotion.svg...")
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
