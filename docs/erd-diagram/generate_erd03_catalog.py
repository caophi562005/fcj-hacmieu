import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam theme carbon
hide circle

entity "Product" as product {
  * id : string <<PK>>
  --
  * name : string
  description : string
  province : string
  district : string
  ward : string
  sizeGuide : string
  * basePrice : float
  * virtualPrice : float
  brandId : string <<FK>>
  images : string[]
  variants : json
  * shopId : string
  * status : string
  * likeCount : int
  * ratingCount : int
  * ratingSum : float
  * averageRate : float
  attributes : json
  * soldCount : int
  * viewCount : int
  * isApproved : boolean
  * isHidden : boolean
  * createdAt : datetime
  * updatedAt : datetime
  deletedAt : datetime
}

entity "SKU" as sku {
  * id : string <<PK>>
  --
  * value : string
  * price : float
  * stock : int
  image : string
  * productId : string <<FK>>
}

entity "Category" as category {
  * id : string <<PK>>
  --
  * name : string
  logo : string
  parentCategoryId : string <<FK>>
  * createdAt : datetime
  * updatedAt : datetime
  deletedAt : datetime
}

entity "Brand" as brand {
  * id : string <<PK>>
  --
  logo : string
  * name : string <<UK>>
  * createdAt : datetime
  * updatedAt : datetime
  deletedAt : datetime
}

entity "Attribute" as attribute {
  * id : string <<PK>>
  --
  * name : string <<UK>>
  url : string
  * createdAt : datetime
  * updatedAt : datetime
  deletedAt : datetime
}

product }o--|| brand : "belongs to"
product }o--o{ category : "tagged with (M2M)"
product ||--o{ sku : "has variants"
category ||--o{ category : "parent-child (self-ref)"

@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_erd03.puml")
    output_file = os.path.join(dir_path, "erd03_catalog.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating erd03_catalog.svg...")
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
