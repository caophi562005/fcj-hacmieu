import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam theme carbon
autonumber

actor Seller
participant "seller-web" as SW
participant "seller-bff" as SBFF
participant "order-service" as OS
participant SQS
participant "wallet-service" as WS

note over OS, WS : Triggered khi order → COMPLETED

Seller -> SW : Cập nhật trạng thái giao hàng
SW -> SBFF : PUT /api/v1/order/order/status\\n{orderId, status:SHIPPING}
SBFF -> OS : gRPC UpdateStatusOrder\\n(CONFIRMED → SHIPPING)
OS -> OS : UPDATE Order status=SHIPPING
OS --> SBFF : OrderResponse
SBFF --> SW : OK

note over OS, WS : Sau khi giao hàng thành công

SW -> SBFF : PUT /api/v1/order/order/status\\n{orderId, status:COMPLETED}
SBFF -> OS : gRPC UpdateStatusOrder\\n(SHIPPING → COMPLETED)
OS -> OS : UPDATE Order status=COMPLETED
OS -> SQS : SendMessage settle_order_revenue\\n{shopId, orderId, amount:grandTotal,\\ncommissionRate}
OS --> SBFF : OrderResponse
SBFF --> SW : OK

SQS -> WS : Consumer settle_order_revenue
WS -> WS : findUnique Credit(shopId)\\nINSERT CreditTransaction\\n{type:CREDIT, source:ORDER_REVENUE,\\nreferenceId:orderId, amount}
WS -> WS : UPDATE Credit balance += amount

note over Seller, WS : Seller xem doanh thu

Seller -> SW : Xem doanh thu
SW -> SBFF : GET /api/v1/wallet/credit/me
SBFF -> WS : gRPC GetShopCredit(shopId)
WS --> SBFF : {balance, shopId}
SBFF --> SW : CreditResponse
SW --> Seller : Số dư: X VNĐ

Seller -> SW : Xem lịch sử giao dịch
SW -> SBFF : GET /api/v1/wallet/credit/transactions
SBFF -> WS : gRPC GetShopCreditTransactions(shopId)
WS --> SBFF : {transactions: CreditTransaction[]}
SBFF --> SW : CreditTransactionsResponse

Seller -> SW : Xem thống kê doanh thu
SW -> SBFF : GET /api/v1/wallet/credit/revenue-summary
SBFF -> WS : gRPC GetShopRevenueSummary(shopId)
WS --> SBFF : {totalRevenue, thisMonth, lastMonth}
SBFF --> SW : RevenueSummaryResponse
SW --> Seller : Dashboard doanh thu

@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_seq10.puml")
    output_file = os.path.join(dir_path, "seq10_revenue_settlement.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating seq10_revenue_settlement.svg...")
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
