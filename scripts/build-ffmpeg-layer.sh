REGION="ap-southeast-1"
BUCKET_NAME=""
LAYER_NAME="ffmpeg_and_ffprobe"

mkdir -p /tmp/layer/bin && cd /tmp/layer/bin
curl -L -o ffmpeg.tar.xz https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz
tar -xf ffmpeg.tar.xz --strip-components=1 --wildcards --no-anchored 'ffmpeg' 'ffprobe'
rm ffmpeg.tar.xz && chmod +x ffmpeg ffprobe

cd /tmp/layer && zip -qr /tmp/layer.zip bin/
aws s3 cp /tmp/layer.zip s3://$BUCKET_NAME/layers/ffmpeg/layer.zip

aws lambda publish-layer-version \
  --layer-name $LAYER_NAME \
  --content S3Bucket=$BUCKET_NAME,S3Key=layers/ffmpeg/layer.zip \
  --compatible-runtimes nodejs22.x \
  --compatible-architectures x86_64 \
  --region $REGION \
  --description "FFmpeg + FFprobe static" \
  --output text --query LayerVersionArn