import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Eye, EyeOff, ShoppingBag } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Login failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cta/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-sky-200/50 border border-white/50 p-8 space-y-6 relative z-10">
        {/* Logo & Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-sky-600 rounded-2xl shadow-lg shadow-primary/30 mb-2">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="font-heading text-2xl md:text-3xl text-text-primary font-bold">Welcome Back</h1>
            <p className="text-text-secondary text-sm">Sign in to your account to continue shopping</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3.5 text-base text-text-primary border-2 rounded-lg 
                focus:outline-none transition-all duration-200 placeholder:text-text-muted min-h-[48px]
                ${
                  errors.email
                    ? 'border-error focus:border-error focus:ring-4 focus:ring-error/10'
                    : 'border-border-input focus:border-primary focus:ring-4 focus:ring-primary/10'
                }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <div className="flex items-center gap-2 text-error text-sm mt-2">
                <AlertCircle size={16} />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3.5 pr-12 text-base text-text-primary border-2 rounded-lg 
                  focus:outline-none transition-all duration-200 placeholder:text-text-muted min-h-[48px]
                  ${
                    errors.password
                      ? 'border-error focus:border-error focus:ring-4 focus:ring-error/10'
                      : 'border-border-input focus:border-primary focus:ring-4 focus:ring-primary/10'
                  }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <div className="flex items-center gap-2 text-error text-sm mt-2">
                <AlertCircle size={16} />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="flex items-center gap-2 text-error text-sm p-3 bg-error/5 rounded-lg">
              <AlertCircle size={16} />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cta to-orange-500 text-white px-6 py-3.5 rounded-xl font-semibold text-base
              hover:from-cta-hover hover:to-orange-600 focus:ring-4 focus:ring-cta/30 transition-all duration-300
              min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cta/25 hover:shadow-xl hover:shadow-cta/30 hover:-translate-y-0.5"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-input/50"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/80 text-text-muted">New to Footwear?</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <Link 
            to="/register" 
            className="inline-flex items-center justify-center w-full px-6 py-3 border-2 border-primary text-primary rounded-xl font-semibold
              hover:bg-primary hover:text-white transition-all duration-300 min-h-[48px]"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
