import { useState } from 'react';
import styles from './ProfileEditor.module.css';
import { Input } from '@/components/UI/Input/Input';
import { Button } from '@/components/UI/Button/Button';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import userService from '@/services/userService';
import { validateBio } from '@/utils/validators';
import { BIO_MAX_LENGTH } from '@/utils/constants';

interface ProfileEditorProps {
  onClose: () => void;
}

export function ProfileEditor({ onClose }: ProfileEditorProps) {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const addToast = useUIStore((s) => s.addToast);

  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const validation = validateBio(bio);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setSaving(true);
    try {
      const updated = await userService.updateProfile({ bio: bio.trim() });
      updateUser({ bio: updated.bio });
      addToast('Профиль обновлён', 'success');
      onClose();
    } catch {
      addToast('Не удалось сохранить', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.editor}>
      <h3 className={styles.title}>Редактировать профиль</h3>

      <div className={styles.field}>
        <label className={styles.label}>О себе</label>
        <textarea
          className={styles.textarea}
          placeholder="Расскажите о себе..."
          value={bio}
          onChange={(e) => {
            setBio(e.target.value);
            setError(null);
          }}
          maxLength={BIO_MAX_LENGTH}
          rows={4}
        />
        <div className={styles.counter}>
          {bio.length}/{BIO_MAX_LENGTH}
        </div>
        {error && <span className={styles.error}>{error}</span>}
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose}>
          Отмена
        </Button>
        <Button variant="primary" loading={saving} onClick={handleSave}>
          Сохранить
        </Button>
      </div>
    </div>
  );
}

export default ProfileEditor;
