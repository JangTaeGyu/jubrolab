import type { MetadataRoute } from 'next';
import { SITE } from '@/data/site';

/** 막을 것이 없는 사이트다. sitemap 주소만 알려준다. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
