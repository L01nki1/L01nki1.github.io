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
  statusLine: string;
  /** 只读数组：内容层一律冻结，页面不得增删。 */
  links: readonly { label: string; href: string }[];
}
