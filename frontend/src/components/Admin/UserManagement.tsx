import { useEffect, useState } from 'react';
import styles from './UserManagement.module.css';
import { Input } from '@/components/UI/Input/Input';
import { Button } from '@/components/UI/Button/Button';
import { Modal } from '@/components/UI/Modal/Modal';
import { Spinner } from '@/components/UI/Spinner/Spinner';
import useAdminStore from '@/store/adminStore';
import useUIStore from '@/store/uiStore';
import { useDebounce } from '@/hooks/useDebounce';
import { formatUsername, formatBalance } from '@/utils/formatters';
import { getAvatarColor, getInitials, createImageUrl, classNames } from '@/utils/helpers';
import type { User } from '@/types/user';

export function UserManagement() {
  const users = useAdminStore((s) => s.users);
  const isLoading = useAdminStore((s) => s.isLoading);
  const loadUsers = useAdminStore((s) => s.loadUsers);
  const searchUsers = useAdminStore((s) => s.searchUsers);
  const banUser = useAdminStore((s) => s.banUser);
  const unbanUser = useAdminStore((s) => s.unbanUser);
  const verifyUser = useAdminStore((s) => s.verifyUser);
  const unverifyUser = useAdminStore((s) => s.unverifyUser);
  const setUserBalance = useAdminStore((s) => s.setUserBalance);
  const addToast = useUIStore((s) => s.addToast);

  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [newBalance, setNewBalance] = useState('');

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    loadUsers(1);
  }, [loadUsers]);

  useEffect(() => {
    searchUsers(debouncedSearch);
  }, [debouncedSearch, searchUsers]);

  const handleBan = async () => {
    if (!selectedUser || !banReason.trim()) return;
    try {
      await banUser(selectedUser.id, banReason);
      addToast(`Пользователь ${selectedUser.username} заблокирован`, 'success');
      setBanModalOpen(false);
      setBanReason('');
    } catch {
      addToast('Ошибка блокировки', 'error');
    }
  };

  const handleUnban = async (userId: string, username: string) => {
    try {
      await unbanUser(userId);
      addToast(`Пользователь ${username} разблокирован`, 'success');
    } catch {
      addToast('Ошибка разблокировки', 'error');
    }
  };

  const handleVerify = async (userId: string, isVerified: boolean, username: string) => {
    try {
      if (isVerified) {
        await unverifyUser(userId);
        addToast(`Верификация ${username} снята`, 'success');
      } else {
        await verifyUser(userId);
        addToast(`${username} верифицирован`, 'success');
      }
    } catch {
      addToast('Ошибка', 'error');
    }
  };

  const handleSetBalance = async () => {
    if (!selectedUser) return;
    const amount = parseInt(newBalance, 10);
    if (isNaN(amount) || amount < 0) {
      addToast('Некорректная сумма', 'error');
      return;
    }
    try {
      await setUserBalance(selectedUser.id, amount);
      addToast(`Баланс ${selectedUser.username} обновлён`, 'success');
      setBalanceModalOpen(false);
      setNewBalance('');
    } catch {
      addToast('Ошибка обновления баланса', 'error');
    }
  };

  return (
    <div className={styles.management}>
      <div className={styles.searchRow}>
        <Input
          placeholder="Поиск пользователей..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="filled"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          }
        />
      </div>

      {isLoading && users.length === 0 ? (
        <div className={styles.loading}><Spinner size={28} /></div>
      ) : (
        <div className={styles.userList}>
          {users.map((user) => {
            const avatarUrl = createImageUrl(user.avatar);
            return (
              <div key={user.id} className={styles.userItem}>
                <div className={styles.userAvatar}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className={styles.avatarImg} />
                  ) : (
                    <div className={styles.avatarPlaceholder} style={{ backgroundColor: getAvatarColor(user.id) }}>
                      {getInitials(user.username)}
                    </div>
                  )}
                </div>

                <div className={styles.userInfo}>
                  <div className={styles.userNameRow}>
                    <span className={styles.userName}>{user.username}</span>
                    {user.isVerified && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-verified)">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    )}
                    <span className={styles.userRole}>{user.role}</span>
                  </div>
                  <span className={styles.userHandle}>{formatUsername(user.username)}</span>
                  <span className={styles.userBalance}>{formatBalance(user.balance)} NYX</span>
                </div>

                <div className={styles.userActions}>
                  <Button
                    size="sm"
                    variant={user.isVerified ? 'ghost' : 'accent'}
                    onClick={() => handleVerify(user.id, user.isVerified, user.username)}
                  >
                    {user.isVerified ? 'Снять' : 'Верифицировать'}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedUser(user);
                      setNewBalance(String(user.balance));
                      setBalanceModalOpen(true);
                    }}
                  >
                    Баланс
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setSelectedUser(user);
                      setBanModalOpen(true);
                    }}
                  >
                    Бан
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ban Modal */}
      <Modal
        isOpen={banModalOpen}
        onClose={() => setBanModalOpen(false)}
        title={`Заблокировать ${selectedUser?.username || ''}`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setBanModalOpen(false)}>Отмена</Button>
            <Button variant="danger" onClick={handleBan}>Заблокировать</Button>
          </>
        }
      >
        <Input
          label="Причина блокировки"
          placeholder="Укажите причину..."
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
        />
      </Modal>

      {/* Balance Modal */}
      <Modal
        isOpen={balanceModalOpen}
        onClose={() => setBalanceModalOpen(false)}
        title={`Баланс ${selectedUser?.username || ''}`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setBalanceModalOpen(false)}>Отмена</Button>
            <Button variant="primary" onClick={handleSetBalance}>Сохранить</Button>
          </>
        }
      >
        <Input
          label="Новый баланс (NYX)"
          type="number"
          placeholder="0"
          value={newBalance}
          onChange={(e) => setNewBalance(e.target.value)}
        />
      </Modal>
    </div>
  );
}

export default UserManagement;
