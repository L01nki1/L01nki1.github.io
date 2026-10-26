import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 767px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** 订阅一个 media query 并返回是否命中。SSR 下返回 false。 */
function useMediaQuery(query: string, initial = false): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return initial;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const list = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** 系统是否开启「减少动态效果」。 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY, false);
}

/** 是否窄屏（< 768px），决定叠卡是否降级成纵向列表、字母场密度是否减半。 */
export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_QUERY, false);
}

/** 设备内存（GB），不支持时返回 8，用于判断是否降级动效。 */
export function getDeviceMemory(): number {
  if (typeof navigator === 'undefined') return 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return typeof memory === 'number' && memory > 0 ? memory : 8;
}

/** 是否为弱设备：窄屏或内存 < 4GB。 */
export function useIsLowPowerDevice(): boolean {
  const isMobile = useIsMobile();
  const [lowMemory] = useState<boolean>(() => getDeviceMemory() < 4);
  return isMobile || lowMemory;
}
