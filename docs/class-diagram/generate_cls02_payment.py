import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam classAttributeIconSize 0
left to right direction

class TransactionController {
    - paymentService: PaymentService
    - paymentStreamService: PaymentStreamService
    + receiver(body: WebhookTransactionRequestDto): Promise<WebhookTransactionResponseDto>
    + handle(userId: string): Observable<MessageEvent>
}

class PaymentController {
    - paymentService: PaymentService
    + getPayment(id: string): Promise<GetPaymentResponseDto>
    + createTopup(body, processId, userId): Promise<CreatePaymentResponseDto>
}

class PaymentService {
    - paymentGrpc: ClientGrpc
    + createPayment(data: CreatePaymentRequest): Promise<PaymentResponse>
    + getPayment(id: string): Promise<PaymentResponse>
    + receiver(body: WebhookTransactionRequestDto): Promise<WebhookTransactionResponse>
}

class PaymentStreamService {
    - subject: Subject<MessageEvent>
    + publish(data: any): void
    + stream(): Observable<MessageEvent>
}

class WebhookTransactionRequestDto {
    + id: number
    + gateway: string
    + transactionDate: string
    + accountNumber: string
    + code: string
    + content: string
    + transferType: string
    + transferAmount: number
    + accumulated: number
    + subAccount: string
    + referenceCode: string
    + description: string
}

class TransactionRepository {
    - prisma: PrismaService
    + receiver(data: WebhookTransactionRequest): Promise<ReceiverResult>
    - extractPaymentCode(code, content): string
}

TransactionController "1" o-- "1" PaymentService : delegates
TransactionController "1" o-- "1" PaymentStreamService : publishes to
PaymentController "1" o-- "1" PaymentService : delegates
PaymentService "1" o-- "1" TransactionRepository : aggregates
PaymentService "1" ..> "1" WebhookTransactionRequestDto : processes
TransactionRepository "1" ..> "1" WebhookTransactionRequestDto : extracts
@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_cls02.puml")
    output_file = os.path.join(dir_path, "cls02_payment.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating cls02_payment...")
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
