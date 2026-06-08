import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam packageStyle rect
left to right direction

actor "Admin" as admin

rectangle {
    ' User & Permission
    usecase "Login Dashboard" as UC_Login
    usecase "Manage System Users" as UC_Users
    usecase "Configure Roles & Permissions" as UC_RBAC
    
    ' Approvals & Deactivations
    usecase "Approve Merchant Registrations" as UC_Approve_Merch
    usecase "Approve Payout Requests" as UC_Approve_Payout
    usecase "Audit Shop Balance" as UC_Audit_Balance
    
    ' Catalog & Content
    usecase "Manage System Categories & Brands" as UC_Catalog
    usecase "Moderate Reported Content" as UC_Moderate
    usecase "Delete Inappropriate Reviews" as UC_Del_Review
    
    ' Orders, Payments & Vouchers
    usecase "Manage System Promotions" as UC_Promotions
    usecase "Track Platform Transactions" as UC_Transactions
    usecase "Process Order Refund" as UC_Refund
}

admin --> UC_Login
admin --> UC_Users
admin --> UC_Approve_Merch
admin --> UC_Approve_Payout
admin --> UC_Catalog
admin --> UC_Moderate
admin --> UC_Promotions
admin --> UC_Transactions

UC_Users ..> UC_RBAC : <<include>>
UC_Approve_Payout ..> UC_Audit_Balance : <<include>>
UC_Transactions ..> UC_Refund : <<extend>>
UC_Moderate ..> UC_Del_Review : <<extend>>
@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_uc03.puml")
    output_file = os.path.join(dir_path, "uc03_admin.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating uc03_admin...")
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
