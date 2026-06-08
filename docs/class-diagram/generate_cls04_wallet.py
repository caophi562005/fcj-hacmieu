import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam classAttributeIconSize 0
left to right direction

class WalletController {
    - walletService: WalletService
    + getMyWallet(userId): Promise<WalletResponse>
    + getMyTransactions(userId, query): Promise<GetMyTransactionsResponse>
    + adjustWallet(body, userId): Promise<AdjustWalletResponse>
}

class CreditController {
    - walletService: WalletService
    + getShopCredit(shopId): Promise<CreditResponse>
    + getShopCreditTransactions(shopId, query): Promise<GetCreditTransactionsResponse>
    + getShopRevenueSummary(shopId): Promise<RevenueSummaryResponse>
    + adjustShopCredit(body): Promise<AdjustShopCreditResponse>
}

class PayoutController {
    - walletService: WalletService
    + createShopPayout(body, shopId): Promise<PayoutResponse>
    + getShopPayouts(shopId, query): Promise<GetPayoutsResponse>
    + getShopPayoutById(payoutId): Promise<PayoutResponse>
    + updateShopPayoutStatus(payoutId, body): Promise<PayoutResponse>
    + deleteShopPayout(payoutId): Promise<DeletePayoutResponse>
}

class WalletService {
    - walletGrpc: ClientGrpc
    + getMyWallet(userId): Promise<WalletResponse>
    + adjustWallet(data): Promise<AdjustWalletResponse>
    + getMyTransactions(userId, query): Promise<GetMyTransactionsResponse>
    + getShopCredit(shopId): Promise<CreditResponse>
    + adjustShopCredit(data): Promise<AdjustShopCreditResponse>
    + createShopPayout(data): Promise<PayoutResponse>
    + updateShopPayoutStatus(data): Promise<PayoutResponse>
}

enum WalletTransactionSource {
    ORDER_REWARD
    REVIEW_REWARD
    PROMOTION_GIFT
    REFERRAL
    TOPUP
    REFUND
    ORDER_PAYMENT
    SYSTEM
    OTHER
}

enum CreditTransactionSource {
    ORDER_REVENUE
    WITHDRAWAL
    REFUND
    SYSTEM
    OTHER
}

enum PayoutStatus {
    PENDING
    TRANSFERRED
    REJECTED
}

WalletController "1" o-- "1" WalletService : delegates
CreditController "1" o-- "1" WalletService : delegates
PayoutController "1" o-- "1" WalletService : delegates
WalletService "1" ..> "1..*" WalletTransactionSource : references
WalletService "1" ..> "1..*" CreditTransactionSource : references
WalletService "1" ..> "1..*" PayoutStatus : references
@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_cls04.puml")
    output_file = os.path.join(dir_path, "cls04_wallet.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating cls04_wallet...")
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
