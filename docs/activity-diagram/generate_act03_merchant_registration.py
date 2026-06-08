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
:Seller điền form Merchant\ntype: INDIVIDUAL / BUSINESS\nlegalName, taxCode;
:POST /shop/merchant\n→ seller-bff\n→ gRPC CreateMerchant;
:Tạo Merchant record\nstatus = PENDING\ncanSell = false;
:Gửi notification cho Admin;
:Admin nhận notification;
:Admin xem danh sách Merchant PENDING;

if (Admin quyết định) then (APPROVED)
  :Update Merchant\nstatus = APPROVED\ncanSell = true;
  :Tạo Shop record\nstatus = DRAFT;
  :Gửi notification cho Seller: được duyệt;
  :Seller cập nhật Shop\nname, logo, banner,\nphone, address, bank;
  :Update Shop\nstatus = ACTIVE;
  :Seller có thể tạo sản phẩm;
  :End: Shop hoạt động;
else (REJECTED)
  :Update Merchant\nstatus = REJECTED;
  :Gửi notification cho Seller: bị từ chối;
  :End: Đăng ký thất bại; <<#pink>>
endif
stop
@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_act03.puml")
    output_file = os.path.join(dir_path, "act03_merchant_registration.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating act03_merchant_registration...")
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
