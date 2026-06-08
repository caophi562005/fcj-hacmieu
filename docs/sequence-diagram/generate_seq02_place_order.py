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
participant "order-service" as OS
participant "catalog-service" as CS
participant "promotion-service" as PS
participant "wallet-service" as WS
participant "payment-service" as PAY
participant SQS
participant "api-mb" as APIMB

Customer -> CW : Checkout với cartItems + discountCode + coin
CW -> CBFF : POST /api/v1/order/order
CBFF -> OS : gRPC CreateOrder(userId, cartItemIds,\\nreceiver, paymentMethod=ONLINE,\\ndiscountCode, coin)

OS -> OS : ValidateCartItems (check cartId ownership)

OS -> CS : gRPC ValidateProducts(skuIds, quantities)
CS --> OS : {valid: true, items: [{price, stock}]}

alt Có discount code
    OS -> PS : gRPC CheckPromotion(code, userId, subtotal)
    PS --> OS : {valid, discountAmount, redemptionId}
end

alt Dùng V-Xu
    OS -> WS : gRPC GetMyWallet(userId)
    WS --> OS : {balance}
    OS -> OS : Kiểm tra balance >= coin
end

OS -> OS : Tính toán:\\nitemTotal, shippingFee,\\ndiscount, grandTotal

OS -> OS : INSERT Order (status=CREATING)\\nINSERT OrderItems

alt Dùng V-Xu
    OS -> WS : gRPC AdjustWallet(userId, DEBIT,\\nORDER_PAYMENT, amount=coin)
    WS --> OS : {newBalance}
end

OS -> SQS : SendMessage create_payment\\n{orderId, userId, amount, method=ONLINE}
OS -> SQS : SendMessage create_order\\n{orderId, userId} → notification
OS -> SQS : SendMessage create_redemption\\n{promotionId, userId, orderIds}

SQS --> PAY : Consumer create_payment
PAY -> PAY : INSERT Payment\\n{code=TOPUP-xxx, status=PENDING}
PAY -> APIMB : Generate VietQR URL\\n{bankCode, bankNumber, amount, content=code}
APIMB --> PAY : {qrUrl}

OS --> CBFF : {orders: Order[]}
CBFF --> CW : {orders, paymentId, qrUrl}
CW --> Customer : Hiển thị QR code
Customer -> CW : Mở SSE /payment/transaction/sse

@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_seq02.puml")
    output_file = os.path.join(dir_path, "seq02_place_order.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating seq02_place_order.svg...")
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
