import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam theme carbon
hide circle

entity "Notification" as notification {
  * id : string <<PK>>
  --
  * userId : string
  * type : string
  * title : string
  * description : string
  link : string
  image : string
  * isRead : boolean
  metadata : json
  * createdAt : datetime
  * updatedAt : datetime
  deletedAt : datetime
}

entity "Review" as review {
  * id : string <<PK>>
  --
  * userId : string
  * sellerId : string
  * productId : string
  * orderId : string
  * orderItemId : string <<UK>>
  * rating : int
  content : string
  mediaUrls : string[]
  * createdAt : datetime
  * updatedAt : datetime
  deletedAt : datetime
}

entity "ReviewReply" as reviewReply {
  * id : string <<PK>>
  --
  * reviewId : string <<FK>>
  * sellerId : string
  * content : string
  * createdAt : datetime
  * updatedAt : datetime
}

entity "RatingAggregate" as ratingAggregate {
  * id : string <<PK>>
  --
  * productId : string <<UK>>
  * averageRating : float
  * totalReviews : int
  * star1Count : int
  * star2Count : int
  * star3Count : int
  * star4Count : int
  * star5Count : int
}

entity "Report" as report {
  * id : string <<PK>>
  --
  * reporterId : string
  * targetType : string
  * targetId : string
  * category : string
  * title : string
  * description : string
  * status : string
  assigneeAdminId : string
  closedAt : datetime
  media : string[]
  action : string
  * createdAt : datetime
  * updatedAt : datetime
}

entity "Video" as video {
  * id : string <<PK>>
  --
  * shopId : string
  productId : string
  * status : string
  * isHidden : boolean
  * duration : float
  * width : int
  * height : int
  * likeCount : int
  * uploadedById : string
  * createdAt : datetime
  * updatedAt : datetime
  deletedAt : datetime
}

review ||--o| reviewReply : "has reply"
review }o--|| ratingAggregate : "aggregated into"

@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_erd07.puml")
    output_file = os.path.join(dir_path, "erd07_utility.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating erd07_utility.svg...")
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
