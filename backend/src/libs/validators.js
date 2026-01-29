/**
 * Utility functions for data validation
 */

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

const isValidPrice = (price) => {
  return !isNaN(price) && price > 0;
};

const isValidDiscount = (discount) => {
  return !isNaN(discount) && discount >= 0 && discount <= 100;
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidPrice,
  isValidDiscount,
};
