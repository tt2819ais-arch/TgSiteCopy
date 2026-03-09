import { useEffect } from 'react';
import styles from './EconomyControl.module.css';
import { Spinner } from '@/components/UI/Spinner/Spinner';
import useAdminStore from '@/store/adminStore';
import { formatBalance, formatNumber } from '@/utils/formatters';

export function EconomyControl() {
  const economyStats = useAdminStore((s) => s.economyStats);
  const loadEconomyStats = useAdminStore((s) => s.loadEconomyStats);

  useEffect(() => {
    loadEconomyStats();
  }, [loadEconomyStats]);

  if (!economyStats) {
    return (
      <div className={styles.loading}><Spinner size={28} /></div>
    );
  }

  const stats = [
    { label: 'Всего пользователей', value: formatNumber(economyStats.totalUsers) },
    { label: 'Общий баланс (NYX)', value: formatBalance(economyStats.totalBalance) },
    { label: 'Всего транзакций', value: formatNumber(economyStats.totalTransactions) },
    { label: 'Подарков отправлено', value: formatNumber(economyStats.totalGiftsSent) },
    { label: 'Активных подарков', value: formatNumber(economyStats.activeGifts) },
  ];

  return (
    <div className={styles.economy}>
      <h3 className={styles.title}>Экономика Nyxgram</h3>

      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EconomyControl;
