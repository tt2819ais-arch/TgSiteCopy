import { useRef, useState } from 'react';
import styles from './AvatarUploader.module.css';
import { getAvatarColor, getInitials, createImageUrl } from '@/utils/helpers';
import { validateAvatar } from '@/utils/validators';
import userService from '@/services/userService';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';

interface AvatarUploaderProps {
  userId: string;
  username: string;
  avatar: string | null;
  editable?: boolean;
  size?: number;
}

export function AvatarUploader({
  userId,
  username,
  avatar,
  editable = false,
  size = 100,
}: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const updateUser = useAuthStore((s) => s.updateUser);
  const addToast = useUIStore((s) => s.addToast);

  const avatarUrl = createImageUrl(avatar);

  const handleClick = () => {
    if (editable && fileRef.current) {
      fileRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateAvatar(file);
    if (!validation.valid) {
      addToast(validation.error!, 'error');
      return;
    }

    setUploading(true);
    try {
      const result = await userService.uploadAvatar(file);
      updateUser({ avatar: result.url });
      addToast('Аватар обновлён', 'success');
    } catch {
      addToast('Не удалось загрузить аватар', 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await userService.removeAvatar();
      updateUser({ avatar: null });
      addToast('Аватар удалён', 'success');
    } catch {
      addToast('Не удалось удалить аватар', 'error');
    }
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.avatar}
        style={{ width: size, height: size }}
        onClick={handleClick}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={username} className={styles.image} />
        ) : (
          <div
            className={styles.placeholder}
            style={{ backgroundColor: getAvatarColor(userId), fontSize: size * 0.32 }}
          >
            {getInitials(username)}
          </div>
        )}

        {editable && (
          <div className={styles.overlay}>
            {uploading ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" className={styles.spinIcon}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            )}
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={styles.fileInput}
          onChange={handleFileChange}
        />
      </div>

      {editable && avatarUrl && (
        <button className={styles.removeBtn} onClick={handleRemove}>
          Удалить фото
        </button>
      )}
    </div>
  );
}

export default AvatarUploader;
