/**
 * 跳正文链接：页面里第一个可聚焦元素（P0 a11y）。
 * 默认移出屏幕，键盘聚焦时滑入。
 */
export function SkipLink() {
  return (
    <a
      href="#content"
      className={[
        'sr-only focus:not-sr-only',
        'focus:fixed focus:top-4 focus:left-4 focus:z-[60]',
        'focus:rounded-full focus:bg-accent focus:px-5 focus:py-2.5',
        'focus:font-mono focus:text-xs focus:tracking-wider focus:text-[#04131a]',
      ].join(' ')}
    >
      跳到正文
    </a>
  );
}

export default SkipLink;
