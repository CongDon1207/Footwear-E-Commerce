/**
 * Skeleton loading component for product cards and other UI elements.
 * Provides visual feedback during data loading.
 */

/**
 * Base skeleton element with pulse animation
 */
export const Skeleton = ({ className = '' }) => (
  <div
    className={`animate-pulse bg-surface-tertiary rounded ${className}`}
    aria-hidden="true"
  />
);

/**
 * Skeleton for product cards - matches ProductCard layout
 */
export const ProductCardSkeleton = () => (
  <div className="card overflow-hidden">
    {/* Image placeholder */}
    <div className="relative aspect-square bg-surface-tertiary animate-pulse" />

    {/* Info placeholder */}
    <div className="p-4 space-y-3">
      {/* Category */}
      <Skeleton className="h-3 w-16" />
      
      {/* Product name - 2 lines */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      {/* Price */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  </div>
);

/**
 * Grid of skeleton product cards
 */
export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

/**
 * Skeleton for category cards
 */
export const CategoryCardSkeleton = () => (
  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-surface-tertiary animate-pulse">
    <div className="absolute inset-x-0 bottom-0 p-6 space-y-2">
      <Skeleton className="h-6 w-20 bg-white/20" />
      <Skeleton className="h-4 w-24 bg-white/20" />
    </div>
  </div>
);

/**
 * Skeleton for cart item
 */
export const CartItemSkeleton = () => (
  <div className="card p-4 md:p-6">
    <div className="flex gap-4 md:gap-6">
      {/* Image */}
      <Skeleton className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-md" />

      {/* Details */}
      <div className="flex-1 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-24" />
        <div className="flex items-center justify-between mt-4">
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>

      {/* Subtotal */}
      <div className="hidden md:block space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton for order summary
 */
export const OrderSummarySkeleton = () => (
  <div className="card p-6 space-y-4">
    <Skeleton className="h-6 w-32" />
    <div className="space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
      <hr className="border-border" />
      <div className="flex justify-between">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-6 w-28" />
      </div>
    </div>
    <Skeleton className="h-12 w-full rounded-xl" />
  </div>
);

export default Skeleton;
