import { spawn } from 'child_process';

export function run(cmd: string, args: string[], opts: { cwd?: string } = {}) {
  return new Promise<void>((resolve, reject) => {
    const p = spawn(cmd, args, {
      cwd: opts.cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderr = '';
    p.stdout.on('data', (d) => process.stdout.write(d));
    p.stderr.on('data', (d) => {
      stderr += d.toString();
      process.stderr.write(d);
    });

    p.on('error', reject);
    p.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited ${code}\n${stderr}`));
    });
  });
}
