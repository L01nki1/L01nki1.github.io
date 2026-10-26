/**
 * 路由 chunk 预取。
 *
 * ⚠️ 硬约束：本文件只能用 **动态 `import()`**，禁止静态 import 这些页面。
 * 原因：静态引用会把 Journal / JournalPost 的依赖（marked、ScrollTrigger、…) 合并进首屏
 * chunk，`scripts/check-bundle.mjs` 会因此让 `npm run build` 直接失败
 * （首屏预算 200KB 被破掉时构建不会告警，只会悄悄变慢，所以那条守卫是硬的）。
 *
 * 预取失败必须「静默」：真正导航时 `lazy()` 会重新发起一次 `import()`，
 * 用户不会感知；把 rejection 抛到 window 上只会多一条 unhandledrejection 噪音。
 */

/** 可预取的路由标识。 */
type PrefetchTarget = 'journal' | 'journal-post';

/** 每个目标对应的 chunk loader。全部是动态 import。 */
const LOADERS: Readonly<Record<PrefetchTarget, () => Promise<unknown>>> = {
  journal: () => import('@/pages/Journal'),
  'journal-post': () => import('@/pages/JournalPost'),
};

/**
 * loader 的结果缓存。
 *
 * ES module 本身被浏览器缓存，重复 `import()` 不会再发请求；这里缓存 promise
 * 只是为了省掉重复的 microtask 与 `LOADERS` 查表开销，并让「失败可重试」成立。
 */
const pending = new Map<PrefetchTarget, Promise<void>>();

/** 发起（或复用）一次预取，永远 resolve。 */
function prefetch(target: PrefetchTarget): Promise<void> {
  const existing = pending.get(target);
  if (existing !== undefined) return existing;

  const task: Promise<void> = LOADERS[target]()
    .then(() => undefined)
    .catch(() => {
      // 网络抖动 / 用户离线：清掉缓存，下次 hover 还能再试一次。
      pending.delete(target);
    });

  pending.set(target, task);
  return task;
}

/** 预取日记列表页（`/journal`）。 */
export function prefetchJournal(): Promise<void> {
  return prefetch('journal');
}

/** 预取日记详情页（`/journal/:slug`）。 */
export function prefetchJournalPost(): Promise<void> {
  return prefetch('journal-post');
}

/** 空闲回调的兜底延迟（ms）：浏览器不支持 requestIdleCallback 时使用。 */
const IDLE_FALLBACK_DELAY = 1200;

/** 空闲回调的最长等待（ms）：首屏持续忙碌时也要在 2.5s 内把预取排上。 */
const IDLE_TIMEOUT = 2500;

/**
 * 首屏空闲后预取日记列表。
 *
 * 为什么必须等 idle：预取会发起一次真实下载，如果在首屏关键资源之前抢带宽，
 * 首屏 LCP 会变差；用户此时还看不懂「为什么点日记这么快」。
 *
 * 不返回取消函数：`prefetch` 自身去重，StrictMode 的双次调用只会排两次空回调，
 * 第二次命中缓存，不产生额外请求。
 */
export function prefetchJournalWhenIdle(): void {
  if (typeof window === 'undefined') return;

  const run = (): void => {
    void prefetchJournal();
  };

  // Safari < 18 没有 requestIdleCallback（lib.dom 里有类型标注，运行时仍需探测）
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(run, { timeout: IDLE_TIMEOUT });
    return;
  }

  window.setTimeout(run, IDLE_FALLBACK_DELAY);
}
