import { MetadataRoute } from 'next'
import { AUDIENCE_SLUGS } from '@/lib/audience-landing'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.thesquad.pro'
  const lastModified = new Date()
  
  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/how-to`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/refer-a-coach`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...AUDIENCE_SLUGS.map(audience => ({
      url: `${baseUrl}/for/${audience}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
