import { useNavigate } from 'react-router-dom';
import styles from './AdminPage.module.css';
import { Header, BackButton } from '@/components/Layout/Header';
import { AdminPanel } from '@/components/Admin/AdminPanel';

export function AdminPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <Header
        title="Админ-панель"
        leftAction={<BackButton onClick={() => navigate('/')} />}
      />
      <AdminPanel />
    </div>
  );
}

export default AdminPage;
