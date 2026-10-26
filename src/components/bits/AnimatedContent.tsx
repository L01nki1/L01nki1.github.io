'use client';

/**
 * AnimatedContent —— 基于 GSAP ScrollTrigger 的滚动入场动画包装器（ReactBits 移植）。
 *
 * 能力：位移/缩放/模糊/旋转/tilt 入场、子元素 stagger、渐变遮罩 wipe、
 * scrub 滚动绑定、展示一段时间后自动退场（disappearAfter）。
 * 尊重 prefers-reduced-motion：命中时直接可见、不播动画。
 *
 * ⚠️ 本组件静态 import 了 gsap + ScrollTrigger（体积较大），
 * 只能放在懒加载的页面 chunk 里（目前仅 Journal 系列使用），禁止进首屏。
 */
import { useEffect, useLayoutEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type AnimatedContentWipe = 'none' | 'up' | 'down' | 'left' | 'right' | 'center';
export type AnimatedContentStaggerFrom = 'start' | 'end' | 'center' | 'edges' | 'random';

export interface AnimatedContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onAnimationStart'> {
  children?: ReactNode;
  container?: Element | string | null;
  distance?: number;
  direction?: 'vertical' | 'horizontal';
  reverse?: boolean;
  duration?: number;
  ease?: string;
  initialOpacity?: number;
  animateOpacity?: boolean;
  scale?: number;
  blur?: number;
  rotate?: number;
  tilt?: number;
  wipe?: AnimatedContentWipe;
  threshold?: number;
  delay?: number;
  stagger?: number;
  staggerFrom?: AnimatedContentStaggerFrom;
  trigger?: 'scroll' | 'mount';
  once?: boolean;
  scrub?: boolean | number;
  disappearAfter?: number;
  disappearDuration?: number;
  disappearEase?: string;
  onStart?: () => void;
  onComplete?: () => void;
  onDisappearanceComplete?: () => void;
  className?: string;
  style?: CSSProperties;
}

/** 同构 layout effect：SSR 退化为 useEffect，浏览器端用 useLayoutEffect 避免首帧闪烁。 */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** wipe 遮罩模板：用 CSS 变量 `--ac-wipe`（0→1）驱动渐变遮罩的扫入进度。 */
const WIPES: Record<string, string> = {
  up: 'linear-gradient(to top, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  down: 'linear-gradient(to bottom, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  left: 'linear-gradient(to left, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  right: 'linear-gradient(to right, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  center:
    'radial-gradient(farthest-corner at 50% 50%, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))'
};

const AnimatedContent = ({
  children,
  container,
  distance = 100,
  direction = 'vertical',
  reverse = false,
  duration = 0.8,
  ease = 'power3.out',
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  blur = 0,
  rotate = 0,
  tilt = 0,
  wipe = 'none',
  threshold = 0.1,
  delay = 0,
  stagger = 0,
  staggerFrom = 'start',
  trigger = 'scroll',
  once = true,
  scrub = false,
  disappearAfter = 0,
  disappearDuration = 0.5,
  disappearEase = 'power3.in',
  onStart,
  onComplete,
  onDisappearanceComplete,
  className = '',
  style,
  ...props
}: AnimatedContentProps) => {
  // 回调存进 ref，让动画闭包始终拿到最新版本，又不触发 effect 重跑
  const ref = useRef<HTMLDivElement>(null);
  const callbacksRef = useRef({ onStart, onComplete, onDisappearanceComplete });
  callbacksRef.current = { onStart, onComplete, onDisappearanceComplete };

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    // 滚动容器：默认用 #snap-main-container（若存在），否则退回 window
    let scroller: Element | string | null = container || document.getElementById('snap-main-container') || null;
    if (typeof scroller === 'string') scroller = document.querySelector(scroller);

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    // gsap.context 收集本组件产生的所有动画/触发器，卸载时一次性 revert
    const ctx = gsap.context(() => {
      // 有 stagger 且有子元素时，把每个子元素作为独立目标分别入场
      const targets: Element[] = stagger > 0 && el.children.length ? Array.from(el.children) : [el];
      const horizontal = direction === 'horizontal';
      const axis = horizontal ? 'x' : 'y';
      const sign = reverse ? -1 : 1;
      const mask = WIPES[wipe];

      gsap.set(el, { visibility: 'visible' });

      // 用户偏好减少动效：跳过全部动画，只保留可见状态
      if (reduce) {
        callbacksRef.current.onComplete?.();
        return;
      }

      // from/to 两帧定义入场：从偏移位/缩放/透明度 → 归位
      const from: gsap.TweenVars = {
        [axis]: distance * sign,
        scale,
        opacity: animateOpacity ? initialOpacity : 1
      };
      const to: gsap.TweenVars = {
        [axis]: 0,
        scale: 1,
        opacity: 1,
        duration,
        ease
      };

      if (blur > 0) {
        from.filter = `blur(${blur}px)`;
        to.filter = 'blur(0px)';
      }
      if (rotate) {
        from.rotation = rotate * sign;
        to.rotation = 0;
      }
      if (tilt) {
        const tiltAxis = horizontal ? 'rotationY' : 'rotationX';
        from[tiltAxis] = horizontal ? -tilt * sign : tilt * sign;
        to[tiltAxis] = 0;
        from.transformPerspective = 900;
        to.transformPerspective = 900;
      }
      if (mask) {
        gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });
        from['--ac-wipe'] = 0;
        to['--ac-wipe'] = 1;
      }
      if (stagger > 0) to.stagger = { each: stagger, from: staggerFrom };

      // 动画结束后清掉内联 transform/filter/mask，避免影响后续布局与 hover 效果
      const settle = () => {
        if (scrub) return;
        gsap.set(targets, { clearProps: mask ? 'filter,transform,maskImage,webkitMaskImage' : 'filter,transform' });
      };

      // disappearAfter > 0 时：入场完成后延迟一段时间再整组退场
      const disappear = () => {
        if (disappearAfter <= 0) return;
        const out: gsap.TweenVars = {
          [axis]: -distance * sign,
          scale: 0.8,
          opacity: animateOpacity ? initialOpacity : 0,
          delay: disappearAfter,
          duration: disappearDuration,
          ease: disappearEase,
          onComplete: () => callbacksRef.current.onDisappearanceComplete?.()
        };
        if (blur > 0) out.filter = `blur(${blur}px)`;
        if (stagger > 0) out.stagger = { each: stagger, from: staggerFrom };
        gsap.to(targets, out);
      };

      // 主时间线：先暂停，由触发方式决定何时 play
      const tl = gsap.timeline({
        paused: true,
        onStart: () => callbacksRef.current.onStart?.(),
        onComplete: () => {
          callbacksRef.current.onComplete?.();
          settle();
          // once 模式：播完一次后再按 disappearAfter 安排退场
          if (once && !scrub) disappear();
        }
      });
      tl.fromTo(targets, from, to, scrub ? 0 : Math.max(delay, 0));

      // mount 模式：挂载即播，无需滚动触发
      if (trigger === 'mount') {
        tl.play();
        return;
      }

      // 触发点：元素顶部到达「视口高度 × threshold」处时入场
      const start = `top ${(1 - threshold) * 100}%`;

      // scrub 模式：动画进度与滚动位置绑定，而非一次性播放
      if (scrub) {
        ScrollTrigger.create({
          trigger: el,
          scroller,
          start,
          end: `top ${Math.max((1 - threshold) * 100 - 45, 5)}%`,
          scrub: scrub === true ? true : Math.max(Number(scrub) || 0, 0.01),
          animation: tl
        });
        return;
      }

      // 普通滚动触发模式；once=false 时滚回触发点上方会反向回退
      ScrollTrigger.create({
        trigger: el,
        scroller,
        start,
        once,
        onEnter: () => tl.play(),
        onLeaveBack: once
          ? undefined
          : () => {
              if (mask) gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });
              tl.reverse();
            }
      });
    }, el);

    return () => ctx.revert();
  }, [
    container,
    distance,
    direction,
    reverse,
    duration,
    ease,
    initialOpacity,
    animateOpacity,
    scale,
    blur,
    rotate,
    tilt,
    wipe,
    threshold,
    delay,
    stagger,
    staggerFrom,
    trigger,
    once,
    scrub,
    disappearAfter,
    disappearDuration,
    disappearEase
  ]);

  return (
    <div ref={ref} className={className} style={{ visibility: 'hidden', ...style }} {...props}>
      {children}
    </div>
  );
};

export default AnimatedContent;
