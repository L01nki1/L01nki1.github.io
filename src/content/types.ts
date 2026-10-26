/** 内容层类型定义 —— 组件与页面只依赖这里的形状。 */

export type ProjectStatus = 'shipped' | 'wip' | 'archived';

/** 一个项目条目。`slug` 本版不参与路由，仅为将来的详情页预留。 */
export interface Project {
  slug: string;
  title: string;
  oneLiner: string;
  stack: string[];
  href: string;
  year: number;
  status?: ProjectStatus;
  featured?: boolean;
}

/** ② 屏的一张横向外链卡。 */
export interface LinkCard {
  name: string;
  blurb: string;
  href: string;
  image: string;
}

/** 日记元信息（不含正文）。 */
export interface JournalMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  draft: boolean;
  cover?: string;
  readingMin: number;
}

/** 日记全文。 */
export interface JournalPost extends JournalMeta {
  body: string;
}

/** 站点级文案与外链。 */
export interface Site {
  name: string;
  bio: string;
  /**
   * 站点描述 —— 唯一来源。
   *
   * 用途：SEO description、OG/Twitter 摘要、分享卡片文案。
   * 与 `bio` 分开：`bio` 是首屏要读给人看的一段话，可以长；
   * `description` 会被塞进搜索结果和分享卡片，要短、要能独立成立。
   * `index.html` 里的静态 meta 由 `vite.config.ts` 的插件在构建时注入本字段，
   * 不要再去 html 里手写，否则又会出现两套文案。
   */
  description: string;
  statusLine: string;
  /** 只读数组：内容层一律冻结，页面不得增删。 */
  links: readonly { label: string; href: string }[];
}
