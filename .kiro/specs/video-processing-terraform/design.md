# Thiết kế: Video Processing Pipeline (Terraform)

## Tổng quan

Pipeline xử lý video serverless trên AWS, dùng chung 1 S3 bucket với 2 prefix:

- `videos/` — video gốc (trigger SQS)
- `videos_hls/` — HLS output (không trigger)

```
S3 (videos/) → S3 Event Notification → SQS → Lambda (ffmpeg) → S3 (videos_hls/) → Update DB
```

## Kiến trúc

```
┌───────────────────────┐
│  S3 Bucket (existing) │
│  prefix: videos/      │──── S3 ObjectCreated ────→ SQS Queue ────→ Lambda (ffmpeg)
│  prefix: videos_hls/  │◄─── Lambda upload HLS ──────────────────────────┘
└───────────────────────┘                                                  │
                                                                           ↓
                                                                    Update DB status
```

## S3 Structure (chung 1 bucket)

```
s3://fcj-hacmieu-491333778094-ap-southeast-1-an/
├── videos/                    ← video gốc → trigger SQS
│   └── {userId}/{videoId}.mp4
├── videos_hls/                ← HLS output → KHÔNG trigger
│   └── {videoId}/
│       ├── master.m3u8
│       ├── v0/index.m3u8, seg_*.m4s
│       └── v1/index.m3u8, seg_*.m4s
└── {userId}/product/...       ← ảnh sản phẩm (không bị ảnh hưởng)
```

## Terraform Module: `terraform/modules/video-processing/`

### Resources:

| Resource                          | Mô tả                         |
| --------------------------------- | ----------------------------- |
| `aws_sqs_queue`                   | Queue chính (visibility 960s) |
| `aws_sqs_queue` (DLQ)             | Dead Letter Queue (7 ngày)    |
| `aws_sqs_queue_policy`            | Cho phép S3 gửi message       |
| `aws_s3_bucket_notification`      | S3 `videos/` → SQS            |
| `aws_iam_role` + `aws_iam_policy` | Lambda execution role         |
| `aws_lambda_function`             | Node.js 20 + ffmpeg layer     |
| `aws_lambda_layer_version`        | ffmpeg static binary          |
| `aws_lambda_event_source_mapping` | SQS → Lambda (batch 1)        |

### Input Variables:

| Variable                   | Mô tả                                      |
| -------------------------- | ------------------------------------------ |
| `project_name`             | Tên project                                |
| `region`                   | AWS region                                 |
| `bucket_name`              | Tên S3 bucket (chung)                      |
| `bucket_arn`               | ARN S3 bucket (truyền vào, KHÔNG tạo)      |
| `input_prefix`             | Prefix video gốc (default: `videos/`)      |
| `output_prefix`            | Prefix HLS output (default: `videos_hls/`) |
| `db_connection_string`     | PostgreSQL connection string               |
| `lambda_timeout`           | Timeout Lambda (default: 900s = 15 phút)   |
| `lambda_memory`            | RAM Lambda (default: 3008 MB)              |
| `lambda_ephemeral_storage` | /tmp size (default: 5120 MB = 5GB)         |

## Lambda Function

- **Runtime**: `nodejs20.x`
- **Layer**: ffmpeg static binary (`/opt/bin/ffmpeg`, `/opt/bin/ffprobe`)
- **Memory**: 3GB (đủ cho ffmpeg transcode)
- **Timeout**: 15 phút (max Lambda)
- **Ephemeral storage**: 5GB `/tmp/`

### Logic:

1. Parse SQS message → lấy S3 key (`videos/{userId}/{videoId}.mp4`)
2. Extract `videoId` từ key
3. Download video → `/tmp/input.mp4`
4. `ffprobe` → duration, width, height
5. `ffmpeg` → HLS ABR (720p + 480p, 2s segments, fMP4)
6. Upload HLS → S3 `videos_hls/{videoId}/`
7. Update DB: `status='READY', duration, width, height`
8. Xoá video gốc từ S3 `videos/` (optional)
9. Cleanup `/tmp/`

## Giới hạn

- Video < 5 phút: Lambda 15 phút đủ
- Video > 5 phút: cần giảm quality hoặc chuyển sang ECS Fargate
- `/tmp/` 5GB: video gốc + output phải < 5GB tổng
