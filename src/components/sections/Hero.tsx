import { Link } from 'react-router-dom';

import BlurText from '@/components/bits/BlurText';
import LetterGlitch from '@/components/bits/LetterGlitch';
import InView from '@/components/ui/InView';
import { SITE } from '@/content/site';
import { useIsLowPowerDevice } from '@/hooks/useMedia';

/**
 * 首屏 Hero。
 *
 * - 背景是 LetterGlitch 实例 B（interactive）：滚出视口 200px 就卸载 → canvas 从 DOM 消失。
 * - 无 WebGL2 时组件渲染空 canvas，所以底下必须垫 CSS 径向渐变（不能是纯黑）。
 * - 可读性三道保险：① centerFade ② 标题底衬 rgba(8,9,11,.55) + backdrop-blur ③ 大字号粗体。
 * - 本文件禁止静态 import AnimatedContent / gsap / marked / SideRays / CardSwap（首屏预算）。
 */
export function Hero() {
  const lowPower = useIsLowPowerDevice();

  return (
    <section className="sec-hero relative flex min-h-screen flex-col justify-center overflow-hidden">
      {/* 背景：CSS 兜底渐变（在下）+ 字母场（在上） */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(at 80% 0%, #101826, transparent 60%), var(--color-bg)',
        }}
      >
        <InView unmountOnExit rootMargin="200px" className="h-full w-full">
          <LetterGlitch
            interactive
            density={lowPower ? 0.45 : 0.9}
            fontSize={15}
            glitchAmount={0.18}
            speed={0.5}
            centerFade={0.6}
            edgeFade={0.3}
            baseOpacity={0.25}
            clickEffect="none"
            dpr={lowPower ? 1 : undefined}
            className="absolute inset-0"
          />
        </InView>
        {/* 顶部与底部渐隐，让 Nav 与下一屏的边界更干净 */}
        <div
          className="absolute inset-x-0 top-0 h-40"
          style={{ background: 'linear-gradient(to bottom, var(--color-bg), transparent)' }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-48"
          style={{ background: 'linear-gradient(to top, var(--color-bg), transparent)' }}
        />
      </div>

      <div className="hp-container relative z-10 pt-32 pb-24">
        <p className="hp-eyebrow">Portfolio / 2026</p>

        <h1 className="mt-5 max-w-[16ch]">
          {/* 标题底衬：噪点再密也不影响对比度 */}
          <span className="-mx-2 inline-block rounded-[18px] bg-bg/55 px-2 py-1 backdrop-blur-[6px] md:-mx-3 md:px-3">
            <BlurText
              text={SITE.name}
              trigger="load"
              effect="blur"
              animateBy="letters"
              direction="top"
              delay={120}
              className="m-0 font-display text-hero font-bold text-text"
            />
          </span>
        </h1>

        <p
          className="mt-6 max-w-[46ch] text-base leading-relaxed text-muted md:text-lg"
          style={{ textShadow: '0 2px 18px rgba(8, 9, 11, 0.95)' }}
        >
          {SITE.bio}
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a href="#projects" className="hp-btn hp-btn--primary">
            查看项目
            <span aria-hidden="true">→</span>
          </a>
          <Link to="/journal" className="hp-btn hp-btn--ghost">
            读日记
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* 右下角状态行 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10">
        <div className="hp-container flex items-end justify-between gap-6">
          <p className="font-mono text-[10px] tracking-[0.24em] text-faint uppercase">
            Scroll ↓
          </p>
          <p className="font-mono text-[10px] tracking-[0.24em] text-muted uppercase">
            {SITE.statusLine}
          </p>
        </div>
      </div>
    </section>
  );
}

export default Hero;
