'use client'

import { useQuery } from '@tanstack/react-query';
import { fetchData } from '@/api/api';
import { useLocale } from 'next-intl';
import UniversityAnalyticsDashboard from '@/components/ui/UniversityAnalytics';

export default function AnalyticsPage() {
  const locale = useLocale();
  
  const { data: universitiesData } = useQuery({
    queryKey: ['universities'],
    queryFn: async () => await fetchData({ url: '/api/universities' })
  });

  if (!universitiesData) {
    return <div>Loading...</div>;
  }

  return (
    <UniversityAnalyticsDashboard
      universities={universitiesData} 
      locale={locale}
    />
  );
}