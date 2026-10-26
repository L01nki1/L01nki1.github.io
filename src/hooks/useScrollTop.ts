import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 路由切换时把视口拉回顶部。
 *
 * 三个细节都是有原因的：
 * 1. **只依赖 `pathname`**：首屏「查看项目」是 `#projects` 锚点，hash 变化绝不能跳顶，
 *    否则锚点滚动会被自己顶回去（点一次没反应）。
 * 2. **`useLayoutEffect`**：在浏览器绘制前同步执行，避免「先看到新页面的中间位置、
 *    一帧后再弹到顶部」的闪烁。
 * 3. **`behavior: 'instant'`**：`html` 上有 `scroll-behavior: smooth`，
 *    `behavior: 'auto'` 会**继承**那个 smooth，结果是从半路平滑滚上去（比直接跳更怪）。
 */
export function useScrollTop(): void {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
}

export default useScrollTop;
