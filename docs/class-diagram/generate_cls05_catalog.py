import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam classAttributeIconSize 0
left to right direction

class ProductController {
    - catalogService: CatalogService
    + getManyProducts(query): Promise<GetManyProductsResponse>
    + getProduct(id): Promise<ProductResponse>
    + createProduct(body, shopId): Promise<ProductResponse>
    + updateProduct(id, body): Promise<ProductResponse>
    + deleteProduct(id): Promise<DeleteProductResponse>
}

class CatalogService {
    - catalogGrpc: ClientGrpc
    + getManyProducts(query): Promise<GetManyProductsResponse>
    + getProduct(id): Promise<ProductResponse>
    + createProduct(data): Promise<ProductResponse>
    + updateProduct(data): Promise<ProductResponse>
    + deleteProduct(id): Promise<DeleteProductResponse>
    + validateProducts(items): Promise<ValidateProductsResponse>
    + getManyCategories(query): Promise<GetManyCategoriesResponse>
    + getManyBrands(query): Promise<GetManyBrandsResponse>
}

enum ProductStatus {
    ACTIVE
    INACTIVE
    BANNED
    DRAFT
}

class GetManyProductsQuery {
    + page: number
    + limit: number
    + name: string
    + shopId: string
    + categories: string[]
    + brandId: string
    + minPrice: number
    + maxPrice: number
    + isApproved: boolean
}

class ProductResponse {
    + id: string
    + name: string
    + basePrice: number
    + virtualPrice: number
    + images: string[]
    + variants: json
    + skus: SKUResponse[]
    + brand: BrandResponse
    + categories: CategoryResponse[]
    + shopId: string
    + status: ProductStatus
    + likeCount: number
    + ratingCount: number
    + averageRate: number
    + soldCount: number
    + isApproved: boolean
}

ProductController "1" o-- "1" CatalogService : delegates
CatalogService "1" ..> "1" GetManyProductsQuery : accepts
CatalogService "1" ..> "1" ProductResponse : returns
ProductResponse "1" --> "1" ProductStatus : has
@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_cls05.puml")
    output_file = os.path.join(dir_path, "cls05_catalog.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating cls05_catalog...")
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
