import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam classAttributeIconSize 0
left to right direction

class OrderController {
    - orderService: OrderService
    + getManyOrders(query, userId): Promise<GetManyOrdersResponse>
    + getOrder(orderId, userId): Promise<GetOrderResponse>
    + createOrder(body, userId): Promise<CreateOrderResponse>
    + updateStatusOrder(body, userId): Promise<UpdateStatusOrderResponse>
    + cancelOrder(orderId, userId): Promise<CancelOrderResponse>
}

class CartController {
    - orderService: OrderService
    + getManyCartItems(userId): Promise<GetManyCartItemsResponse>
    + addCartItem(body, userId): Promise<AddCartItemResponse>
    + updateCartItem(body, userId): Promise<UpdateCartItemResponse>
    + deleteCartItem(cartItemId, userId): Promise<DeleteCartItemResponse>
}

class OrderService {
    - orderGrpc: ClientGrpc
    + createOrder(data): Promise<CreateOrderResponse>
    + getManyOrders(query): Promise<GetManyOrdersResponse>
    + getOrder(id): Promise<GetOrderResponse>
    + updateStatusOrder(data): Promise<UpdateStatusOrderResponse>
    + cancelOrder(id): Promise<CancelOrderResponse>
    + addCartItem(data): Promise<AddCartItemResponse>
    + updateCartItem(data): Promise<UpdateCartItemResponse>
    + deleteCartItem(id): Promise<DeleteCartItemResponse>
    + getManyCartItems(userId): Promise<GetManyCartItemsResponse>
}

enum OrderStatus {
    CREATING
    PENDING
    CONFIRMED
    SHIPPING
    COMPLETED
    CANCELLED
    REFUNDED
}

enum PaymentMethod {
    COD
    WALLET
    ONLINE
}

class CreateOrderRequest {
    + userId: string
    + shippingFee: number
    + discountCode: string
    + paymentMethod: PaymentMethod
    + receiver: ReceiverInfo
    + orders: ShopOrder[]
    + coin: number
}

OrderController "1" o-- "1" OrderService : delegates
CartController "1" o-- "1" OrderService : delegates
OrderService "1" ..> "1" CreateOrderRequest : processes
CreateOrderRequest "1" --> "1" PaymentMethod : uses
OrderService "1" --> "1" OrderStatus : manages
@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_cls03.puml")
    output_file = os.path.join(dir_path, "cls03_order.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating cls03_order...")
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
