import { useParams, useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.css';
import { Header, BackButton } from '@/components/Layout/Header';
import { UserProfile } from '@/components/Profile/UserProfile';

export function ProfilePage() {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <Header
        title="Профиль"
        leftAction={<BackButton onClick={() => navigate(-1)} />}
      />
      <div className={styles.content}>
        <UserProfile userId={userId} />
      </div>
    </div>
  );
}

export default ProfilePage;
