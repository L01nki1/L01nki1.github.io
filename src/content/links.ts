import type { LinkCard } from './types';

/** 图片路径必须走 BASE_URL，换 base 时不会 404。 */
const img = (file: string): string => `${import.meta.env.BASE_URL}images/${file}`;

/**
 * ② 屏「图像 / 外链」卡片数据。
 * TODO(Q2): 站点清单与配图仍是 mock —— 换成真实站点时只改这个文件的 name/blurb/href/image。
 * 占位图指向 public/images/placeholder-*.svg（16:10），缺图时 LinkCard 会兜底成灰块 + mono 角标。
 */
export const LINKS: readonly LinkCard[] = Object.freeze([
  {
    name: 'Are.na',
    blurb: '把看过的东西，按自己的逻辑挂在频道里。',
    href: 'https://www.are.na/',
    image: img('placeholder-1.svg'),
  },
  {
    name: 'Read.cv',
    blurb: '职业与作品的一条时间线。',
    href: 'https://read.cv/',
    image: img('placeholder-2.svg'),
  },
  {
    name: 'GitHub',
    blurb: '仓库、提交记录，以及没写完的实验。',
    href: 'https://github.com/L01nki1',
    image: img('placeholder-3.svg'),
  },
]);
