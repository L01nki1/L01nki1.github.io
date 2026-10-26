import Hero from '@/components/sections/Hero';
import JournalTeaser from '@/components/sections/JournalTeaser';
import LinksSection from '@/components/sections/LinksSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import { SITE } from '@/content/site';
import { getLatest } from '@/lib/journal';
import { usePageMeta } from '@/lib/seo';

/**
 * 首页：Hero → ① 项目 → ② 外链 → ③ 日记入口。
 * 最新 3 篇在渲染时一次性取（draft 已过滤、倒序），页面自身不排序、不筛 draft。
 */
export function Home() {
  const latest = getLatest(3);

  usePageMeta({
    title: '个人主页',
    description: SITE.bio,
  });

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
