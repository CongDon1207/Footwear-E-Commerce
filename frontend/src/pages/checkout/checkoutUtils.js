export const validateCheckoutForm = (formData) => {
  const errors = {};

  if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
  if (!formData.phone.trim()) errors.phone = 'Phone number is required';
  else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
    errors.phone = 'Invalid phone number';
  }
  if (!formData.address.trim()) errors.address = 'Address is required';
  if (!formData.city.trim()) errors.city = 'City is required';
  if (!formData.district.trim()) errors.district = 'District is required';

  return errors;
};

export const buildOrderPayload = (items, formData) => ({
  items: items.map((item) => ({
    productId: item.productId,
    size: item.size,
    quantity: item.quantity,
  })),
  shippingAddress: {
    fullName: formData.fullName,
    phone: formData.phone,
    address: formData.address,
    city: formData.city,
    district: formData.district,
    ward: formData.ward,
    note: formData.note,
  },
  paymentMethod: formData.paymentMethod,
});

export const buildOrderSuccessPath = (orderNumber) => `/order-success/${orderNumber}`;
