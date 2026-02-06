import {
  AlertCircle,
  Camera,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
  User,
} from 'lucide-react';

export default function ProfileAvatarSection({
  avatarError,
  avatarLoading,
  avatarUrl,
  fileInputRef,
  onAvatarSelect,
  onDeleteAvatar,
  onOpenFilePicker,
  user,
}) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-surface rounded-2xl border border-border p-6 md:p-8">
        <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          Profile Photo
        </h2>

        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-36 h-36 md:w-40 md:h-40 rounded-full overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 ring-4 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40">
              {avatarLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-surface-secondary">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
              ) : avatarUrl ? (
                <img src={avatarUrl} alt={user?.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark">
                  <User className="w-16 h-16 md:w-20 md:h-20 text-white/90" />
                </div>
              )}
            </div>

            <button
              onClick={onOpenFilePicker}
              disabled={avatarLoading}
              className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            >
              <Camera className="w-8 h-8 text-white mb-1" />
              <span className="text-white text-sm font-medium">Change</span>
            </button>

            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg border-4 border-surface">
              <ImagePlus className="w-5 h-5 text-white" />
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={onAvatarSelect}
            className="hidden"
          />

          <h3 className="font-heading font-semibold text-lg text-text-primary mt-4">
            {user?.full_name || 'User'}
          </h3>
          <p className="text-text-muted text-sm">{user?.email}</p>

          <div className="flex gap-2 mt-5 w-full">
            <button
              onClick={onOpenFilePicker}
              disabled={avatarLoading}
              className="flex-1 btn btn-primary btn-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
            {user?.avatar_url && (
              <button
                onClick={onDeleteAvatar}
                disabled={avatarLoading}
                className="btn btn-outline btn-sm text-error border-error hover:bg-error hover:text-white hover:border-error flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {avatarError && (
            <div className="flex items-center gap-2 text-error text-sm mt-4 p-3 bg-error-light rounded-lg w-full">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{avatarError}</span>
            </div>
          )}

          <div className="mt-5 p-4 bg-surface-secondary rounded-xl w-full">
            <p className="text-text-muted text-xs text-center">
              <span className="font-medium text-text-secondary">Supported formats:</span>
              <br />
              JPEG, PNG, GIF, WebP (max 5MB)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
