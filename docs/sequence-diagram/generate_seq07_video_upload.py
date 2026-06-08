import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam theme carbon
autonumber

actor Seller
participant "seller-web" as SW
participant "seller-bff" as SBFF
participant "utility-service" as US
database "S3 Bucket" as S3
participant "SQS video-processing" as SQS_Proc
participant "Lambda video-submit" as LamSubmit
participant MediaConvert as MC
participant EventBridge as EB
participant "Lambda video-complete" as LamComplete
participant "SQS update_video_status" as SQS_Stat

Seller -> SW : Chọn file video (.mp4)
SW -> SBFF : POST /api/v1/utility/video\\n{productId}
SBFF -> US : gRPC CreateVideo(shopId, productId)
US -> US : INSERT Video\\n{status=PENDING, shopId, productId}
US -> S3 : Generate Presigned URL\\nPUT shops/{shopId}/videos/{videoId}.mp4\\nTTL: 15 phút
US --> SBFF : {id, presignedUrl}
SBFF --> SW : {videoId, presignedUrl}

SW -> S3 : PUT raw .mp4\\n(direct upload, no BFF)
S3 --> SW : 200 OK

note over S3, SQS_Stat : Async pipeline bắt đầu

S3 -> SQS_Proc : S3 Event ObjectCreated\\nfilter: .mp4, prefix: shops/
SQS_Proc -> LamSubmit : Trigger (batch_size=1)
LamSubmit -> MC : CreateJob\\n{input: s3://bucket/shops/.../videoId.mp4,\\noutput: s3://bucket/shops/.../videos_hls/videoId/,\\nrole: MediaConvertRole}
MC -> S3 : GetObject (raw MP4)
MC -> MC : Transcode HLS ABR\\n1080p / 720p / 480p
MC -> S3 : PutObject HLS segments\\n+ videoId.m3u8 manifest
MC -> EB : Job State Change\\n{status: COMPLETE}
EB -> LamComplete : Invoke
LamComplete -> S3 : DeleteObject raw MP4
LamComplete -> SQS_Stat : SendMessage\\n{videoId, status:COMPLETE,\\nhlsUrl, thumbnailUrl}

SQS_Stat -> US : Consumer
US -> US : UPDATE Video\\n{status=READY,\\nhlsUrl, thumbnailUrl,\\nduration, width, height}

Seller -> SW : Refresh video list
SW -> SBFF : GET /api/v1/utility/video/:id
SBFF -> US : gRPC GetVideo(videoId)
US --> SBFF : {status:READY, hlsUrl, thumbnailUrl}
SBFF --> SW : VideoResponse
SW --> Seller : Video sẵn sàng phát

@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_seq07.puml")
    output_file = os.path.join(dir_path, "seq07_video_upload.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating seq07_video_upload.svg...")
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
