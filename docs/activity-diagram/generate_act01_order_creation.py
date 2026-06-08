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
:Chọn cart items theo shopId;
:Nhập thông tin giao hàng\n(receiver: name, phone, address);

if (Có discount code?) then (có)
  :gRPC CheckPromotion\n(promotion-service);
  if (Promotion hợp lệ?) then (không)
    :Báo lỗi: invalid code; <<#pink>>
    detach
  else (có)
    :Tính discount amount;
  endif
else (không)
endif

if (Dùng V-Xu?) then (có)
  :gRPC GetMyWallet\n(wallet-service);
  if (Đủ số dư?) then (không)
    :Báo lỗi: insufficient balance; <<#pink>>
    detach
  else (có)
    :Tính coin deduction;
  endif
else (không)
endif

:gRPC ValidateCartItems\n(order-service);
:gRPC ValidateProducts\n(catalog-service);

if (Stock đủ?) then (không)
  :Báo lỗi: out of stock; <<#pink>>
  kill
else (có)
  :Tính toán totals\n(itemTotal, shippingFee, discount, grandTotal);
  :Tạo Order records trong DB\n(status = CREATING);
  
  if (Dùng coin?) then (có)
    :gRPC AdjustWallet\n(DEBIT, ORDER_PAYMENT);
  else (không)
  endif
  
  fork
    :SQS: create_payment\n(payment-service tạo Payment);
  fork again
    :SQS: create_order\n(utility-service gửi notification);
  fork again
    if (Có promotion?) then (có)
      :SQS: create_redemption\n(promotion-service tạo Redemption);
    else (không)
    endif
  end fork
  
  :Return orders list;
endif
stop
@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_act01.puml")
    output_file = os.path.join(dir_path, "act01_order_creation.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating act01_order_creation...")
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
