import LinkCard from '@/components/sections/LinkCard';
import InView from '@/components/ui/InView';
import LazyReveal from '@/components/ui/LazyReveal';
import { LINKS } from '@/content/links';
import { useIsLowPowerDevice } from '@/hooks/useMedia';

/** 懒加载：SideRays 是 WebGL2，不能进首屏 chunk。
 *  用 LazyReveal 而非 lazy+Suspense —— Suspense 揭示会激活外层 page 转场（见 LazyReveal 注释）。 */
const loadSideRays = () => import('@/components/bits/SideRays').then(module => module.default);

/**
 * ② 屏底图光洗。
 *
 * 分工（v3）：**斜面光带是主角，大面积径向只是"余晖"**。
 * 上一版把 4 层大面积径向堆到 .48/.36/.13/.16，整屏被染成青蓝、和全站近黑底断裂，
 * 上下边缘还出现硬切直线（QA 全页截图抓到）。这一版：
 *   1. 大面积径向压到原来的 1/4 左右（.48→.11、.36→.09、.13→.12），
 *      并且**把径向的椭圆拉高到接近整屏高**——原来 1500×820 只覆盖顶部，
 *      光打不到底下，导致底部边带明显比中心暗，正是"上下两截"的成因之一
 *   2. 加一层底部落地光（violet），让竖向亮度剖面变平，边缘不再比中心暗一截
 *   3. 2 道 112° 斜向光带 alpha 不动（.16 / .13）—— 这才是"斜射光"的本体
 *   4. 整层 + 光束层都套纵向遮罩（theme.css `.hp-wash`），上下边缘淡出接回 #08090B
 *
 * 实测（1440 全页，② 屏 1000px 高）：纯背景口径 顶部/底部 与 中心差 1.6%，跨界单行阶跃 ≤0.1
 * 亮度单位；开关 `.side-rays` 整屏差 9.5%。
 */
const RAYS_WASH = [
  'radial-gradient(1400px 1350px at 88% -18%, rgba(84, 230, 240, 0.11), transparent 70%)',
  'radial-gradient(1150px 1150px at 110% 20%, rgba(113, 94, 209, 0.09), transparent 66%)',
  'radial-gradient(1200px 560px at 52% 112%, rgba(113, 94, 209, 0.12), transparent 66%)',
  'linear-gradient(112deg, transparent 32%, rgba(84, 230, 240, 0.16) 42%, transparent 52%)',
  'linear-gradient(112deg, transparent 55%, rgba(113, 94, 209, 0.13) 64%, transparent 73%)',
  'var(--color-bg)',
].join(', ');

/**
 * ② 屏副文案：数量由 `LINKS.length` 派生，不写死。
 * 0 条时换成空态说明——不要出现「0 个常去的站点」这种机器味句子。
 */
const LINKS_INTRO =
  LINKS.length > 0
    ? `${LINKS.length} 个常去的站点，值得单独开一页。图片仍是占位，换图只改 links.ts。`
    : '这一屏放我常去的站点，等清单定下来再回来填。';

/**
 * ② 屏「图像 / 外链」。
 *
 * 图层顺序（肉眼可验）：底图光洗 z-0 < SideRays 光束 z-10（screen 混合）
 * < 卡片与文字 z-20。光束是压在下层底图「之上」的覆盖层，不是垫在卡片背后。
 *
 * 弱设备（<768px 或内存 <4GB）关 dust、dpr 降 1。
 */
export function LinksSection() {
  const lowPower = useIsLowPowerDevice();

  return (
    <section className="sec-links hp-screen overflow-hidden">
      {/* z-0 底图层：CSS 光洗保证「斜射光」在无 WebGL2 / 弱 GPU 上也确定可见 */}
      <div aria-hidden="true" className="hp-wash absolute inset-0 z-0" style={{ background: RAYS_WASH }}>
        <div className="hp-grid-hair absolute inset-0 opacity-70" />
      </div>

      {/* z-10 光束层：screen 混合写在 .hp-rays 这一层（见 theme.css 注释） */}
      <div aria-hidden="true" className="hp-rays hp-wash absolute inset-0 z-10">
        <InView unmountOnExit rootMargin="300px" className="h-full w-full">
        <LazyReveal load={loadSideRays} fallback={null}>
          {SideRays => (
            <SideRays
              origin="top-right"
              rayColor1="#54E6F0"
              rayColor2="#715ED1"
              intensity={0.9}
              dust={lowPower ? 0 : 0.2}
              followMouse
              maxDevicePixelRatio={lowPower ? 1 : 1.5}
            />
          )}
        </LazyReveal>
        </InView>
      </div>

      {/* z-20 卡片层 */}
      <div className="hp-container relative z-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="hp-eyebrow">02 — Elsewhere</p>
            <h2 className="mt-3 font-display text-h2 font-semibold text-text">
              我在别处留下的痕迹
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted">{LINKS_INTRO}</p>
        </div>

        {LINKS.length > 0 ? (
          <ul className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {LINKS.map((link, index) => (
              <li key={link.href}>
                <LinkCard link={link} index={index} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 rounded-[16px] border border-dashed border-line-strong bg-white/[0.015] p-10 text-center">
            <p className="text-sm text-muted">外链清单还在整理，这一屏先空着。</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default LinksSection;
