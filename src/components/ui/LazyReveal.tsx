import { useEffect, useState, type ReactNode } from 'react';

export interface LazyRevealProps {
  /** 返回目标组件的加载函数（传模块级常量，保持引用稳定避免 effect 重跑）。 */
  load: () => Promise<unknown>;
  /** 加载完成前的占位。 */
  fallback: ReactNode;
  /**
   * 加载完成后的渲染函数：拿到解析出的组件，由调用方决定怎么传 props。
   * 例：`{Grid => <Grid projects={PROJECTS} />}`
   */
  children: (Component: React.ComponentType<any>) => ReactNode;
}

/**
 * 手动懒挂载原语：`import()` 完成后用**普通 setState** 挂载目标组件。
 *
 * ⚠️ 为什么不用 `lazy()` + `<Suspense>`：React 19.3 会把 Suspense 的
 * 「fallback → 内容」揭示本身视为 ViewTransition 激活源（与是否处于
 * startTransition 无关），放在 `<ViewTransition name="page">` 子树里时，
 * 刷新后首页会在 chunk 到位时自动播放一次页面级斜切转场（幽灵转场），
 * 与用户随后的导航转场相撞，表现为「第一次切换抖动、之后转场失效」。
 * 普通 setState 的挂载按 React 规则永不激活 ViewTransition，因此首屏下方
 * 这些「不该有转场」的懒加载位一律用本组件。路由级懒加载（App.tsx）不适用
 * ——那里的揭示正是导航转场本身。
 */
export function LazyReveal({ load, fallback, children }: LazyRevealProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    let alive = true;
    void load().then(resolved => {
      // 加载期间组件可能已被卸载（如 unmountOnExit 滚出视口），守一下。
      if (alive) setComponent(() => resolved as React.ComponentType<any>);
    });
    return () => {
      alive = false;
    };
  }, [load]);

  return Component ? children(Component) : fallback;
}

export default LazyReveal;
