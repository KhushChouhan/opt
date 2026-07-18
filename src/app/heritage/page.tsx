import type { Metadata } from 'next';
import HeritageExperience from '@/components/heritage/HeritageExperience';

export const metadata: Metadata = {
  title: 'The Heritage Collection | Hariyana Watch & Opticals',
  description: 'Discover authenticated antique watches, vintage timepieces and rare collectibles curated for passionate collectors.',
};

export default function HeritagePage() {
  return <HeritageExperience />;
}
