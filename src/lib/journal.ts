import type { JournalPost } from '@/content/types';

/**
 * 日记数据的唯一出口。
 *
 * 页面组件不得自己 glob、不得自己过滤 draft、不得自己排序——全部在这里做完，
 * 模块求值时一次性完成，产物冻结只读。
 *
 * front-matter 解析器只有 20 行：本版 front-matter 只有单层 `key: value`、内联数组、
 * 布尔三种形态，因此不需要 `gray-matter`（它依赖 `Buffer`，浏览器要 polyfill）。
 */
const RAW = import.meta.glob('../content/journal/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const scalar = (value: string): string => value.replace(/^['"]|['"]$/g, '').trim();

interface ParsedFile {
  data: Record<string, unknown>;
  body: string;
}

/** 解析单层 front-matter。缺失或不闭合时按「无 front-matter」处理，返回全文为正文。 */
export function parseFrontMatter(raw: string): ParsedFile {
  if (!raw.startsWith('---')) return { data: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end < 0) return { data: {}, body: raw };

  const data: Record<string, unknown> = {};
  for (const line of raw.slice(3, end).split('\n')) {
    const match = /^([A-Za-z_]+):\s*(.*)$/.exec(line.trim());
    if (!match) continue;
    const key = match[1];
    const rest = match[2];
    if (/^\[.*\]$/.test(rest)) {
      data[key] = rest
        .slice(1, -1)
        .split(',')
        .map(scalar)
        .filter(Boolean);
    } else if (rest === 'true' || rest === 'false') {
      data[key] = rest === 'true';
    } else {
      data[key] = scalar(rest);
    }
  }

  return { data, body: raw.slice(end + 4).replace(/^[\r\n]+/, '') };
}

/** 阅读时长：中文按 350 字/分钟，去空白后估算，最少 1 分钟。 */
const readingMinutes = (body: string): number =>
  Math.max(1, Math.ceil(body.replace(/\s/g, '').length / 350));

/** 全量已发布日记（draft 已剔除，date 倒序，字符串字典序不涉及时区）。 */
export const POSTS: readonly JournalPost[] = Object.freeze(
  Object.entries(RAW)
    .map(([path, raw]): JournalPost => {
      const { data, body } = parseFrontMatter(raw);
      return {
        slug: path.split('/').pop()!.replace(/\.md$/, ''),
        body,
        title: String(data.title ?? ''),
        date: String(data.date ?? '1970-01-01'),
        tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
        summary: String(data.summary ?? ''),
        draft: data.draft === true,
        cover: typeof data.cover === 'string' ? data.cover : undefined,
        readingMin: readingMinutes(body),
      };
    })
    .filter(post => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date)),
);

/** 全部已发布日记。 */
export function getAllPosts(): readonly JournalPost[] {
  return POSTS;
}

/** 按 slug 取一篇；draft 与不存在都返回 undefined（调用方落 404）。 */
export function getPost(slug: string): JournalPost | undefined {
  return POSTS.find(post => post.slug === slug);
}

/**
 * 相邻文章。
 * prev = 更新的一篇（索引更小），next = 更旧的一篇（索引更大）。
 * 列表已按 date 倒序，所以直接用索引即可。
 */
export function getAdjacent(slug: string): {
  prev: JournalPost | null;
  next: JournalPost | null;
} {
  const index = POSTS.findIndex(post => post.slug === slug);
  if (index < 0) return { prev: null, next: null };
  return {
    prev: index > 0 ? POSTS[index - 1] : null,
    next: index < POSTS.length - 1 ? POSTS[index + 1] : null,
  };
}

/** 最新 n 篇。 */
export function getLatest(n: number): readonly JournalPost[] {
  if (n <= 0) return Object.freeze([]);
  return POSTS.slice(0, n);
}

/** 标签去重 + 频次倒序（同频次按字典序，保证稳定）。 */
export function allTags(posts: readonly JournalPost[]): string[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);
}

/**
 * 展示用日期：`YYYY-MM-DD` → 本地化文案，不做时区换算（按 UTC 解析固定日期）。
 */
export function formatDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/*
 * 注意：`renderMarkdown` **不从本模块再导出**。
 * 本模块是首屏静态依赖（Home / JournalTeaser 都要 `getLatest`），
 * 而 `lib/markdown.ts` 现在静态 import 了 `marked`——一旦在这里再导出，
 * `marked` 就会被拖进 entry chunk，首屏预算立刻破。
 * 需要渲染正文的页面请直接 `import { renderMarkdown } from '@/lib/markdown'`。
 */
