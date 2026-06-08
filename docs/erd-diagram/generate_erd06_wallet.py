import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam theme carbon
hide circle

entity "Wallet" as wallet {
  * id : string <<PK>>
  --
  * userId : string <<UK>>
  * balance : float
  * createdAt : datetime
  * updatedAt : datetime
}

entity "WalletTransaction" as walletTransaction {
  * id : string <<PK>>
  --
  * walletId : string <<FK>>
  * userId : string
  * type : string
  * source : string
  referenceId : string
  * amount : float
  * balanceAfter : float
  description : string
  * createdAt : datetime
}

entity "Credit" as credit {
  * id : string <<PK>>
  --
  * shopId : string <<UK>>
  * balance : float
  * createdAt : datetime
  * updatedAt : datetime
}

entity "CreditTransaction" as creditTransaction {
  * id : string <<PK>>
  --
  * creditId : string <<FK>>
  * shopId : string
  * type : string
  * source : string
  referenceId : string
  * amount : float
  * balanceAfter : float
  description : string
  * createdAt : datetime
}

entity "PayoutRequest" as payoutRequest {
  * id : string <<PK>>
  --
  * creditId : string <<FK>>
  * shopId : string
  * amount : float
  * bankName : string
  * accountNumber : string
  * accountHolder : string
  note : string
  * status : string
  rejectReason : string
  processedAt : datetime
  * createdAt : datetime
  * updatedAt : datetime
}

wallet ||--o{ walletTransaction : "records"
credit ||--o{ creditTransaction : "records"
credit ||--o{ payoutRequest : "requests"

@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_erd06.puml")
    output_file = os.path.join(dir_path, "erd06_wallet.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating erd06_wallet.svg...")
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
