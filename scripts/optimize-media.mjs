import { spawnSync } from 'node:child_process';
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const root = process.cwd();
const run = args => {
  const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error('FFmpeg failed');
};
run(['-i', 'src/assets/hero-liquid-optimized.mp4', '-an', '-vf', 'scale=960:540', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', 'src/assets/hero-mobile.mp4']);
const source = path.join(root, 'src/assets_meteoro');
const files = (await readdir(source)).filter(name => name.endsWith('.webp')).sort();
for (const [folder, width, step, quality] of [['meteor-desktop', 960, 2, 68], ['meteor-mobile', 512, 4, 62]]) {
  const destination = path.join(root, 'src', folder);
  await mkdir(destination, { recursive: true });
  const selected = files.filter((_, i) => i % step === 0 || i === files.length - 1);
  // Four concurrent encodes keep memory bounded on Windows.
  for (let i = 0; i < selected.length; i += 4) {
    await Promise.all(selected.slice(i, i + 4).map(name => sharp(path.join(source, name)).resize({ width }).webp({ quality, alphaQuality: 90 }).toFile(path.join(destination, name))));
  }
  const bytes = (await Promise.all(selected.map(name => stat(path.join(destination, name))))).reduce((sum, file) => sum + file.size, 0);
  console.log(`${folder}: ${selected.length} frames, ${(bytes / 1048576).toFixed(2)} MiB`);
}
console.log(`Mobile video: ${((await stat('src/assets/hero-mobile.mp4')).size / 1048576).toFixed(2)} MiB`);
