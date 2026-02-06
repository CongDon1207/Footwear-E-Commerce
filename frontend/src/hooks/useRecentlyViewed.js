import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'footwear_recently_viewed';
const MAX_ITEMS = 20;

const loadStoredItems = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load recently viewed:', error);
    return [];
  }
};

/**
 * Hook to track and retrieve recently viewed products
 * Stores minimal product data in localStorage
 */
export const useRecentlyViewed = () => {
  const [items, setItems] = useState(() => loadStoredItems());

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save recently viewed:', error);
    }
  }, [items]);

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
    isLoaded: true,
    addProduct,
    removeProduct,
    clearAll,
    getItems,
    count: items.length,
  };
};

export default useRecentlyViewed;
