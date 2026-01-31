import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
          <ShoppingBag className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="font-heading text-h1 text-text-primary mb-4">
          Welcome to Footwear Store
        </h1>
        
        <p className="text-text-secondary text-lg mb-8">
          Discover the perfect shoes for every occasion. Sign in to explore our collection.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            to="/login"
            className="bg-cta text-white px-6 py-3.5 rounded-lg font-medium text-base
              hover:bg-cta-hover focus:ring-4 focus:ring-cta/20 transition-colors duration-200 min-h-[48px]"
          >
            Sign In
          </Link>
          
          <Link
            to="/register"
            className="bg-white text-primary border-2 border-primary px-6 py-3.5 rounded-lg font-medium text-base
              hover:bg-primary-light focus:ring-4 focus:ring-primary/10 transition-colors duration-200 min-h-[48px]"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
