import { marked } from 'marked';

/**
 * Markdown → HTML，**同步**返回。
 *
 * 为什么是同步的：详情页如果把正文放进 `useEffect` + 异步 import，
 * 首帧只有一句「正在渲染正文…」，marked 到位后一次性塞入 1000+px 正文，
 * 会把上下篇导航与 footer 全部顶下去（实测 CLS 0.153，阈值 0.05）。
 * 同步渲染 = 首帧即全文，位移消失。
 *
 * 懒加载边界不受影响：本模块只被 `pages/JournalPost` 引用，
 * 所以 `marked` 落进 JournalPost 自己的路由 chunk，不进 entry。
 */
export function renderMarkdown(md: string): string {
  return String(
    marked.parse(md, {
      gfm: true,
      breaks: false,
      async: false,
    }),
  );
}
