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
:Đọc headers:\nX-SePay-Signature\nX-SePay-Timestamp;

if (Headers tồn tại?) then (không)
  :401 Unauthorized:\nMissing headers; <<#pink>>
  end
else (có)
  :Tính HMAC-SHA256\npayload = timestamp.rawBody\nexpected = sha256=hex;
  if (timingSafeEqual\nexpected == signature?) then (không)
    :401 Unauthorized:\nInvalid signature; <<#pink>>
    end
  else (có)
    :gRPC Receiver (payment-service);
    if (Transaction id đã tồn tại?) then (có)
      :404 TransactionAlreadyExists; <<#pink>>
      end
    else (không)
      :Lưu Transaction record;
      if (data.code != null?) then (có)
        :paymentCode = data.code;
      else (không)
        :Extract code từ content\nregex: /A-Z+\\\\d6A-Z0-96/;
        if (Tìm thấy code?) then (có)
          :paymentCode = data.code;
        else (không)
          :paymentCode = data.content;
        endif
      endif
      
      :findUnique Payment where code = paymentCode;
      
      if (Payment tồn tại?) then (không)
        :404 PaymentNotFound; <<#pink>>
        end
      else (có)
        if (amount == transferAmount?) then (không)
          :400 AmountPriceMismatch; <<#pink>>
          end
        else (có)
          :Update Payment status = SUCCESS;
          if (payment.orderId rỗng?) then (có = Topup)
            :gRPC AdjustWallet\n(CREDIT, TOPUP, userId);
          else (không = Order payment)
            :gRPC PaidOrderByPayment\n(order-service);
          endif
          :Return paymentCode,\npaymentId, userId;
          :customer-bff publish\nSSE event → userId;
          :End: 200 OK;
        endif
      endif
    endif
  endif
endif
stop
@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_act02.puml")
    output_file = os.path.join(dir_path, "act02_sepay_webhook.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating act02_sepay_webhook...")
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
