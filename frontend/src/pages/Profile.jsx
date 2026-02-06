import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Layout } from '../components/layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProfileAvatarSection from './profile/ProfileAvatarSection';
import ProfileInformationCard from './profile/ProfileInformationCard';
import ProfilePasswordCard from './profile/ProfilePasswordCard';
import { getAvatarUrl, getMemberSinceText } from './profile/profileHelpers';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({ full_name: user?.full_name || '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);

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

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setProfileError('');
    setProfileSuccess('');
  };

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

  const handleCancelEdit = () => {
    setProfileData({ full_name: user?.full_name || '' });
    setProfileError('');
    setProfileSuccess('');
    setIsEditing(false);
  };

  const uploadAvatar = async (file) => {
    setAvatarLoading(true);
    setAvatarError('');

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError('Invalid file type. Please select a JPEG, PNG, GIF, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('File too large. Maximum size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
    uploadAvatar(file);
  };

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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword) return setPasswordError('Current password is required');
    if (!passwordData.newPassword) return setPasswordError('New password is required');
    if (passwordData.newPassword.length < 6) {
      return setPasswordError('New password must be at least 6 characters');
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPasswordError('Passwords do not match');
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

  const handleCancelPassword = () => {
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setPasswordSuccess('');
    setShowPasswordForm(false);
  };

  return (
    <Layout>
      <div className="container-wide py-6 md:py-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors duration-200 mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-heading font-semibold text-text-primary">
            Profile Settings
          </h1>
          <p className="text-text-secondary mt-1 text-sm md:text-base">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <ProfileAvatarSection
            avatarError={avatarError}
            avatarLoading={avatarLoading}
            avatarUrl={getAvatarUrl(avatarPreview, user?.avatar_url)}
            fileInputRef={fileInputRef}
            onAvatarSelect={handleAvatarSelect}
            onDeleteAvatar={handleDeleteAvatar}
            onOpenFilePicker={() => fileInputRef.current?.click()}
            user={user}
          />

          <div className="lg:col-span-2 space-y-6">
            <ProfileInformationCard
              getMemberSince={() => getMemberSinceText(user?.createdAt)}
              isEditing={isEditing}
              onCancelEdit={handleCancelEdit}
              onProfileChange={handleProfileChange}
              onProfileSubmit={handleProfileSubmit}
              onStartEdit={() => setIsEditing(true)}
              profileData={profileData}
              profileError={profileError}
              profileLoading={profileLoading}
              profileSuccess={profileSuccess}
              user={user}
            />

            <ProfilePasswordCard
              onCancelPassword={handleCancelPassword}
              onPasswordChange={handlePasswordChange}
              onPasswordSubmit={handlePasswordSubmit}
              passwordData={passwordData}
              passwordError={passwordError}
              passwordLoading={passwordLoading}
              passwordSuccess={passwordSuccess}
              setShowConfirmPassword={setShowConfirmPassword}
              setShowCurrentPassword={setShowCurrentPassword}
              setShowNewPassword={setShowNewPassword}
              setShowPasswordForm={setShowPasswordForm}
              showConfirmPassword={showConfirmPassword}
              showCurrentPassword={showCurrentPassword}
              showNewPassword={showNewPassword}
              showPasswordForm={showPasswordForm}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
