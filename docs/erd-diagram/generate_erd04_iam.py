import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam theme carbon
hide circle

entity "User" as user {
  * id : string <<PK>>
  --
  * email : string <<UK>>
  * username : string <<UK>>
  phoneNumber : string
  avatar : string
  birthday : date
  gender : string
  * status : string
  group : string[]
  province : string
  district : string
  ward : string
  * createdAt : datetime
  * updatedAt : datetime
  deletedAt : datetime
}

entity "Permission" as permission {
  * id : string <<PK>>
  --
  * name : string
  description : string
  * path : string
  * method : string
  * module : string
  * group : string
  * createdAt : datetime
  * updatedAt : datetime
  deletedAt : datetime
}

@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_erd04.puml")
    output_file = os.path.join(dir_path, "erd04_iam.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating erd04_iam.svg...")
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
