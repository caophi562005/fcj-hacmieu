import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam packageStyle rect
left to right direction

actor "Customer" as customer

rectangle {
    ' Auth Group
    usecase "Login Account" as UC_Login
    usecase "Register Account" as UC_Reg
    usecase "Change Password" as UC_Pass
    usecase "Logout Account" as UC_Logout
    usecase "Authenticate OIDC" as UC_Auth
    
    ' Catalog Group
    usecase "Search & Filter Products" as UC_Search
    usecase "View Product Detail" as UC_Detail
    usecase "View AI Review Summary" as UC_AI_Rev
    usecase "Watch Product Video" as UC_Video
    
    ' Cart & Order
    usecase "Manage Cart" as UC_Cart
    usecase "Create Order" as UC_Order
    usecase "Apply Discount Voucher" as UC_Voucher
    usecase "Pay via V-Xu Wallet" as UC_Pay_Xu
    usecase "Pay via VietQR Code" as UC_Pay_QR
    
    ' Social & Wallet
    usecase "Top up V-Xu Balance" as UC_Topup
    usecase "Chat with Shop (1-1)" as UC_Chat
    usecase "Chat with AI Agent" as UC_AI_Chat
    usecase "Write Product Review" as UC_Review
    usecase "Upload Review Media" as UC_Media
}

customer --> UC_Login
customer --> UC_Reg
customer --> UC_Pass
customer --> UC_Logout
customer --> UC_Search
customer --> UC_Detail
customer --> UC_Cart
customer --> UC_Order
customer --> UC_Topup
customer --> UC_Chat
customer --> UC_AI_Chat
customer --> UC_Review

UC_Login ..> UC_Auth : <<include>>
UC_Detail ..> UC_AI_Rev : <<include>>
UC_Detail ..> UC_Video : <<extend>>
UC_Order ..> UC_Cart : <<include>>
UC_Order ..> UC_Voucher : <<extend>>
UC_Order ..> UC_Pay_Xu : <<extend>>
UC_Order ..> UC_Pay_QR : <<extend>>
UC_Review ..> UC_Media : <<extend>>
@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_uc01.puml")
    output_file = os.path.join(dir_path, "uc01_customer.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating uc01_customer...")
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
