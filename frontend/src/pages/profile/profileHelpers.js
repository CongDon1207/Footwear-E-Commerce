const API_BASE =
  import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const getMemberSinceText = (createdAt) => {
  if (!createdAt) return 'New Member';

  return new Date(createdAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getAvatarUrl = (avatarPreview, avatarPath) => {
  if (avatarPreview) return avatarPreview;
  if (!avatarPath) return null;
  if (avatarPath.startsWith('http')) return avatarPath;
  return `${API_BASE}${avatarPath}`;
};
