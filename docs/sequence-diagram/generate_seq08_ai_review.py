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
participant "utility-service" as US
participant "ai-service" as AIS
participant "Groq API" as Groq

Customer -> CW : Viết đánh giá sản phẩm\\n{rating:5, content:"...", mediaUrls:[]}
CW -> CBFF : POST /api/v1/utility/review\\n{productId, orderId, orderItemId,\\nrating, content, mediaUrls}
CBFF -> US : gRPC CreateReview(data)

US -> US : INSERT Review\\n(unique: userId + orderItemId)
US -> US : UPSERT RatingAggregate\\n(productId)\\naverageRating, totalReviews,\\nstar5Count++

US -> AIS : gRPC GenerateReviewSummary(productId)\\n[fire-and-forget]
US --> CBFF : ReviewResponse
CBFF --> CW : 201 Created
CW --> Customer : "Đánh giá đã được gửi"

note over AIS, Groq : Async - không block response

AIS -> US : gRPC GetManyReviews\\n{productId, limit:100}
US --> AIS : {reviews: Review[]}

alt reviews.length < 5
    AIS -> AIS : Skip - chưa đủ data
else reviews.length >= 5
    AIS -> AIS : findUnique ReviewSummary(productId)
    alt Cache valid\\n(< 7 ngày AND < 3 reviews mới)
        AIS -> AIS : Skip - cache còn valid
    else Cần regenerate
        AIS -> Groq : POST /chat/completions\\nmodel: moonshotai/kimi-k2-instruct-0905\\nprompt: "Phân tích reviews sau...\\n[review texts]"
        Groq --> AIS : {pros:[], cons:[], summary:"..."}
        AIS -> AIS : Parse JSON response
        AIS -> AIS : UPSERT ReviewSummary\\n{productId, pros, cons, summary,\\nreviewCount, lastReviewAt}
    end
end

note over Customer, Groq : Customer xem summary sau

Customer -> CW : Xem trang sản phẩm
CW -> CBFF : GET /api/v1/ai/review-summary/:productId
CBFF -> AIS : gRPC GetReviewSummary(productId)
AIS --> CBFF : {pros:["Chất lượng tốt","Giao nhanh"],\\ncons:["Size hơi nhỏ"],\\nsummary:"...", reviewCount:47}
CBFF --> CW : ReviewSummaryResponse
CW --> Customer : Hiển thị AI Summary\\n✅ Ưu điểm / ❌ Nhược điểm

@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_seq08.puml")
    output_file = os.path.join(dir_path, "seq08_ai_review.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating seq08_ai_review.svg...")
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
