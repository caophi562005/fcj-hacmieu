import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam theme carbon
autonumber

participant SePay
participant "customer-bff" as CBFF
participant "SepayHmacGuard" as Guard
participant "payment-service" as PAY
participant "wallet-service" as WS
participant "order-service" as OS
participant "PaymentStreamService" as SSE
participant "customer-web" as CW

SePay -> CBFF : POST /api/v1/payment/transaction/receiver
note over SePay, CBFF
Headers: X-SePay-Signature: sha256=<hex>
X-SePay-Timestamp: <unix>
Body: {id, gateway, code:null, content:"...-TOPUP260519DM8A9P-..."}
end note

CBFF -> Guard : canActivate()
Guard -> Guard : Đọc X-SePay-Signature + X-SePay-Timestamp
Guard -> Guard : payload = timestamp + "." + rawBody
Guard -> Guard : expected = sha256=HMAC(PAYMENT_SECRET, payload)
Guard -> Guard : timingSafeEqual(expected, signature)

alt Signature không khớp
    Guard --> CBFF : 401 Unauthorized
    CBFF --> SePay : 401
end

Guard --> CBFF : true (authorized)
CBFF -> PAY : gRPC Receiver(webhookData)

PAY -> PAY : findUnique Transaction(id)\\nKiểm tra duplicate
alt Transaction đã tồn tại
    PAY --> CBFF : 404 TransactionAlreadyExists
end

PAY -> PAY : INSERT Transaction record

PAY -> PAY : data.code = null\\n→ regex extract từ content\\n→ paymentCode = "TOPUP260519DM8A9P"

PAY -> PAY : findUnique Payment(code=paymentCode)
alt Payment không tìm thấy
    PAY --> CBFF : 404 PaymentNotFound
end

PAY -> PAY : Kiểm tra amount == transferAmount
alt Amount không khớp
    PAY --> CBFF : 400 AmountPriceMismatch
end

PAY -> PAY : UPDATE Payment status=SUCCESS

alt payment.orderId rỗng (Topup)
    PAY -> WS : gRPC AdjustWallet(userId, CREDIT, TOPUP, amount)
    WS --> PAY : {newBalance}
else payment.orderId có orders (Order payment)
    PAY -> OS : gRPC PaidOrderByPayment(paymentId, orderIds)
    OS -> OS : UPDATE Orders paymentStatus=SUCCESS
    OS --> PAY : {orders}
end

PAY --> CBFF : {paymentCode, paymentId, userId}
CBFF -> SSE : publish({userId, paymentId, status:"SUCCESS"})
SSE --> CW : SSE event (filter by userId)
CW --> CW : Hiển thị "Thanh toán thành công"
CBFF --> SePay : 200 OK

@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_seq03.puml")
    output_file = os.path.join(dir_path, "seq03_sepay_webhook.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating seq03_sepay_webhook.svg...")
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
