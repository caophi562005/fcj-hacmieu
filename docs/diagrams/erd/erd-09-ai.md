# ERD-09: AI Service

```mermaid
erDiagram
    ReviewSummary {
        string id PK
        string productId UK "ref: catalog-service.Product"
        string[] pros
        string[] cons
        string summary
        int reviewCount
        datetime lastReviewAt
        datetime createdAt
        datetime updatedAt
    }
```
