import type { Site } from './types';

/**
 * 站点级文案 —— 全站唯一的手改文字入口。
 * 改名字、简介、状态行、联系方式，只动这个文件。
 */
export const SITE: Site = Object.freeze({
  name: 'Lowen',
  bio: '到底什么人会想到又学数学又学计算机呢',
  /** 站点描述：搜索结果与分享卡片的文案。改这一处，全站 meta 跟着变。 */
  description: '奶龙奶龙奶？！',
  statusLine: 'HK · CS & math',
  links: Object.freeze([
    { label: 'GitHub', href: 'https://github.com/L01nki1' },
    // 留空时页脚会自动隐藏该条目 —— 有意的空值保护，避免链到一个没有内容的页面。
    { label: 'Instagram', href: 'https://www.instagram.com/hiilowen' },
    // TODO: 想公开邮箱就取消下面这行注释并填真实地址；假地址比没有更糟。
    // { label: 'Email', href: 'mailto:you@example.com' },
  ]),
});

/** 导航项 —— 顺序即展示顺序。 */
export const NAV_ITEMS = Object.freeze([
  { label: '首页', href: '/' },
  { label: '日记', href: '/journal' },
] as const);

/** 「更多项目」CTA 的目标（Bento 网格最后一格）。 */
export const MORE_PROJECTS = Object.freeze({
  label: '更多项目',
  hint: '在 GitHub 上查看全部仓库、提交与实验',
  href: 'https://github.com/L01nki1',
});
