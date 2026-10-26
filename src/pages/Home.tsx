import { useEffect } from 'react';

import Hero from '@/components/sections/Hero';
import JournalTeaser from '@/components/sections/JournalTeaser';
import LinksSection from '@/components/sections/LinksSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import { getLatest } from '@/lib/journal';
import { prefetchJournalWhenIdle } from '@/lib/prefetch';
import { usePageMeta } from '@/lib/seo';

/**
 * 首页：Hero → ① 项目 → ② 外链 → ③ 日记入口。
 * 最新 3 篇在渲染时一次性取（draft 已过滤、倒序），页面自身不排序、不筛 draft。
 */
export function Home() {
  const latest = getLatest(3);

  usePageMeta({
    title: '个人主页',
    // 不传 description：留空即回落到 seo.ts 的 DEFAULT_DESCRIPTION（= SITE.description）。
    // 之前这里传 SITE.bio，会在运行时把 head 里的静态 description 覆盖掉，
    // 造成「静态 meta 改了但首页分享/搜索结果仍是旧文案」。
  });

  // 首屏空闲后预取日记列表 chunk：不抢关键资源，点「日记」时零等待。
  useEffect(() => {
    prefetchJournalWhenIdle();
  }, []);

  return (
    <>
      <Hero />
      <ProjectsSection />
      <LinksSection />
      <JournalTeaser posts={latest} />
    </>
  );
}

export default Home;
