import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam theme carbon
autonumber

actor Customer
participant "customer-web" as CW
participant "customer-bff" as CBFF
participant "catalog-service" as CS
participant "ai-service" as AIS

Customer -> CW : Tìm kiếm "áo thun nam"
CW -> CBFF : GET /api/v1/catalog/product\\n?name=áo thun nam&page=1&limit=20\\n(Public - no auth)

CBFF -> CS : gRPC GetManyProducts\\n{name, page, limit, isApproved:true,\\nstatus:ACTIVE}
CS -> CS : Prisma query với filters\\n(name ILIKE, isApproved, status)
CS --> CBFF : {page, limit, totalItems,\\ntotalPages, products:[...]}
CBFF --> CW : ProductListResponse
CW --> Customer : Hiển thị danh sách sản phẩm

Customer -> CW : Click vào sản phẩm
CW -> CBFF : GET /api/v1/catalog/product/:id\\n(Public)
CBFF -> CS : gRPC GetProduct(id)
CS --> CBFF : ProductResponse\\n{id, name, basePrice, images,\\nskus, brand, categories,\\nratingCount, averageRate}
CBFF --> CW : ProductDetailResponse

alt Tải AI Review Summary
    CW -> CBFF : GET /api/v1/ai/review-summary/:productId\\n(Public)
    CBFF -> AIS : gRPC GetReviewSummary(productId)
    AIS -> AIS : findUnique ReviewSummary(productId)
    alt Summary tồn tại
        AIS --> CBFF : {pros[], cons[], summary,\\nreviewCount, lastReviewAt}
    else Chưa có summary
        AIS --> CBFF : null
    end
    CBFF --> CW : ReviewSummaryResponse
end

CW --> Customer : Hiển thị chi tiết sản phẩm\\n+ AI Summary (pros/cons)

@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_seq05.puml")
    output_file = os.path.join(dir_path, "seq05_product_search.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating seq05_product_search.svg...")
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
