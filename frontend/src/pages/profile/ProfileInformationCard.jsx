import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Edit3,
  Lock,
  Mail,
  Save,
  Shield,
  User,
  X,
} from 'lucide-react';

export default function ProfileInformationCard({
  getMemberSince,
  isEditing,
  onCancelEdit,
  onProfileChange,
  onProfileSubmit,
  onStartEdit,
  profileData,
  profileError,
  profileLoading,
  profileSuccess,
  user,
}) {
  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between p-5 md:p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Profile Information
        </h2>
        {!isEditing && (
          <button
            onClick={onStartEdit}
            className="btn btn-outline btn-sm flex items-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      <div className="p-5 md:p-6">
        {profileSuccess && (
          <div className="flex items-center gap-3 p-4 mb-5 bg-success-light rounded-xl text-success">
            <CheckCircle size={20} />
            <span className="font-medium">{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="flex items-center gap-3 p-4 mb-5 bg-error-light rounded-xl text-error">
            <AlertCircle size={20} />
            <span className="font-medium">{profileError}</span>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={onProfileSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={profileData.full_name}
                onChange={onProfileChange}
                className="w-full px-4 py-3.5 text-base text-text-primary border-2 rounded-xl focus:outline-none transition-all duration-200 placeholder:text-text-muted border-border-input focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3.5 pr-12 text-base text-text-muted border-2 rounded-xl bg-surface-secondary border-border cursor-not-allowed"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              </div>
              <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Email address cannot be changed
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={profileLoading}
                className="btn btn-primary flex items-center gap-2 cursor-pointer"
              >
                {profileLoading ? <Save className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                disabled={profileLoading}
                className="btn btn-outline flex items-center gap-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-surface-secondary rounded-xl hover:bg-surface-tertiary transition-colors duration-200">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-muted font-medium uppercase tracking-wide">Full Name</p>
                <p className="font-semibold text-text-primary mt-0.5 truncate">{user?.full_name || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-surface-secondary rounded-xl hover:bg-surface-tertiary transition-colors duration-200">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-muted font-medium uppercase tracking-wide">
                  Email Address
                </p>
                <p className="font-semibold text-text-primary mt-0.5 truncate">{user?.email || '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-surface-secondary rounded-xl hover:bg-surface-tertiary transition-colors duration-200">
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-muted font-medium uppercase tracking-wide">Member Since</p>
                  <p className="font-semibold text-text-primary mt-0.5 truncate">{getMemberSince()}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-surface-secondary rounded-xl hover:bg-surface-tertiary transition-colors duration-200">
                <div className="w-12 h-12 rounded-xl bg-success-light flex items-center justify-center">
                  <Shield className="w-6 h-6 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-muted font-medium uppercase tracking-wide">Account Status</p>
                  <p className="font-semibold text-success mt-0.5 capitalize">
                    {user?.status || 'Active'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
