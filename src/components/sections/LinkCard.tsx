import { useState } from 'react';

import GlareHover from '@/components/bits/GlareHover';
import MediaPlaceholder from '@/components/ui/MediaPlaceholder';
import type { LinkCard as LinkCardData } from '@/content/types';

export interface LinkCardProps {
  link: LinkCardData;
  /** 用于展示序号（mono 角标）。 */
  index: number;
}

/**
 * ② 屏横向卡：16:10 图 + 站名 + 一句描述 + 箭头。
 * - GlareHover 斜向高光扫过；图片 hover `scale(1.03)`。
 * - 图片缺失或加载失败 → 灰块 + mono 角标，不出现破图图标。
 */
export function LinkCard({ link, index }: LinkCardProps) {
  const [broken, setBroken] = useState<boolean>(false);
  const showImage = link.image.trim().length > 0 && !broken;

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${link.name}（在新标签打开）`}
      className="group block h-full w-full rounded-[16px]"
    >
      <GlareHover
        width="100%"
        borderRadius="16px"
        background="#0E1013"
        borderColor="rgba(255, 255, 255, 0.08)"
        glareColor="#54E6F0"
        glareOpacity={0.14}
        glareAngle={-28}
        glareSize={320}
        softness={0.6}
        variant="streak"
        rimGlint
        blendMode="screen"
        transitionDuration={520}
        className="h-full w-full"
      >
        <div className="flex w-full flex-col">
          <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-line">
            {showImage ? (
              <img
                src={link.image}
                alt={`${link.name} 站点配图`}
                loading="lazy"
                decoding="async"
                onError={() => setBroken(true)}
                className="h-full w-full object-cover transition-transform duration-[520ms] ease-brand group-hover:scale-[1.03]"
                style={{ filter: 'grayscale(.9) brightness(1.02) contrast(1.1)' }}
              />
            ) : (
              <MediaPlaceholder
                label={`IMAGE ${String(index + 1).padStart(2, '0')} / TODO`}
                alt={`${link.name} 配图占位`}
                className="h-full w-full"
              />
            )}
            <span className="absolute top-3 right-3 rounded-full bg-bg/70 px-2 py-0.5 font-mono text-[10px] tracking-[0.18em] text-faint uppercase backdrop-blur-sm">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-start justify-between gap-4 p-5">
            <div className="min-w-0">
              <p className="font-display text-base font-semibold text-text">{link.name}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{link.blurb}</p>
            </div>
            <span
              aria-hidden="true"
              className="mt-0.5 shrink-0 font-mono text-sm text-accent transition-transform duration-[200ms] ease-brand group-hover:translate-x-1"
            >
              ↗
            </span>
          </div>
        </div>
      </GlareHover>
    </a>
  );
}

export default LinkCard;
