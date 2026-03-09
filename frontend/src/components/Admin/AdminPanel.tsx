import { useState } from 'react';
import styles from './AdminPanel.module.css';
import { UserManagement } from './UserManagement';
import { GiftManagement } from './GiftManagement';
import { EconomyControl } from './EconomyControl';
import { classNames } from '@/utils/helpers';

type AdminTab = 'users' | 'gifts' | 'economy';

const TABS: { id: AdminTab; label: string }[] = [
  { id: 'users', label: 'Пользователи' },
  { id: 'gifts', label: 'Подарки' },
  { id: 'economy', label: 'Экономика' },
];

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  return (
    <div className={styles.panel}>
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={classNames(
              styles.tab,
              activeTab === tab.id && styles.activeTab
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'gifts' && <GiftManagement />}
        {activeTab === 'economy' && <EconomyControl />}
      </div>
    </div>
  );
}

export default AdminPanel;
