"""
V-Shop — Video Processing Pipeline Diagram
Run:    python docs/architecture-video.py
Output: docs/vshop-video.png

Pipeline:
  utility-service (EKS)
    → S3 bucket (raw .mp4 vào prefix videos/input/)
    → SQS video-processing  (S3 Event trigger)
    → Lambda video-submit   (Node 22)
    → AWS MediaConvert       (HLS ABR: 1080p / 720p / 480p)
    → S3 bucket (HLS output vào prefix videos/output/)  ← cùng bucket
    → EventBridge            (MediaConvert Job State Change)
    → Lambda video-complete  (Node 22)
    → SQS update_video_status
    → utility-service        (consumer → update DB)
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import EKS, Lambda
from diagrams.aws.storage import S3
from diagrams.aws.integration import SQS, Eventbridge
from diagrams.aws.media import ElementalMediaconvert
from diagrams.aws.security import IAM
import os

os.makedirs("docs", exist_ok=True)

with Diagram(
    "V-Shop — Video Processing Pipeline",
    filename="docs/vshop-video",
    outformat="png",
    show=False,
    direction="LR",
    graph_attr={
        "fontsize": "13",
        "bgcolor":  "white",
        "pad":      "1.2",
        "splines":  "ortho",
        "nodesep":  "0.9",
        "ranksep":  "1.8",
        "fontname": "Arial",
    },
    node_attr={"fontsize": "11", "fontname": "Arial"},
):
    utility_svc = EKS("utility-service\n(EKS)")

    # Một bucket duy nhất — input prefix và output prefix khác nhau
    s3 = S3("S3 Video Bucket\ninput:  videos/*.mp4\noutput: videos_hls/*.m3u8")

    with Cluster("SQS"):
        sqs_proc = SQS("video-processing")
        sqs_dlq  = SQS("video-processing-dlq\n(DLQ, maxReceive=3)")
        sqs_stat = SQS("update_video_status")

    lam_submit   = Lambda("Lambda\nvideo-submit")
    mediaconvert = ElementalMediaconvert("AWS MediaConvert\nHLS ABR\n1080p / 720p")
    evtbridge    = Eventbridge("EventBridge\nMediaConvert\nJob State Change")
    lam_complete = Lambda("Lambda\nvideo-complete")

    # ── Flow ──────────────────────────────────────────────────────

    # 1. Upload raw video
    utility_svc >> Edge(label="PutObject\nvideos/*.mp4") >> s3

    # 2. S3 Event → SQS (ObjectCreated, filter .mp4)
    s3 >> Edge(label="S3 Event\nObjectCreated (.mp4)") >> sqs_proc

    # 3. SQS → Lambda submit (batch_size=1)
    sqs_proc >> Edge(label="trigger") >> lam_submit

    # 3b. DLQ after 3 failed receives
    sqs_proc >> Edge(label="after 3 retries", style="dashed", color="red") >> sqs_dlq

    # 4. Lambda submit → MediaConvert (CreateJob)
    lam_submit >> Edge(label="CreateJob") >> mediaconvert

    # 5. MediaConvert reads input & writes HLS output — same bucket
    s3 >> Edge(label="GetObject\n(raw input)", style="dashed", color="#888") >> mediaconvert
    mediaconvert >> Edge(label="PutObject\n(HLS segments + manifest)") >> s3

    # 6. MediaConvert → EventBridge (COMPLETE / ERROR)
    mediaconvert >> Edge(label="COMPLETE / ERROR") >> evtbridge

    # 7. EventBridge → Lambda complete
    evtbridge >> Edge(label="invoke") >> lam_complete

    # 8. Lambda complete → SQS status + delete raw input
    lam_complete >> Edge(label="SendMessage\n(status + HLS URL)") >> sqs_stat
    lam_complete >> Edge(label="DeleteObject\n(raw input)", style="dashed", color="orange") >> s3

    # 9. SQS status → utility-service consumer → update DB
    sqs_stat >> Edge(label="consume\n→ update DB") >> utility_svc

print("✅  Saved → docs/vshop-video.png")
