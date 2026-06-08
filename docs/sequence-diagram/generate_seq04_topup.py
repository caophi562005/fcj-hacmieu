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
participant "payment-service" as PAY
participant "api-mb" as APIMB
participant "PaymentStreamService" as SSE
participant SePay
participant "wallet-service" as WS

Customer -> CW : Chọn mệnh giá / nhập số tiền
CW -> CBFF : POST /api/v1/payment/payment/topup\\n{amount: 50000}

CBFF -> CBFF : Generate id = uuidv4()\\ncode = generateCode("TOPUP")\\n→ "TOPUP260519DM8A9P"

CBFF -> PAY : gRPC CreatePayment\\n{id, code, userId, method=WALLET,\\nstatus=PENDING, amount=50000, orderId=[]}

PAY -> PAY : INSERT Payment record
PAY -> APIMB : GET VietQR\\n{bankCode=MB, bankNumber=0344927528,\\namount=50000, content=code}
APIMB --> PAY : {qrUrl: "https://img.vietqr.io/..."}
PAY --> CBFF : {id, code, qrUrl}
CBFF --> CW : {paymentId, qrUrl}

CW -> CBFF : SSE /api/v1/payment/transaction/sse
CBFF -> SSE : stream().pipe(filter userId)
SSE --> CW : SSE connection open

CW --> Customer : Hiển thị QR code + countdown

Customer -> Customer : Mở app ngân hàng\\nQuét QR
Customer -> SePay : Chuyển khoản 50,000đ\\ncontent: "TOPUP260519DM8A9P"

note over SePay, WS : SePay nhận giao dịch từ MBBank

SePay -> CBFF : POST /api/v1/payment/transaction/receiver\\n(HMAC-SHA256 verified)
CBFF -> PAY : gRPC Receiver
PAY -> PAY : Verify → UPDATE Payment SUCCESS
PAY -> WS : gRPC AdjustWallet\\n(userId, CREDIT, TOPUP, 50000)
WS -> WS : UPDATE wallet balance += 50000\\nINSERT WalletTransaction
WS --> PAY : {newBalance: 50000}
PAY --> CBFF : {userId, paymentId}

CBFF -> SSE : publish({userId, paymentId, status:"SUCCESS"})
SSE --> CW : SSE event
CW --> Customer : "Nạp 50,000 V-Xu thành công!\\nSố dư: 50,000 V-Xu"

@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_seq04.puml")
    output_file = os.path.join(dir_path, "seq04_topup.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating seq04_topup.svg...")
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
