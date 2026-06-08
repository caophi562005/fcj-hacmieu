import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam packageStyle rect
left to right direction

actor "Seller" as seller

rectangle {
    ' Auth & Account
    usecase "Login Account" as UC_Login
    usecase "Register Merchant Profile" as UC_Reg_Merchant
    usecase "Manage Shop Profile" as UC_Shop_Profile
    usecase "Logout Account" as UC_Logout
    
    ' Catalog Management
    usecase "Manage Products (CRUD)" as UC_Products
    usecase "Manage Product Attributes" as UC_Attr
    usecase "Upload Product Video" as UC_Video_Upload
    usecase "Transcode Video to HLS" as UC_Transcode
    
    ' Orders & Reviews
    usecase "Manage Shop Orders" as UC_Orders
    usecase "Reply to Customer Reviews" as UC_Review_Reply
    usecase "View AI Review Summary" as UC_AI_Review
    
    ' Financials
    usecase "View Shop Credit & Revenue" as UC_Credit
    usecase "Request Payout (Withdrawal)" as UC_Payout
    usecase "Verify Bank Account Info" as UC_Verify_Bank
}

seller --> UC_Login
seller --> UC_Reg_Merchant
seller --> UC_Shop_Profile
seller --> UC_Logout
seller --> UC_Products
seller --> UC_Orders
seller --> UC_Review_Reply
seller --> UC_Credit
seller --> UC_Payout

UC_Products ..> UC_Attr : <<include>>
UC_Products ..> UC_Video_Upload : <<extend>>
UC_Video_Upload ..> UC_Transcode : <<include>>
UC_Review_Reply ..> UC_AI_Review : <<extend>>
UC_Payout ..> UC_Credit : <<include>>
UC_Payout ..> UC_Verify_Bank : <<include>>
@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_uc02.puml")
    output_file = os.path.join(dir_path, "uc02_seller.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating uc02_seller...")
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
