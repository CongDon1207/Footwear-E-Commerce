import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  User,
  Camera,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Calendar,
  Mail,
  Lock,
  Trash2,
  Upload,
  Shield,
  ImagePlus,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Avatar state
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Format date
  const getMemberSince = () => {
    if (!user?.createdAt) return 'New Member';
    return new Date(user.createdAt).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get avatar URL
  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (user?.avatar_url) {
      if (user.avatar_url.startsWith('http')) return user.avatar_url;
      return `${API_BASE}${user.avatar_url}`;
    }
    return null;
  };

  // Handle profile form change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setProfileError('');
    setProfileSuccess('');
  };

  // Handle profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileData.full_name.trim()) {
      setProfileError('Full name is required');
      return;
    }

    if (profileData.full_name.trim().length < 2) {
      setProfileError('Full name must be at least 2 characters');
      return;
    }

    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const { data } = await api.put('/users/profile', {
        full_name: profileData.full_name.trim(),
      });
      
      updateUser(data.user);
      setProfileSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setProfileData({ full_name: user?.full_name || '' });
    setProfileError('');
    setProfileSuccess('');
    setIsEditing(false);
  };

  // Handle avatar file select
  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError('Invalid file type. Please select a JPEG, PNG, GIF, or WebP image.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('File too large. Maximum size is 5MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload avatar
    uploadAvatar(file);
  };

  // Upload avatar
  const uploadAvatar = async (file) => {
    setAvatarLoading(true);
    setAvatarError('');

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      updateUser(data.user);
      setAvatarPreview(null);
    } catch (err) {
      setAvatarError(err.response?.data?.message || 'Failed to upload avatar');
      setAvatarPreview(null);
    } finally {
      setAvatarLoading(false);
    }
  };

  // Delete avatar
  const handleDeleteAvatar = async () => {
    if (!user?.avatar_url) return;
    
    if (!window.confirm('Are you sure you want to remove your avatar?')) return;

    setAvatarLoading(true);
    setAvatarError('');

    try {
      const { data } = await api.delete('/users/avatar');
      updateUser(data.user);
    } catch (err) {
      setAvatarError(err.response?.data?.message || 'Failed to delete avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  // Handle password form change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  // Handle password update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError('New password is required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Auto hide form after success
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Cancel password form
  const handleCancelPassword = () => {
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setPasswordSuccess('');
    setShowPasswordForm(false);
  };

  const avatarUrl = getAvatarUrl();

  return (
    <Layout>
      <div className="container-wide py-6 md:py-10">
        {/* Back Link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors duration-200 mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-heading font-semibold text-text-primary">
            Profile Settings
          </h1>
          <p className="text-text-secondary mt-1 text-sm md:text-base">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Avatar */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Profile Photo
              </h2>
              
              {/* Avatar Display */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  {/* Avatar Container */}
                  <div className="w-36 h-36 md:w-40 md:h-40 rounded-full overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 ring-4 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40">
                    {avatarLoading ? (
                      <div className="w-full h-full flex items-center justify-center bg-surface-secondary">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                      </div>
                    ) : avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={user?.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark">
                        <User className="w-16 h-16 md:w-20 md:h-20 text-white/90" />
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Button Overlay */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarLoading}
                    className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Camera className="w-8 h-8 text-white mb-1" />
                    <span className="text-white text-sm font-medium">Change</span>
                  </button>

                  {/* Edit Badge */}
                  <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg border-4 border-surface">
                    <ImagePlus className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />

                {/* User Name */}
                <h3 className="font-heading font-semibold text-lg text-text-primary mt-4">
                  {user?.full_name || 'User'}
                </h3>
                <p className="text-text-muted text-sm">{user?.email}</p>

                {/* Avatar Actions */}
                <div className="flex gap-2 mt-5 w-full">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarLoading}
                    className="flex-1 btn btn-primary btn-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                  {user?.avatar_url && (
                    <button
                      onClick={handleDeleteAvatar}
                      disabled={avatarLoading}
                      className="btn btn-outline btn-sm text-error border-error hover:bg-error hover:text-white hover:border-error flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Avatar Error */}
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

          {/* Right Column - Profile Info & Password */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
              <div className="flex items-center justify-between p-5 md:p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Profile Information
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-outline btn-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>

              <div className="p-5 md:p-6">
                {/* Success Message */}
                {profileSuccess && (
                  <div className="flex items-center gap-3 p-4 mb-5 bg-success-light rounded-xl text-success">
                    <CheckCircle size={20} />
                    <span className="font-medium">{profileSuccess}</span>
                  </div>
                )}

                {/* Error Message */}
                {profileError && (
                  <div className="flex items-center gap-3 p-4 mb-5 bg-error-light rounded-xl text-error">
                    <AlertCircle size={20} />
                    <span className="font-medium">{profileError}</span>
                  </div>
                )}

                {isEditing ? (
                  /* Edit Form */
                  <form onSubmit={handleProfileSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={profileData.full_name}
                        onChange={handleProfileChange}
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

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={profileLoading}
                        className="btn btn-primary flex items-center gap-2 cursor-pointer"
                      >
                        {profileLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={profileLoading}
                        className="btn btn-outline flex items-center gap-2 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Display Info */
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
                        <p className="text-xs text-text-muted font-medium uppercase tracking-wide">Email Address</p>
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
                          <p className="font-semibold text-success mt-0.5 capitalize">{user?.status || 'Active'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Change Password */}
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
                {/* Success Message */}
                {passwordSuccess && (
                  <div className="flex items-center gap-3 p-4 mb-5 bg-success-light rounded-xl text-success">
                    <CheckCircle size={20} />
                    <span className="font-medium">{passwordSuccess}</span>
                  </div>
                )}

                {/* Error Message */}
                {passwordError && (
                  <div className="flex items-center gap-3 p-4 mb-5 bg-error-light rounded-xl text-error">
                    <AlertCircle size={20} />
                    <span className="font-medium">{passwordError}</span>
                  </div>
                )}

                {showPasswordForm ? (
                  <form onSubmit={handlePasswordSubmit} className="space-y-5">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
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

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
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

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
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

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="btn btn-primary flex items-center gap-2 cursor-pointer"
                      >
                        {passwordLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Update Password
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelPassword}
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
                        Your account is secured with a password. We recommend using a strong, unique password.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
