import type { NoticiaItem } from '../../../features/vpn/hooks/useNoticias';
import NewsItem from './NewsItem';
import NewsItemSkeleton from './NewsItemSkeleton';
import NewsEmptyState from './NewsEmptyState';
import NewsErrorState from './NewsErrorState';

interface NewsListProps {
  items: NoticiaItem[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  onOpen: (item: NoticiaItem) => void;
}

export function NewsList({ 
  items, 
  loading, 
  error, 
  reload, 
  onOpen 
}: NewsListProps) {
  // Loading state (initial load)
  if (loading && items.length === 0) {
    return (
      <div className="news-list">
        {Array.from({ length: 6 }).map((_, i) => (
          <NewsItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error state (no items loaded)
  if (error && items.length === 0) {
    return <NewsErrorState error={error} onRetry={reload} />;
  }

  // Empty state
  if (!loading && !error && items.length === 0) {
    return <NewsEmptyState />;
  }

  // Success state
  return (
    <div className="news-list">
      {items.map((item) => (
        <NewsItem 
          key={item.id} 
          item={item} 
          onClick={onOpen} 
        />
      ))}
    </div>
  );
}

export default NewsList;
