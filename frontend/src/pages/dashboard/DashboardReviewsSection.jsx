import { Link } from 'react-router-dom';
import { Loader2, MessageSquare, Package, Star } from 'lucide-react';

export default function DashboardReviewsSection({
  formatDate,
  myReviews,
  reviewsLoading,
  reviewsCount,
}) {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden mb-6 md:mb-8">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          My Reviews
          {reviewsCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-primary-light text-primary rounded-full">
              {reviewsCount}
            </span>
          )}
        </h2>
      </div>

      <div className="p-5">
        {reviewsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : myReviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-secondary flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-text-muted" />
            </div>
            <p className="text-text-secondary mb-4">You haven't written any reviews yet</p>
            <Link to="/orders" className="btn btn-primary btn-sm cursor-pointer">
              Review Purchased Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myReviews.map((review) => (
              <Link
                key={review._id}
                to={`/products/${review.productId}`}
                className="flex flex-col p-4 bg-surface-secondary rounded-xl hover:bg-surface-tertiary transition-all duration-200 group cursor-pointer"
              >
                <div className="w-full h-32 rounded-lg overflow-hidden bg-white mb-3 border border-border">
                  {review.productImage ? (
                    <img
                      src={review.productImage}
                      alt={review.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-10 h-10 text-text-muted" />
                    </div>
                  )}
                </div>

                <p className="font-semibold text-text-primary group-hover:text-primary transition-colors duration-200 truncate">
                  {review.productName}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? 'fill-warning text-warning'
                            : 'fill-none text-border-input'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-text-muted">{formatDate(review.createdAt)}</span>
                </div>
                {review.comment && (
                  <p className="text-sm text-text-secondary mt-2 line-clamp-2">{review.comment}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
