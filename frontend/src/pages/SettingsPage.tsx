import { useNavigate } from 'react-router-dom';
import styles from './SettingsPage.module.css';
import { Header, BackButton } from '@/components/Layout/Header';
import { Button } from '@/components/UI/Button/Button';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';

export function SettingsPage() {
  const navigate = useNavigate();
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className={styles.page}>
      <Header
        title="Настройки"
        leftAction={<BackButton onClick={() => navigate(-1)} />}
      />

      <div className={styles.content}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Внешний вид</h3>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Тема</span>
              <span className={styles.settingDescription}>
                {theme === 'dark' ? 'Тёмная тема' : 'Светлая тема'}
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={toggleTheme}>
              {theme === 'dark' ? 'Светлая' : 'Тёмная'}
            </Button>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Приложение</h3>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Версия</span>
              <span className={styles.settingDescription}>Nyxgram 1.0.0</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Аккаунт</h3>

          <Button variant="danger" fullWidth onClick={handleLogout}>
            Выйти из аккаунта
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
