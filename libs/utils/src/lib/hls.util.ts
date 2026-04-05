import { run } from '@common/utils/exec.util';
import { spawn } from 'child_process';

export async function transcodeToHlsAbr(input: string, outDir: string) {
  const args = [
    '-y',
    '-i',
    input,

    '-filter_complex',
    [
      '[0:v]split=3[v1080][v720][v480];',
      "[v1080]scale=-2:'min(1080,ih)':force_original_aspect_ratio=decrease,pad='ceil(iw/2)*2':'ceil(ih/2)*2':(ow-iw)/2:(oh-ih)/2:black,setsar=1[v1080o];",
      "[v720]scale=-2:'min(720,ih)':force_original_aspect_ratio=decrease,pad='ceil(iw/2)*2':'ceil(ih/2)*2':(ow-iw)/2:(oh-ih)/2:black,setsar=1[v720o];",
      "[v480]scale=-2:'min(480,ih)':force_original_aspect_ratio=decrease,pad='ceil(iw/2)*2':'ceil(ih/2)*2':(ow-iw)/2:(oh-ih)/2:black,setsar=1[v480o]",
    ].join(''),

    // map 3 video + 3 audio
    '-map',
    '[v1080o]',
    '-map',
    '0:a',
    '-map',
    '[v720o]',
    '-map',
    '0:a',
    '-map',
    '[v480o]',
    '-map',
    '0:a',

    '-c:v',
    'libx264',
    '-profile:v',
    'high',
    '-level',
    '4.1',
    '-pix_fmt',
    'yuv420p',

    '-b:v:0',
    '5000k',
    '-maxrate:v:0',
    '5350k',
    '-bufsize:v:0',
    '7500k',
    '-b:v:1',
    '2500k',
    '-maxrate:v:1',
    '2675k',
    '-bufsize:v:1',
    '3750k',
    '-b:v:2',
    '1000k',
    '-maxrate:v:2',
    '1075k',
    '-bufsize:v:2',
    '1500k',

    '-c:a',
    'aac',
    '-b:a',
    '128k',

    '-f',
    'hls',
    '-hls_time',
    '2',
    '-hls_playlist_type',
    'vod',
    '-hls_segment_type',
    'fmp4',
    '-hls_flags',
    'independent_segments',
    '-master_pl_name',
    'master.m3u8',
    '-var_stream_map',
    'v:0,a:0 v:1,a:1 v:2,a:2',
    '-hls_segment_filename',
    'v%v/seg_%03d.m4s',
    'v%v/index.m3u8',
  ];

  await run('ffmpeg', args, { cwd: outDir });
}

export async function makeThumbnail(input: string, outJpgPath: string) {
  await run('ffmpeg', [
    '-y',
    '-i',
    input,
    '-ss',
    '00:00:01.000',
    '-vframes',
    '1',
    '-q:v',
    '2',
    outJpgPath,
  ]);
}

export async function ffprobeJson(inputPath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const args = [
      '-v',
      'error',
      '-print_format',
      'json',
      '-show_format',
      '-show_streams',
      inputPath,
    ];
    const p = spawn('ffprobe', args, { stdio: ['ignore', 'pipe', 'pipe'] });

    let out = '';
    let err = '';
    p.stdout.on('data', (d) => (out += d.toString()));
    p.stderr.on('data', (d) => (err += d.toString()));

    p.on('close', (code) => {
      if (code !== 0) return reject(new Error(`ffprobe failed: ${err}`));
      resolve(JSON.parse(out));
    });
    p.on('error', reject);
  });
}
