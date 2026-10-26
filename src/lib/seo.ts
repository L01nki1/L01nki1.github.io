import { useEffect } from 'react';

import { SITE } from '@/content/site';

export interface PageMeta {
  /** 页面标题；站点名会自动追加在后缀里。 */
  title: string;
  description?: string;
  /** OG 图路径，默认站点占位图。 */
  image?: string;
}

const DEFAULT_DESCRIPTION = SITE.bio;
const DEFAULT_IMAGE = `${import.meta.env.BASE_URL}og-image.png`;
const SEPARATOR = ' · ';

/** 找（或按需创建）一个 meta 标签并写入 content。 */
function upsertMeta(selector: string, attrs: Record<string, string>): void {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'content') continue;
      element.setAttribute(key, value);
    }
    document.head.appendChild(element);
  }
  element.setAttribute('content', attrs.content);
}

/** `<title>` + description + OG/Twitter 同步。每页 title 唯一（P0-13）。 */
export function applyPageMeta({ title, description, image }: PageMeta): void {
  const fullTitle = title.includes(SITE.name) ? title : `${title}${SEPARATOR}${SITE.name}`;
  const desc = description ?? DEFAULT_DESCRIPTION;
  const ogImage = image ?? DEFAULT_IMAGE;

  document.title = fullTitle;

  upsertMeta('meta[name="description"]', { name: 'description', content: desc });
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: desc });
  upsertMeta('meta[property="og:image"]', { property: 'og:image', content: ogImage });
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: desc });
  upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: ogImage });
}

/** 页面挂载时写入元信息，卸载时不做回滚（下一次挂载会覆盖）。 */
export function usePageMeta(meta: PageMeta): void {
  const { title, description, image } = meta;
  useEffect(() => {
    applyPageMeta({ title, description, image });
  }, [title, description, image]);
}
