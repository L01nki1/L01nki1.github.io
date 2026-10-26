'use client';

/**
 * GlareHover —— 悬停时掠过卡面的镜面眩光（ReactBits 移植，纯 CSS 渐变条 + rAF，无 canvas）。
 *
 * 原理：一条按眩光强度曲线生成的不透明度渐变「光带」，rotate 后叠在卡面上，
 * 由 rAF 引擎驱动 translateX 掠过。四种模式：hover（进/出各扫一次）、
 * follow（光带跟随指针、弹簧跟随）、loop（定时自动扫）、click（点击触发）。
 * 尊重 prefers-reduced-motion（禁扫光、follow 模式隐藏光带）。
 */
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

import './GlareHover.css';

/** 眩光形态：streak 单条主光、twin 双光带、sheen 宽幅柔光。 */
type Variant = 'streak' | 'twin' | 'sheen';
/** 触发模式。 */
type Mode = 'hover' | 'follow' | 'loop' | 'click';

interface GlareHoverProps {
  width?: string;
  height?: string;
  background?: string;
  borderRadius?: string;
  borderColor?: string;
  children?: ReactNode;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  softness?: number;
  variant?: Variant;
  blendMode?: CSSProperties['mixBlendMode'];
  rimGlint?: boolean;
  mode?: Mode;
  transitionDuration?: number;
  interval?: number;
  playOnce?: boolean;
  intro?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** 一次定速扫光的描述：从 from 到 to，start 时刻起 duration 毫秒。 */
interface Sweep {
  from: number;
  to: number;
  start: number;
  duration: number;
}

/** 五次多项式 smootherstep：两端加速度为 0 的平滑缓动。 */
const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/** 单峰包络：t 离 center 超过半宽 half 即为 0，否则按 smootherstep 上升。 */
const bump = (t: number, center: number, half: number) => {
  const distance = Math.abs(t - center);
  return distance >= half ? 0 : smootherstep(1 - distance / half);
};

/** 各形态的光带强度曲线：主峰（+次峰）+ 低幅底光，softness 越大峰越宽。 */
const PROFILES: Record<Variant, (t: number, softness: number) => number> = {
  streak: (t: number, softness: number) => bump(t, 0.5, 0.06 + 0.16 * softness) + 0.32 * bump(t, 0.5, 0.5),
  twin: (t: number, softness: number) =>
    bump(t, 0.36, 0.08 + 0.18 * softness) + 0.85 * bump(t, 0.7, 0.03 + 0.06 * softness) + 0.26 * bump(t, 0.5, 0.5),
  sheen: (t: number, softness: number) => 0.55 * bump(t, 0.5, 0.25 + 0.25 * softness) + 0.3 * bump(t, 0.5, 0.5)
};

/** 把强度曲线采样成 33 段 color-mix 线性渐变（不透明度精度 0.1%）。 */
const gradient = (color: string, opacity: number, variant: Variant, softness: number) => {
  const profile = PROFILES[variant] ?? PROFILES.streak;
  const stops = Array.from({ length: 33 }, (_, index) => {
    const t = index / 32;
    const alpha = Math.round(Math.min(1, profile(t, softness) * opacity) * 1000) / 10;
    return `color-mix(in srgb, ${color} ${alpha}%, transparent) ${(t * 100).toFixed(1)}%`;
  });
  return `linear-gradient(90deg, ${stops.join(', ')})`;
};

/** 半余弦缓动（sine-in-out），用于定速扫光的位置插值。 */
const ease = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;

const GlareHover = ({
  width = 'auto',
  height = 'auto',
  background = 'transparent',
  borderRadius = '10px',
  borderColor = 'transparent',
  children,
  glareColor = '#ffffff',
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 30,
  softness = 0.6,
  variant = 'streak',
  blendMode = 'screen',
  rimGlint = true,
  mode = 'hover',
  transitionDuration = 650,
  interval = 3,
  playOnce = false,
  intro = false,
  className = '',
  style = {}
}: GlareHoverProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLSpanElement>(null);
  const bandRef = useRef<HTMLSpanElement>(null);
  const rimRef = useRef<HTMLSpanElement>(null);
  const engineRef = useRef<{ measure: () => void } | null>(null);
  const introRef = useRef(false);
  const settings = { glareAngle, glareSize, transitionDuration, interval, playOnce, intro };
  // 设置快照进 ref：rAF 引擎读取最新配置而不必重建监听
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // 主引擎：几何测量 + rAF 帧循环 + 指针/焦点/可见性监听，只在 mode 变化时重建
  useEffect(() => {
    const root = rootRef.current;
    const glare = glareRef.current;
    if (!root || !glare) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // 几何缓存：光带宽度 / 单向行程 / 光带方向单位向量 / 角度
    const geometry = { band: 0, reach: 0, ux: 0, uy: -1, angle: 0 };
    // 运行时状态：光带位置、速度（follow 模式弹簧用）、出现度、当前定速扫光
    const state = {
      pos: 0,
      velocity: 0,
      target: 0,
      presence: 0,
      presenceTarget: 0,
      sweep: null as Sweep | null,
      visible: true
    };
    let raf = 0;
    let last = 0;
    let timer = 0;

    const bands = () => [bandRef.current, rimRef.current].filter((band): band is HTMLSpanElement => Boolean(band));

    // 把光带位置/角度/出现度写进 DOM（transform + opacity）
    const write = () => {
      const transform = `translate(-50%, -50%) rotate(${geometry.angle - 90}deg) translateX(${state.pos.toFixed(2)}px)`;
      for (const band of bands()) band.style.transform = transform;
      glare.style.opacity = state.presence.toFixed(3);
    };

    // 测量：按容器尺寸与 glareSize 求光带宽度和单向行程；静止时把光带贴到边缘待命
    const measure = () => {
      const { glareAngle: angle, glareSize: size } = settingsRef.current;
      const width = root.clientWidth;
      const height = root.clientHeight;
      const radians = (angle * Math.PI) / 180;
      const ux = Math.sin(radians);
      const uy = -Math.cos(radians);
      const diagonal = Math.hypot(width, height);
      const band = Math.max(8, (diagonal * size) / 100);
      const reach = (Math.abs(width * ux) + Math.abs(height * uy)) / 2 + band / 2 + 2;
      const resting = !state.sweep && mode !== 'follow';
      Object.assign(geometry, { band, reach, ux, uy, angle });
      for (const element of bands()) {
        element.style.width = `${band}px`;
        element.style.height = `${diagonal + band}px`;
      }
      if (resting) state.pos = state.pos > 0 ? reach : -reach;
      write();
    };

    // rAF 帧循环：定速扫光用 ease 插值；follow 模式用弹簧（固定 120Hz 子步进积分）+ 出现度指数逼近；空闲即停帧
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      let moving = false;
      if (state.sweep) {
        const sweep = state.sweep;
        const t = Math.min(1, (now - sweep.start) / sweep.duration);
        state.pos = sweep.from + (sweep.to - sweep.from) * ease(t);
        if (t < 1) moving = true;
        else state.sweep = null;
      } else if (mode === 'follow') {
        const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
        const h = dt / steps;
        for (let i = 0; i < steps; i++) {
          state.velocity += (170 * (state.target - state.pos) - 24 * state.velocity) * h;
          state.pos += state.velocity * h;
        }
        const tau = state.presenceTarget > state.presence ? 0.18 : 0.4;
        state.presence += (state.presenceTarget - state.presence) * (1 - Math.exp(-dt / tau));
        moving =
          Math.abs(state.target - state.pos) > 0.05 ||
          Math.abs(state.velocity) > 0.05 ||
          Math.abs(state.presenceTarget - state.presence) > 0.002;
        if (!moving) state.presence = state.presenceTarget;
      }
      write();
      raf = moving ? requestAnimationFrame(frame) : 0;
    };

    // 唤醒帧循环（幂等：已有 rAF 在跑则忽略）
    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    // 定速扫光：从当前位置掠到 sign 方向的边缘；时长按剩余行程占比缩放
    const sweep = (sign: number) => {
      if (reduced || !geometry.reach) return;
      const end = sign * geometry.reach;
      const from = state.sweep || Math.abs(state.pos) < geometry.reach ? state.pos : -end;
      if (from === end) return;
      const share = Math.abs(end - from) / (2 * geometry.reach);
      state.sweep = {
        from,
        to: end,
        start: performance.now(),
        duration: Math.max(120, settingsRef.current.transitionDuration * share)
      };
      wake();
    };

    // 指针位置在光带方向上的投影（决定光带该在哪儿）
    const along = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      return dx * geometry.ux + dy * geometry.uy;
    };

    const follow = (event: PointerEvent) => {
      state.target = Math.max(-geometry.reach, Math.min(geometry.reach, along(event)));
      wake();
    };

    const onEnter = (event: PointerEvent) => {
      if (mode === 'hover') sweep(along(event) > 0 ? -1 : 1);
      if (mode === 'follow') {
        if (state.presence < 0.02) {
          state.pos = Math.max(-geometry.reach, Math.min(geometry.reach, along(event)));
          state.velocity = 0;
        }
        state.presenceTarget = reduced ? 0 : 1;
        follow(event);
      }
    };

    const onMove = (event: PointerEvent) => {
      if (mode === 'follow') follow(event);
    };

    const onLeave = (event: PointerEvent) => {
      if (mode === 'hover' && !settingsRef.current.playOnce) sweep(along(event) > 0 ? 1 : -1);
      if (mode === 'follow') {
        state.presenceTarget = 0;
        wake();
      }
    };

    const onDown = (event: PointerEvent) => {
      if (mode === 'click') sweep(along(event) > 0 ? -1 : 1);
    };

    const onFocus = (event: FocusEvent) => {
      if (mode !== 'follow' && (event.target as Element | null)?.matches?.(':focus-visible')) sweep(1);
    };

    // loop 模式：每 interval 秒自动扫一次（页面隐藏时跳过但保留节拍）
    const schedule = () => {
      window.clearTimeout(timer);
      if (mode !== 'loop' || reduced) return;
      timer = window.setTimeout(
        () => {
          if (state.visible && !document.hidden) sweep(1);
          schedule();
        },
        Math.max(0.5, settingsRef.current.interval) * 1000
      );
    };

    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('focusin', onFocus);

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(root);

    // intro：首次进入视口时主动扫一次光
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        state.visible = entry.isIntersecting;
        if (entry.isIntersecting && settingsRef.current.intro && !introRef.current) {
          introRef.current = true;
          sweep(1);
        }
      },
      { threshold: 0.4 }
    );
    visibilityObserver.observe(root);

    state.presence = mode === 'follow' ? 0 : 1;
    state.presenceTarget = state.presence;
    state.pos = -1e4;
    measure();
    schedule();
    engineRef.current = { measure };

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('focusin', onFocus);
      engineRef.current = null;
    };
  }, [mode]);

  useEffect(() => {
    engineRef.current?.measure();
  }, [glareAngle, glareSize, rimGlint]);

  const glare = gradient(glareColor, glareOpacity, variant, softness);
  const rim = gradient(glareColor, Math.min(1, glareOpacity * 1.8), variant, softness);

  return (
    <div
      ref={rootRef}
      className={`glare-hover ${className}`.trim()}
      style={
        {
          '--gh-width': width,
          '--gh-height': height,
          '--gh-bg': background,
          '--gh-br': borderRadius,
          '--gh-border': borderColor,
          '--gh-glare': glare,
          '--gh-rim': rim,
          '--gh-blend': blendMode,
          ...style
        } as CSSProperties
      }
    >
      {children}
      <span ref={glareRef} className="glare-hover__glare" aria-hidden="true">
        <span ref={bandRef} className="glare-hover__band" />
        {rimGlint && (
          <span className="glare-hover__rim">
            <span ref={rimRef} className="glare-hover__band glare-hover__band--rim" />
          </span>
        )}
      </span>
    </div>
  );
};

export default GlareHover;
