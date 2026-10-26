import type { Project } from './types';

/**
 * 项目集合（Bento 网格数据源）。
 * 3 条真实项目已核实；第 4 格是「更多项目 → GitHub」CTA，由 ProjectsGrid 渲染。
 * 网格密度按 2 大 4 小设计，真实条目不足时用 CTA + 注释掉的 TODO 条目补齐演示效果。
 */
export const PROJECTS: readonly Project[] = Object.freeze([
  {
    slug: 'cityuhk-hub',
    title: 'CityUHK-Hub',
    oneLiner: 'CityUHK 开源项目的可检索索引站。',
    stack: ['React 19', 'Vite 6', 'Tailwind v4', 'Node.js'],
    href: 'https://cityu-hub.tech',
    year: 2026,
    status: 'shipped',
    featured: true,
  },
  {
    slug: 'isla',
    title: 'isla',
    oneLiner: 'CS5351 课程项目，正在建设中。',
    stack: ['TypeScript', 'Vite'],
    href: 'https://github.com/inscripoem/isla',
    year: 2026,
    status: 'wip',
  },
  {
    slug: 'naiwauhk',
    title: 'NaiwaUHK',
    oneLiner: '香港奶蛙大学.com —— 一个认真的玩笑。',
    stack: ['CSS', 'HTML'],
    href: 'https://xn--psszg58csy9abg2a1rx.com/',
    year: 2025,
    status: 'shipped',
  },
  // TODO: 替换为你的项目（保持网格密度，取消注释即上线）
  // {
  //   slug: 'placeholder-4',
  //   title: '项目名称',
  //   oneLiner: '一句话说明它解决什么问题。',
  //   stack: ['TypeScript'],
  //   href: 'https://example.com',
  //   year: 2025,
  //   status: 'wip',
  // },
  // TODO: 替换为你的项目（保持网格密度，取消注释即上线）
  // {
  //   slug: 'placeholder-5',
  //   title: '项目名称',
  //   oneLiner: '一句话说明它解决什么问题。',
  //   stack: ['Rust'],
  //   href: 'https://example.com',
  //   year: 2024,
  //   status: 'archived',
  // },
]);
