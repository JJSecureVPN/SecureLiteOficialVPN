export function NewsItemSkeleton() {
  return (
    <article className="news-item news-item--skeleton">
      <div className="news-item__media">
        <div className="news-item__image-skeleton skeleton" />
      </div>

      <div className="news-item__content">
        <div className="news-item__meta">
          <span className="news-item__category-skeleton skeleton" />
          <span className="news-item__date-skeleton skeleton" />
        </div>

        <div className="news-item__title-skeleton skeleton" />
        <div className="news-item__title-skeleton skeleton" style={{ width: '75%' }} />

        <div className="news-item__description-skeleton skeleton" />
        <div className="news-item__description-skeleton skeleton" style={{ width: '90%' }} />
      </div>
    </article>
  );
}

export default NewsItemSkeleton;
