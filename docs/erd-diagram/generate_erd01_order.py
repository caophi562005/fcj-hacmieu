import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam theme carbon
hide circle

entity "Order" as order {
  * id : string <<PK>>
  --
  * code : string <<UK>>
  * userId : string
  * shopId : string
  * status : string
  * itemTotal : float
  * shippingFee : float
  * discount : float
  * grandTotal : float
  * receiver : json
  * paymentMethod : string
  * paymentStatus : string
  paymentId : string
  timeline : json
  * createdAt : datetime
  * updatedAt : datetime
  deletedAt : datetime
}

entity "OrderItem" as orderItem {
  * id : string <<PK>>
  --
  * orderId : string <<FK>>
  * productId : string
  * skuId : string
  * shopId : string
  * productName : string
  skuValue : string
  * quantity : int
  * price : float
  * total : float
  productImage : string
}

entity "Cart" as cart {
  * id : string <<PK>>
  --
  * userId : string <<UK>>
  * itemCount : int
  * createdAt : datetime
  * updatedAt : datetime
}

entity "CartItem" as cartItem {
  * id : string <<PK>>
  --
  * cartId : string <<FK>>
  * productId : string
  * skuId : string
  * shopId : string
  * quantity : int
  * productName : string
  skuValue : string
  productImage : string
}

order ||--o{ orderItem : "contains"
cart ||--o{ cartItem : "contains"

@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_erd01.puml")
    output_file = os.path.join(dir_path, "erd01_order.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating erd01_order.svg...")
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
