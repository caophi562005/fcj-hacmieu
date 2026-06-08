import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam theme carbon
skinparam ActivityBackgroundColor #FEFEFE
skinparam ActivityBorderColor #2D3748
skinparam ActivityStartColor #2D3748
skinparam ActivityEndColor #2D3748
skinparam ArrowColor #4A5568

start
:POST /utility/video\n→ seller-bff\n→ gRPC CreateVideo;
:Tạo Video record\nstatus = PENDING;
:Tạo S3 Presigned URL\npath: shops/shopId/videos/videoId.mp4\nTTL: 15 phút;
:Return presignedUrl cho seller-web;
:seller-web PUT trực tiếp lên S3 bằng presignedUrl;

if (Upload thành công?) then (không)
  :Báo lỗi upload; <<#pink>>
  end
else (có)
  :S3 ObjectCreated Event\nfilter: .mp4\nprefix: shops/;
  :SQS: video-processing\nvisibility 60s;
  if (Nhận message ≤ 3 lần?) then (quá 3 lần)
    :SQS DLQ:\nvideo-processing-dlq; <<#pink>>
    end
  else (OK)
    :Lambda video-submit\ntrigger batch_size=1;
    :Lambda gọi MediaConvert CreateJob\nwith MediaConvert IAM Role;
    :MediaConvert GetObject raw MP4 từ S3;
    :Transcode HLS ABR:\n1080p / 720p / 480p;
    :PutObject HLS segments\n+ manifest vào S3\npath: shops/shopId/videos_hls/videoId/;
    
    if (Job status) then (COMPLETE)
      :EventBridge:\nMediaConvert Job State Change;
    else (ERROR)
      :EventBridge:\nMediaConvert Job State Change;
    endif
    
    :Lambda video-complete\ninvoked by EventBridge;
    :SQS: update_video_status\nSendMessage status + hlsUrl;
    
    if (Job COMPLETE?) then (có)
      :DeleteObject raw MP4 from S3;
    else (không)
    endif
    
    :utility-service consumer\nUpdate Video record;
    
    if (Job COMPLETE?) then (có)
      :status = READY\nhlsUrl, thumbnailUrl\nduration, width, height;
      :End: Video sẵn sàng phát;
    else (không)
      :status = FAILED;
      :End: Video thất bại; <<#pink>>
    endif
  endif
endif
stop
@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_act04.puml")
    output_file = os.path.join(dir_path, "act04_video_processing.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating act04_video_processing...")
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
