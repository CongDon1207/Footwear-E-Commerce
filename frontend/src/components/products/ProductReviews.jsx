import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Star,
  MessageSquare,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Edit2,
  Trash2,
} from 'lucide-react';

/**
 * Product Reviews Section
 * Displays reviews and allows authenticated users to add reviews
 */
const ProductReviews = ({ productId }) => {
  const { isAuthenticated } = useAuth();

  // State
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review form state
  const [showForm, setShowForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form fields
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Pagination & sorting
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Fetch reviews
  const fetchReviews = useCallback(async (resetPage = false, pageOverride = null) => {
    try {
      const currentPage = resetPage ? 1 : pageOverride ?? page;
      const { data } = await api.get(
        `/reviews/products/${productId}?page=${currentPage}&limit=5&sortBy=${sortBy}`
      );
      
      if (resetPage) {
        setReviews(data.reviews);
        setPage(1);
      } else {
        setReviews(data.reviews);
      }
      
      setSummary(data.summary);
      setHasMore(data.pagination.page < data.pagination.pages);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [page, productId, sortBy]);

  // Check if user can review
  const checkCanReview = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const { data } = await api.get(`/reviews/products/${productId}/can-review`);
      setCanReview(data.canReview);
      setHasReviewed(data.hasReviewed);
      if (data.userReview) {
        setUserReview(data.userReview);
      }
    } catch (err) {
      console.error('Failed to check review status:', err);
    }
  }, [isAuthenticated, productId]);

  useEffect(() => {
    fetchReviews(true);
  }, [fetchReviews]);

  useEffect(() => {
    checkCanReview();
  }, [checkCanReview]);

  // Handle submit review
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    try {
      if (isEditing && userReview) {
        // Update existing review
        await api.put(`/reviews/products/${productId}/${userReview._id}`, {
          rating,
          title,
          comment,
        });
      } else {
        // Add new review
        await api.post(`/reviews/products/${productId}`, {
          rating,
          title,
          comment,
        });
      }

      // Reset form and refresh
      setShowForm(false);
      setIsEditing(false);
      setRating(5);
      setTitle('');
      setComment('');
      await fetchReviews(true);
      await checkCanReview();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete review
  const handleDelete = async () => {
    if (!userReview || !window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      await api.delete(`/reviews/products/${productId}/${userReview._id}`);
      await fetchReviews(true);
      await checkCanReview();
      setUserReview(null);
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  // Start editing
  const startEdit = () => {
    if (userReview) {
      setRating(userReview.rating);
      setTitle(userReview.title || '');
      setComment(userReview.comment || '');
      setIsEditing(true);
      setShowForm(true);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Render star rating
  const StarRating = ({ value, size = 'md', interactive = false }) => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
          >
            <Star
              className={`${sizeClass} ${
                star <= (interactive ? hoverRating || rating : value)
                  ? 'fill-warning text-warning'
                  : 'fill-none text-border-input'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Rating bar component
  const RatingBar = ({ stars, count, total }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="w-8 text-text-muted">{stars}</span>
        <Star className="w-4 h-4 fill-warning text-warning" />
        <div className="flex-1 h-2 bg-surface-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-warning rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="w-8 text-text-muted text-right">{count}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-8 border-t border-border">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h3 text-text-primary flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          Customer Reviews
        </h2>
        
        {isAuthenticated && canReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary btn-sm"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Summary & Distribution */}
      {summary && summary.totalReviews > 0 && (
        <div className="grid md:grid-cols-2 gap-6 mb-8 p-6 bg-surface-secondary rounded-xl">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <span className="text-5xl font-bold text-text-primary">
                {summary.averageRating.toFixed(1)}
              </span>
              <div>
                <StarRating value={summary.averageRating} size="lg" />
                <p className="text-sm text-text-muted mt-1">
                  {summary.totalReviews} {summary.totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <RatingBar
                key={stars}
                stars={stars}
                count={summary.ratingDistribution?.[stars] || 0}
                total={summary.totalReviews}
              />
            ))}
          </div>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="mb-8 p-6 bg-surface rounded-xl border border-border">
          <h3 className="font-semibold text-text-primary mb-4">
            {isEditing ? 'Edit Your Review' : 'Write a Review'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Your Rating
              </label>
              <StarRating value={rating} size="lg" interactive />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Review Title (optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience"
                maxLength={100}
                className="w-full px-4 py-2 border border-border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-2 border border-border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors resize-none"
              />
              <p className="text-xs text-text-muted mt-1 text-right">
                {comment.length}/1000
              </p>
            </div>

            {/* Error */}
            {submitError && (
              <div className="flex items-center gap-2 text-error text-sm">
                <AlertCircle className="w-4 h-4" />
                {submitError}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isEditing ? (
                  'Update Review'
                ) : (
                  'Submit Review'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setIsEditing(false);
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Login prompt */}
      {!isAuthenticated && (
        <div className="mb-8 p-6 bg-primary-light/50 rounded-xl text-center">
          <p className="text-text-primary mb-3">
            Want to share your experience?
          </p>
          <Link to="/login" className="btn btn-primary btn-sm">
            Login to Write a Review
          </Link>
        </div>
      )}

      {/* User's existing review */}
      {hasReviewed && userReview && !showForm && (
        <div className="mb-6 p-4 bg-success-light/50 rounded-xl border border-success/20">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">You reviewed this product</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={startEdit}
                className="p-2 text-text-muted hover:text-primary transition-colors cursor-pointer"
                title="Edit review"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-text-muted hover:text-error transition-colors cursor-pointer"
                title="Delete review"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sort dropdown */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-text-muted">
            Showing {reviews.length} of {summary?.totalReviews || 0} reviews
          </p>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 border border-border-input rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-secondary flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-text-muted" />
          </div>
          <p className="text-text-secondary">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="p-4 bg-surface rounded-xl border border-border"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{review.userName}</p>
                    <div className="flex items-center gap-2">
                      <StarRating value={review.rating} size="sm" />
                      {review.verified && (
                        <span className="flex items-center gap-1 text-xs text-success">
                          <CheckCircle className="w-3 h-3" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-text-muted">
                  {formatDate(review.createdAt)}
                </span>
              </div>

              {/* Review Content */}
              {review.title && (
                <h4 className="font-medium text-text-primary mb-2">{review.title}</h4>
              )}
              {review.comment && (
                <p className="text-text-secondary leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              fetchReviews(false, nextPage);
            }}
            className="btn btn-outline"
          >
            Load More Reviews
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductReviews;
