import { useEffect, useState } from 'react';

/**
 * 顶部 2px 阅读进度条。
 *
 * 只动 `transform: scaleX`（不动 width），所以不会引起任何布局计算与 CLS。
 * 进度 = 文档可滚动高度里的已滚比例，滚到底恰好 1。
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) {
        setProgress(1);
        return;
      }
      const ratio = window.scrollY / scrollable;
      setProgress(Math.min(1, Math.max(0, ratio)));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 h-[2px] bg-line"
      role="progressbar"
      aria-label="阅读进度"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      <div
        className="h-full origin-left bg-accent"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

export default ReadingProgress;
