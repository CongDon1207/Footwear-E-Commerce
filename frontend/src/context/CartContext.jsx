import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { updateCartItems } from '../utils/cartUtils';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'footwear_cart';

const loadStoredCart = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!savedCart) return [];

    const parsedCart = JSON.parse(savedCart);
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return [];
  }
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

/**
 * Cart item structure:
 * {
 *   productId: string,
 *   name: string,
 *   image: string,
 *   price: number,
 *   discount: number,
 *   finalPrice: number,
 *   size: string,
 *   quantity: number,
 *   stock: number (max available for this size)
 * }
 */

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => loadStoredCart());

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [items]);

  // Add item to cart
  const addItem = useCallback((product, size, quantity = 1) => {
    if (!product || !size || quantity < 1) return false;

    // Find size variant to get stock
    const sizeVariant = product.sizes?.find((s) => s.size === size);
    if (!sizeVariant || sizeVariant.stock < 1) return false;

    setItems((prevItems) => {
      // Check if item with same product + size already exists
      const existingIndex = prevItems.findIndex(
        (item) => item.productId === product._id && item.size === size
      );

      if (existingIndex >= 0) {
        // Update quantity (respect stock limit)
        const newItems = [...prevItems];
        const newQty = Math.min(
          newItems[existingIndex].quantity + quantity,
          sizeVariant.stock
        );
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newQty,
        };
        return newItems;
      }

      // Add new item
      const newItem = {
        productId: product._id,
        name: product.name,
        image: product.images?.[0] || '',
        price: product.price,
        discount: product.discount || 0,
        finalPrice: product.finalPrice || product.price * (1 - (product.discount || 0) / 100),
        size,
        quantity: Math.min(quantity, sizeVariant.stock),
        stock: sizeVariant.stock,
      };

      return [...prevItems, newItem];
    });

    return true;
  }, []);

  // Remove item from cart
  const removeItem = useCallback((productId, size) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.productId === productId && item.size === size)
      )
    );
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((productId, size, quantity) => {
    setItems((prevItems) => updateCartItems(prevItems, productId, size, quantity));
  }, []);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Get item count
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Get subtotal
  const subtotal = items.reduce(
    (sum, item) => sum + item.finalPrice * item.quantity,
    0
  );

  // Calculate shipping fee (free over 500k VND)
  const shippingFee = subtotal >= 500000 ? 0 : 30000;

  // Get total
  const total = subtotal + shippingFee;

  // Check if product+size is in cart
  const isInCart = useCallback(
    (productId, size) => {
      return items.some(
        (item) => item.productId === productId && item.size === size
      );
    },
    [items]
  );

  // Get quantity of specific item
  const getItemQuantity = useCallback(
    (productId, size) => {
      const item = items.find(
        (item) => item.productId === productId && item.size === size
      );
      return item?.quantity || 0;
    },
    [items]
  );

  const value = {
    items,
    itemCount,
    subtotal,
    shippingFee,
    total,
    isLoaded: true,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
