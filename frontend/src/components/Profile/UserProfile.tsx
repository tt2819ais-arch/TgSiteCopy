import { useEffect, useState } from 'react';
import styles from './UserProfile.module.css';
import { AvatarUploader } from './AvatarUploader';
import { VerifiedBadge } from './VerifiedBadge';
import { ProfileEditor } from './ProfileEditor';
import { GiftShowcase } from '@/components/Gifts/GiftShowcase';
import { Button } from '@/components/UI/Button/Button';
import { Modal } from '@/components/UI/Modal/Modal';
import useAuthStore from '@/store/authStore';
import useUserStore from '@/store/userStore';
import useChatStore from '@/store/chatStore';
import useUIStore from '@/store/uiStore';
import { formatUsername, formatBalance, formatLastSeen } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';
import type { PublicUser } from '@/types/user';

interface UserProfileProps {
  userId?: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  const currentUser = useAuthStore((s) => s.user);
  const selectedProfile = useUserStore((s) => s.selectedProfile);
  const loadProfile = useUserStore((s) => s.loadProfile);
  const isLoadingProfile = useUserStore((s) => s.isLoadingProfile);
  const createPrivateChat = useChatStore((s) => s.createPrivateChat);
  const addToast = useUIStore((s) => s.addToast);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

  const isOwnProfile = !userId || userId === currentUser?.id;
  const profile: PublicUser | null = isOwnProfile
    ? currentUser
      ? {
          id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar,
          bio: currentUser.bio,
          isVerified: currentUser.isVerified,
          status: currentUser.status,
          lastSeen: currentUser.lastSeen,
        }
      : null
    : selectedProfile;

  useEffect(() => {
    if (userId && !isOwnProfile) {
      loadProfile(userId);
    }
  }, [userId, isOwnProfile, loadProfile]);

  if (isLoadingProfile || !profile) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSkeleton} />
      </div>
    );
  }

  const handleMessage = async () => {
    try {
      const chat = await createPrivateChat(profile.id);
      navigate(`/chat/${chat.id}`);
    } catch {
      addToast('Не удалось создать чат', 'error');
    }
  };

  const isOnline = profile.status === 'online';

  return (
    <div className={styles.profile}>
      <div className={styles.header}>
        <AvatarUploader
          userId={profile.id}
          username={profile.username}
          avatar={profile.avatar}
          editable={isOwnProfile}
          size={110}
        />

        <div className={styles.nameSection}>
          <div className={styles.nameRow}>
            <h2 className={styles.username}>{profile.username}</h2>
            {profile.isVerified && <VerifiedBadge size={20} />}
          </div>
          <span className={styles.handle}>{formatUsername(profile.username)}</span>

          {profile.isVerified && (
            <span className={styles.officialLabel}>Это официальный аккаунт</span>
          )}

          <div className={styles.statusRow}>
            <span className={styles.statusDot} style={{ backgroundColor: isOnline ? 'var(--color-online)' : 'var(--color-text-tertiary)' }} />
            <span className={styles.statusText}>
              {isOnline ? 'в сети' : formatLastSeen(profile.lastSeen)}
            </span>
          </div>
        </div>
      </div>

      {profile.bio && (
        <div className={styles.bio}>
          <h4 className={styles.sectionTitle}>О себе</h4>
          <p className={styles.bioText}>{profile.bio}</p>
        </div>
      )}

      {isOwnProfile && currentUser && (
        <div className={styles.balance}>
          <h4 className={styles.sectionTitle}>Баланс</h4>
          <span className={styles.balanceAmount}>{formatBalance(currentUser.balance)} NYX</span>
        </div>
      )}

      <div className={styles.actions}>
        {isOwnProfile ? (
          <Button variant="secondary" fullWidth onClick={() => setIsEditing(true)}>
            Редактировать профиль
          </Button>
        ) : (
          <>
            <Button variant="primary" fullWidth onClick={handleMessage}>
              Написать сообщение
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setIsGiftModalOpen(true)}>
              Отправить подарок
            </Button>
          </>
        )}
      </div>

      <GiftShowcase userId={profile.id} />

      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Редактировать профиль"
        size="sm"
      >
        <ProfileEditor onClose={() => setIsEditing(false)} />
      </Modal>
    </div>
  );
}

export default UserProfile;
