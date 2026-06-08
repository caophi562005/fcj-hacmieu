import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam theme carbon
autonumber

actor Browser
participant "customer-web" as CW
participant "AWS Cognito" as Cognito
participant "customer-bff" as CBFF
participant "iam-service" as IAM
database Redis

Browser -> CW : Truy cập vshop.hacmieu.com
CW -> Browser : Redirect to Cognito Managed Login
Browser -> Cognito : GET login.vshop.hacmieu.com
Cognito --> Browser : Hiển thị form đăng nhập

Browser -> Cognito : Submit credentials
Cognito --> Browser : Redirect callback với code
Browser -> CW : GET /api/auth/callback/cognito?code=...

CW -> Cognito : Exchange code → tokens
Cognito --> CW : accessToken + idToken + refreshToken
CW -> Browser : Set httpOnly cookies (tokens)

note over Browser, Redis : Mỗi request tiếp theo

Browser -> CBFF : GET /api/v1/iam/user (cookie)
CBFF -> CBFF : AuthenticationGuard → AccessTokenGuard
CBFF -> Redis : GET cache[tokenHash]
Redis --> CBFF : Cache MISS

CBFF -> IAM : gRPC ValidateToken(accessToken, idToken)
IAM -> Cognito : aws-jwt-verify (User Pool)
Cognito --> IAM : Token valid
IAM -> IAM : Load permissions by group (CUSTOMER)
IAM --> CBFF : {userId, username, groups, permissions[]}

CBFF -> Redis : SET cache[tokenHash] = userData (TTL 30m)
CBFF -> CBFF : Check route permission → OK
CBFF --> Browser : 200 UserResponse

note over Browser, Redis : Request tiếp theo (cache HIT)
Browser -> CBFF : GET /api/v1/order/order (cookie)
CBFF -> Redis : GET cache[tokenHash]
Redis --> CBFF : Cache HIT → userData
CBFF --> Browser : 200 OrdersResponse

@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_seq01.puml")
    output_file = os.path.join(dir_path, "seq01_login.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating seq01_login.svg...")
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
