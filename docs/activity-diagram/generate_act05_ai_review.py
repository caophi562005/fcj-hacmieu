import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam theme carbon
skinparam ActivityBackgroundColor #FEFEFE
skinparam ActivityBorderColor #2D3748
skinparam ActivityStartColor #2D3748
skinparam ActivityEndColor #2D3748
skinparam ArrowColor #4A5568

start
:POST /utility/review\n→ customer-bff\n→ gRPC CreateReview;
:utility-service lưu Review vào DB;
:Cập nhật RatingAggregate\naverageRating, totalReviews,\nstar1-5Count;
:Fire-and-forget gRPC GenerateReviewSummary\n→ ai-service;
:ai-service nhận request productId;
:gRPC GetManyReviews\n→ utility-service\nlimit: 100;

if (Số reviews ≥ 5?) then (không)
  :Skip: chưa đủ data;
  end
else (có)
  if (ReviewSummary đã có trong DB?) then (có)
    if (Cache < 7 ngày\nAND < 3 reviews mới?) then (có)
      :Skip: cache còn valid;
      end
    else (không)
      :Chuẩn bị prompt với review texts;
    endif
  else (không)
    :Chuẩn bị prompt với review texts;
  endif
  
  :Call Groq API\nmodel: kimi-k2-instruct-0905\nprompt: phân tích ưu/nhược;
  
  if (API response OK?) then (không)
    :Error: log & skip; <<#pink>>
    end
  else (có)
    :Parse JSON response:\npros, cons, summary;
    :Upsert ReviewSummary trong DB\nproductId unique;
    :End: Summary updated;
  endif
endif
stop
@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_act05.puml")
    output_file = os.path.join(dir_path, "act05_ai_review.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating act05_ai_review...")
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
