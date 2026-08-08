import type { MetadataRoute } from 'next';
import { SITE } from '@/data/site';

/**
 * 한 장짜리 사이트라 항목도 하나다. 프로젝트 상세는 주소가 따로 없고 같은 화면의
 * 패널로 열리므로 여기에 넣을 것이 없다 — 없는 주소를 적으면 색인이 404 를 만난다.
 *
 * lastModified 는 빌드 시각이다. 내용이 배포로만 바뀌므로 이게 사실에 가장 가깝다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
