export const updateCartItems = (items, productId, size, quantity) => {
  if (quantity < 1) {
    return items.filter(
      (item) => !(item.productId === productId && item.size === size)
    );
  }

  return items.map((item) => {
    if (item.productId === productId && item.size === size) {
      return {
        ...item,
        quantity: Math.min(quantity, item.stock),
      };
    }

    return item;
  });
};
