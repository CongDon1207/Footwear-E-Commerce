import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Save,
  Shield,
  X,
} from 'lucide-react';

export default function ProfilePasswordCard({
  onCancelPassword,
  onPasswordChange,
  onPasswordSubmit,
  passwordData,
  passwordError,
  passwordLoading,
  passwordSuccess,
  setShowConfirmPassword,
  setShowCurrentPassword,
  setShowNewPassword,
  setShowPasswordForm,
  showConfirmPassword,
  showCurrentPassword,
  showNewPassword,
  showPasswordForm,
}) {
  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between p-5 md:p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          Password & Security
        </h2>
        {!showPasswordForm && (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="btn btn-outline btn-sm cursor-pointer"
          >
            Change Password
          </button>
        )}
      </div>

      <div className="p-5 md:p-6">
        {passwordSuccess && (
          <div className="flex items-center gap-3 p-4 mb-5 bg-success-light rounded-xl text-success">
            <CheckCircle size={20} />
            <span className="font-medium">{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="flex items-center gap-3 p-4 mb-5 bg-error-light rounded-xl text-error">
            <AlertCircle size={20} />
            <span className="font-medium">{passwordError}</span>
          </div>
        )}

        {showPasswordForm ? (
          <form onSubmit={onPasswordSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={onPasswordChange}
                  className="w-full px-4 py-3.5 pr-12 text-base text-text-primary border-2 rounded-xl focus:outline-none transition-all duration-200 placeholder:text-text-muted border-border-input focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors duration-200 cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={onPasswordChange}
                  className="w-full px-4 py-3.5 pr-12 text-base text-text-primary border-2 rounded-xl focus:outline-none transition-all duration-200 placeholder:text-text-muted border-border-input focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors duration-200 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-text-muted mt-2">
                Password must be at least 6 characters long
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={onPasswordChange}
                  className="w-full px-4 py-3.5 pr-12 text-base text-text-primary border-2 rounded-xl focus:outline-none transition-all duration-200 placeholder:text-text-muted border-border-input focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors duration-200 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="btn btn-primary flex items-center gap-2 cursor-pointer"
              >
                <Save className={`w-4 h-4 ${passwordLoading ? 'animate-pulse' : ''}`} />
                Update Password
              </button>
              <button
                type="button"
                onClick={onCancelPassword}
                disabled={passwordLoading}
                className="btn btn-outline flex items-center gap-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-start gap-4 p-4 bg-surface-secondary rounded-xl">
            <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">Password Protected</p>
              <p className="text-sm text-text-secondary mt-1">
                Your account is secured with a password. We recommend using a strong, unique
                password.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
