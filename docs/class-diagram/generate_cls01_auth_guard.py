import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam classAttributeIconSize 0
left to right direction

class AuthenticationGuard {
    - authTypeGuardMap: Record<string, CanActivate>
    - excludedPaths: string[]
    - reflector: Reflector
    - accessTokenGuard: AccessTokenGuard
    - sepayHmacGuard: SepayHmacGuard
    + canActivate(context: ExecutionContext): Promise<boolean>
    - getAuthTypeValue(context): AuthTypeDecoratorPayload
    - handleAndCondition(guards, context): Promise<boolean>
    - handleOrCondition(guards, context): Promise<boolean>
}

class AccessTokenGuard {
    - iamService: ClientGrpc
    - redisService: RedisService
    + canActivate(context: ExecutionContext): Promise<boolean>
    - validateToken(tokens): ValidateTokenResponse
    - checkPermission(userData, request): boolean
}

class SepayHmacGuard {
    + canActivate(context: ExecutionContext): boolean
    - verifyHmac(signature, timestamp, rawBody): boolean
}

class AuthDecorator <<decorator>> {
    + Auth(authTypes: AuthType[]): MethodDecorator
}

enum AuthType {
    Cookie
    None
    PaymentAPIKey
}

class AuthConfiguration <<configuration>> {
    + PAYMENT_SECRET: string
    + COGNITO_DOMAIN: string
    + USER_POOL_ID: string
}

AuthenticationGuard "1" o-- "1" AccessTokenGuard : aggregates
AuthenticationGuard "1" o-- "1" SepayHmacGuard : aggregates
AuthenticationGuard "1" --> "1" AuthType : resolves
SepayHmacGuard "1" ..> "1" AuthConfiguration : reads
AuthDecorator "1" ..> "1..*" AuthType : configures
@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_cls01.puml")
    output_file = os.path.join(dir_path, "cls01_auth_guard.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating cls01_auth_guard...")
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
