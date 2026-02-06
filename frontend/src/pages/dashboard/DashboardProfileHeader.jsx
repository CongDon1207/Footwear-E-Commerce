import { Link } from 'react-router-dom';
import {
  Calendar,
  Edit3,
  LogOut,
  Mail,
  Shield,
  User,
} from 'lucide-react';

export default function DashboardProfileHeader({
  avatarUrl,
  getMemberSince,
  onLogout,
  user,
}) {
  return (
    <>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-semibold text-text-primary">
          My Account
        </h1>
        <p className="text-text-secondary mt-1 text-sm md:text-base">
          Welcome back, {user?.full_name?.split(' ')[0] || 'there'}! Here's your account overview.
        </p>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-dark rounded-2xl p-5 md:p-8 text-white mb-6 md:mb-8 shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white transform -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 md:gap-6">
            <Link
              to="/profile"
              className="group relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 cursor-pointer"
            >
              <div className="w-full h-full rounded-full ring-4 ring-white/30 overflow-hidden bg-white/20 backdrop-blur-sm transition-all duration-300 group-hover:ring-white/50">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user?.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-10 h-10 md:w-12 md:h-12 text-white/80" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Edit3 className="w-4 h-4 text-primary" />
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <h2 className="font-heading text-xl md:text-2xl font-semibold truncate">
                {user?.full_name || 'Welcome!'}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-white/80">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm md:text-base truncate">{user?.email}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5 text-white/70 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {getMemberSince()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/70 text-sm">
                  <Shield className="w-4 h-4" />
                  <span className="capitalize">{user?.role || 'User'}</span>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex flex-col gap-2">
              <Link
                to="/profile"
                className="px-5 py-2.5 bg-white text-primary rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-white/90 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </Link>
              <button
                onClick={onLogout}
                className="px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          <div className="flex sm:hidden gap-3 mt-5">
            <Link
              to="/profile"
              className="flex-1 px-4 py-2.5 bg-white text-primary rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-white/90 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </Link>
            <button
              onClick={onLogout}
              className="flex-1 px-4 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
