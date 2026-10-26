// 用 node 而非 shell `cp`：Windows 上 cp 不可靠，且要给出可读的失败原因。
import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve(process.cwd(), 'dist');
const indexFile = resolve(dist, 'index.html');

if (!existsSync(indexFile)) {
  console.error('[404] dist/index.html 缺失，构建未产出入口文件');
  process.exit(1);
}

copyFileSync(indexFile, resolve(dist, '404.html'));
console.log('[404] dist/404.html 已生成（GitHub Pages 深链回退）');
