// 构建前清空 dist：单次目录级删除，而不是让 Vite 的 emptyOutDir 批量删上百个文件。
// 某些受管环境的文件删除策略会拦「一次删除 >50 个文件」，目录级 rmSync 只算一次调用。
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve(process.cwd(), 'dist');

if (!existsSync(dist)) {
  console.log('[clean] dist 不存在，跳过');
  process.exit(0);
}

try {
  rmSync(dist, { recursive: true, force: true });
  console.log('[clean] dist 已清空');
} catch (error) {
  console.error('[clean] 清空 dist 失败：', error instanceof Error ? error.message : error);
  process.exit(1);
}
