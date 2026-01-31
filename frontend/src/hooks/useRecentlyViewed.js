import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'footwear_recently_viewed';
const MAX_ITEMS = 20;

/**
 * Hook to track and retrieve recently viewed products
 * Stores minimal product data in localStorage
 */
export const useRecentlyViewed = () => {
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load recently viewed:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Failed to save recently viewed:', error);
      }
    }
  }, [items, isLoaded]);

  /**
   * Add a product to recently viewed
   * @param {Object} product - Product object with _id, name, images, price, discount, category
   */
  const addProduct = useCallback((product) => {
    if (!product || !product._id) return;

    setItems((prev) => {
      // Remove if already exists (will be re-added at front)
      const filtered = prev.filter((item) => item._id !== product._id);

      // Create minimal product data
      const newItem = {
        _id: product._id,
        name: product.name,
        image: product.images?.[0] || '',
        price: product.price,
        discount: product.discount || 0,
        category: product.category,
        viewedAt: Date.now(),
      };

      // Add to front and cap at MAX_ITEMS
      return [newItem, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  /**
   * Clear all recently viewed items
   */
  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  /**
   * Remove a specific product from recently viewed
   */
  const removeProduct = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item._id !== productId));
  }, []);

  /**
   * Get recently viewed items (excluding a specific product, e.g., current one)
   */
  const getItems = useCallback(
    (excludeId = null, limit = 10) => {
      let result = items;
      if (excludeId) {
        result = result.filter((item) => item._id !== excludeId);
      }
      return result.slice(0, limit);
    },
    [items]
  );

  return {
    items,
    isLoaded,
    addProduct,
    removeProduct,
    clearAll,
    getItems,
    count: items.length,
  };
};

export default useRecentlyViewed;
