"""
V-Shop — Main Architecture Diagram
Run:    python docs/architecture-main.py
Output: docs/vshop-main.png
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import EKS, EC2, ECR
from diagrams.aws.network import ALB, NATGateway, InternetGateway, Route53, CloudFront
from diagrams.aws.security import Cognito, ACM
from diagrams.aws.storage import S3
from diagrams.aws.integration import SQS
from diagrams.aws.management import Cloudwatch
from diagrams.onprem.ci import GithubActions
from diagrams.programming.framework import React
import os

os.makedirs("docs", exist_ok=True)

with Diagram(
    "V-Shop — Main Architecture (AWS EKS, ap-southeast-1)",
    filename="docs/vshop-main",
    outformat="png",
    show=False,
    direction="LR",
    graph_attr={
        "fontsize": "13",
        "bgcolor":  "white",
        "pad":      "1.0",
        "splines":  "ortho",
        "nodesep":  "0.6",
        "ranksep":  "1.4",
        "fontname": "Arial",
    },
    node_attr={"fontsize": "10", "fontname": "Arial"},
):
    # ── Col 1: Clients ────────────────────────────────────────────
    with Cluster("Clients"):
        customer   = React("Customer\nvshop.hacmieu.com")
        seller     = React("Seller\nseller.vshop.hacmieu.com")
        admin_user = React("Admin\nadmin.vshop.hacmieu.com")

    # ── Col 2: DNS / CDN / TLS ────────────────────────────────────
    with Cluster("DNS & CDN"):
        r53 = Route53("Route 53\n*.hacmieu.com")
        cf  = CloudFront("CloudFront\n(Static CDN)")
        acm = ACM("ACM\n(SSL/TLS)")

    # ── Col 3–5: VPC ──────────────────────────────────────────────
    with Cluster("VPC  10.0.0.0/16  (ap-southeast-1a / 1c)"):

        igw = InternetGateway("Internet\nGateway")

        with Cluster("Public Subnets\n10.0.1.0/24 | 10.0.2.0/24"):
            alb     = ALB("ALB\n(Internet-facing)")
            nat     = NATGateway("NAT Gateway")
            bastion = EC2("Bastion\nt3.small")

        with Cluster("Private Subnets\n10.0.10.0/24 | 10.0.20.0/24"):

            with Cluster("EKS Cluster  (t3.medium × 2)"):

                with Cluster("Web Apps — Next.js"):
                    cust_web   = EKS("customer-web\n:3000")
                    seller_web = EKS("seller-web\n:3001")
                    admin_web  = EKS("admin-web\n:3002")

                with Cluster("BFF Layer — NestJS"):
                    cust_bff   = EKS("customer-bff\n:3100")
                    seller_bff = EKS("seller-bff\n:3200")
                    admin_bff  = EKS("admin-bff\n:3300")

                with Cluster("Microservices — NestJS gRPC"):
                    iam_svc       = EKS("iam :5001")
                    catalog_svc   = EKS("catalog :5002")
                    shop_svc      = EKS("shop :5003")
                    order_svc     = EKS("order :5004")
                    payment_svc   = EKS("payment :5005")
                    promotion_svc = EKS("promotion :5006")
                    utility_svc   = EKS("utility :5007")
                    wallet_svc    = EKS("wallet :5008")
                    ai_svc        = EKS("ai :5009")

                api_mb = EKS("api-mb :2836\n(MBBank proxy)")

        with Cluster("App SQS Queues"):
            sqs_payment    = SQS("create_payment")
            sqs_order      = SQS("create_order")
            sqs_redemption = SQS("create_redemption")
            sqs_cart       = SQS("delete_cart_item")
            sqs_notify     = SQS("send_notification")
            sqs_user       = SQS("create_user")
            sqs_revenue    = SQS("settle_order_revenue")

        s3_image = S3("S3\n(images + videos)")

    # ── Col 6: AWS Managed ────────────────────────────────────────
    with Cluster("AWS Managed"):
        cognito = Cognito("Cognito\n(OIDC)")
        cw      = Cloudwatch("CloudWatch")

    # ── Col 7: External ───────────────────────────────────────────
    with Cluster("External Services"):
        neon   = EC2("Neon PostgreSQL\n(9 DBs)")
        redis  = EC2("Redis Cloud\n(Cache)")
        convex = EC2("Convex Cloud\n(Chat + AI Bot)")
        groq   = EC2("Groq API\n(LLM)")
        google = EC2("Google Embedding\n(RAG)")
        sepay  = EC2("SePay\n(Webhook)")

    # ── CI/CD ─────────────────────────────────────────────────────
    with Cluster("CI/CD"):
        github = GithubActions("GitHub Actions\n(OIDC)")
        ecr    = ECR("ECR Public")
        github >> Edge(label="build & push") >> ecr

    # ── Connections ───────────────────────────────────────────────
    [customer, seller, admin_user] >> Edge(color="black") >> r53
    r53  >> acm
    r53  >> igw
    igw  >> alb
    s3_image >> Edge(label="CDN origin") >> cf

    alb >> [cust_web, seller_web, admin_web]
    alb >> Edge(label="/api/v1") >> cust_bff
    alb >> Edge(label="/api/v1") >> seller_bff
    alb >> Edge(label="/api/v1") >> admin_bff

    g = Edge(label="gRPC", style="dashed", color="#4A90D9")
    cust_bff   >> g >> iam_svc
    cust_bff   >> g >> catalog_svc
    cust_bff   >> g >> order_svc
    cust_bff   >> g >> payment_svc
    cust_bff   >> g >> wallet_svc
    cust_bff   >> g >> utility_svc
    cust_bff   >> g >> promotion_svc
    cust_bff   >> g >> ai_svc
    seller_bff >> g >> shop_svc
    seller_bff >> g >> catalog_svc
    seller_bff >> g >> order_svc
    admin_bff  >> g >> iam_svc
    admin_bff  >> g >> payment_svc

    [cust_bff, seller_bff, admin_bff] >> Edge(label="OIDC", color="green") >> cognito
    sepay >> Edge(label="HMAC-SHA256", color="orange") >> cust_bff

    db = Edge(color="#888888", style="dashed")
    for svc in [iam_svc, catalog_svc, shop_svc, order_svc,
                payment_svc, promotion_svc, utility_svc, wallet_svc, ai_svc]:
        svc >> db >> neon

    [cust_bff, iam_svc] >> Edge(label="cache", color="red") >> redis

    order_svc   >> [sqs_order, sqs_cart]
    payment_svc >> [sqs_payment, sqs_redemption, sqs_revenue]
    iam_svc     >> sqs_user
    utility_svc >> sqs_notify
    utility_svc >> Edge(label="PutObject") >> s3_image

    ai_svc >> Edge(label="LLM",   color="purple") >> groq
    ai_svc >> Edge(label="embed", color="purple") >> google

    [cust_web, seller_web] >> Edge(label="WebSocket", color="teal") >> convex
    payment_svc >> Edge(label="VietQR") >> api_mb
    nat >> igw
    ecr >> Edge(label="kubectl apply", style="dotted", color="gray") >> alb
    cust_bff >> Edge(style="dotted", color="lightgray") >> cw

print("✅  Saved → docs/vshop-main.png")
