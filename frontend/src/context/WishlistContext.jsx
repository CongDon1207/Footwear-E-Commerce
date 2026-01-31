import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const WishlistContext = createContext(null);

const GUEST_WISHLIST_KEY = 'footwear_wishlist_guest';

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wishlist on mount or when auth changes
  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      try {
        if (isAuthenticated) {
          // Merge guest wishlist first, then fetch from server
          const guestWishlist = getGuestWishlist();
          if (guestWishlist.length > 0) {
            await mergeGuestWishlist(guestWishlist);
            clearGuestWishlist();
          }

          // Fetch user wishlist from server
          const { data } = await api.get('/wishlist');
          setItems(data.items || []);
        } else {
          // Load from localStorage for guests
          const guestItems = getGuestWishlist();
          setItems(guestItems.map((id) => ({ product: { _id: id } })));
        }
      } catch (error) {
        console.error('Failed to load wishlist:', error);
      } finally {
        setLoading(false);
        setIsLoaded(true);
      }
    };

    loadWishlist();
  }, [isAuthenticated, user]);

  // Guest wishlist helpers
  const getGuestWishlist = () => {
    try {
      const stored = localStorage.getItem(GUEST_WISHLIST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveGuestWishlist = (productIds) => {
    try {
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(productIds));
    } catch (error) {
      console.error('Failed to save guest wishlist:', error);
    }
  };

  const clearGuestWishlist = () => {
    localStorage.removeItem(GUEST_WISHLIST_KEY);
  };

  // Merge guest wishlist to server after login
  const mergeGuestWishlist = async (productIds) => {
    if (productIds.length === 0) return;
    try {
      await api.post('/wishlist/merge', { productIds });
    } catch (error) {
      console.error('Failed to merge wishlist:', error);
    }
  };

  // Check if product is in wishlist
  const isInWishlist = useCallback(
    (productId) => {
      return items.some((item) => {
        const itemProductId = item.product?._id || item.product;
        return itemProductId === productId;
      });
    },
    [items]
  );

  // Toggle wishlist (add/remove)
  const toggleWishlist = useCallback(
    async (product) => {
      const productId = product._id || product;
      const wasInWishlist = isInWishlist(productId);

      // Optimistic update
      if (wasInWishlist) {
        setItems((prev) =>
          prev.filter((item) => {
            const itemProductId = item.product?._id || item.product;
            return itemProductId !== productId;
          })
        );
      } else {
        // Add with product data if available
        const newItem =
          typeof product === 'object'
            ? { product, addedAt: new Date().toISOString() }
            : { product: { _id: productId }, addedAt: new Date().toISOString() };
        setItems((prev) => [newItem, ...prev]);
      }

      if (isAuthenticated) {
        try {
          await api.post(`/wishlist/${productId}/toggle`);
        } catch (error) {
          // Revert on error
          console.error('Failed to toggle wishlist:', error);
          if (wasInWishlist) {
            setItems((prev) => [
              { product, addedAt: new Date().toISOString() },
              ...prev,
            ]);
          } else {
            setItems((prev) =>
              prev.filter((item) => {
                const itemProductId = item.product?._id || item.product;
                return itemProductId !== productId;
              })
            );
          }
        }
      } else {
        // Update guest wishlist in localStorage
        const guestList = getGuestWishlist();
        if (wasInWishlist) {
          saveGuestWishlist(guestList.filter((id) => id !== productId));
        } else {
          saveGuestWishlist([productId, ...guestList]);
        }
      }

      return !wasInWishlist;
    },
    [isAuthenticated, isInWishlist]
  );

  // Add to wishlist
  const addToWishlist = useCallback(
    async (product) => {
      const productId = product._id || product;
      if (isInWishlist(productId)) return true;
      return toggleWishlist(product);
    },
    [isInWishlist, toggleWishlist]
  );

  // Remove from wishlist
  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!isInWishlist(productId)) return false;
      return toggleWishlist(productId);
    },
    [isInWishlist, toggleWishlist]
  );

  // Clear all wishlist items
  const clearWishlist = useCallback(async () => {
    setItems([]);
    if (isAuthenticated) {
      try {
        await api.delete('/wishlist');
      } catch (error) {
        console.error('Failed to clear wishlist:', error);
      }
    } else {
      clearGuestWishlist();
    }
  }, [isAuthenticated]);

  // Refresh wishlist from server
  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await api.get('/wishlist');
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to refresh wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const value = {
    items,
    count: items.length,
    loading,
    isLoaded,
    isInWishlist,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    refreshWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
