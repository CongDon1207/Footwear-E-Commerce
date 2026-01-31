import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-surface shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="font-heading text-2xl text-text-primary">Footwear Store</h1>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-surface rounded-xl shadow-md p-8">
          {/* User Info */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-2xl text-text-primary">{user?.full_name}</h2>
              <p className="text-text-secondary">{user?.email}</p>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="border-t border-border pt-8">
            <h3 className="font-heading text-xl text-text-primary mb-4">Welcome to your dashboard!</h3>
            <p className="text-text-secondary mb-4">
              You are successfully logged in. This is a protected page that can only be accessed by authenticated users.
            </p>
            
            <div className="bg-primary-light/30 border-l-4 border-primary p-4 rounded">
              <p className="text-text-primary">
                <strong>Account Status:</strong> Active
              </p>
              <p className="text-text-secondary text-sm mt-1">
                Role: {user?.role}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
