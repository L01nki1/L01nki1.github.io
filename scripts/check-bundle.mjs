/**
 * 首屏预算守卫。
 *
 * 背景：`lib/markdown.ts` 是静态 `import { marked }`，`marked` 之所以没进首屏，
 * 完全依赖「只有 JournalPost 引用它」这条不成文契约。一旦有人在首屏侧
 * import 一次 renderMarkdown，构建不会报错、体积不会告警、页面完全正常，
 * 只是 200KB 预算被悄悄破掉。所以把这条线固化成构建失败。
 *
 * 同类风险：gsap / ScrollTrigger（AnimatedContent）、card-swap、side-rays。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dir = resolve(process.cwd(), 'dist/assets');
const FORBIDDEN = ['marked', 'ScrollTrigger', 'card-swap', 'side-rays'];

let entries;
try {
  entries = readdirSync(dir).filter((f) => /^index-.*\.js$/.test(f));
} catch {
  console.error('[check-bundle] 找不到 dist/assets，先跑 npm run build');
  process.exit(1);
}

if (entries.length === 0) {
  console.error('[check-bundle] dist/assets 下没有 index-*.js');
  process.exit(1);
}

let failed = false;
for (const file of entries) {
  const full = join(dir, file);
  const code = readFileSync(full, 'utf8');
  const hits = FORBIDDEN.filter((k) => code.includes(k));
  const kb = (statSync(full).size / 1024).toFixed(1);
  if (hits.length > 0) {
    console.error(`[check-bundle] ✗ ${file} (${kb} KB) 混入首屏：${hits.join(', ')}`);
    failed = true;
  } else {
    console.log(`[check-bundle] ✓ ${file} (${kb} KB) 首屏干净`);
  }
}

if (failed) {
  console.error('[check-bundle] 首屏被懒加载模块污染，构建中止。检查是否有首屏组件静态 import 了 renderMarkdown / AnimatedContent / SideRays / CardSwap。');
  process.exit(1);
}
