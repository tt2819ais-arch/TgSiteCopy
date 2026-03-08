import { useEffect } from 'react';
import styles from './GiftHistory.module.css';
import useGiftStore from '@/store/giftStore';
import { formatTime, formatDate, formatPrice } from '@/utils/formatters';
import { Spinner } from '@/components/UI/Spinner/Spinner';

export function GiftHistory() {
  const giftHistory = useGiftStore((s) => s.giftHistory);
  const loadGiftHistory = useGiftStore((s) => s.loadGiftHistory);

  useEffect(() => {
    loadGiftHistory();
  }, [loadGiftHistory]);

  if (giftHistory.length === 0) {
    return (
      <div className={styles.empty}>
        <span>История подарков пуста</span>
      </div>
    );
  }

  return (
    <div className={styles.history}>
      <h3 className={styles.title}>История подарков</h3>
      <div className={styles.list}>
        {giftHistory.map((tx) => (
          <div key={tx.id} className={styles.item}>
            <img src={tx.giftImage} alt={tx.giftName} className={styles.giftImage} />
            <div className={styles.info}>
              <span className={styles.giftName}>{tx.giftName}</span>
              <span className={styles.details}>
                @{tx.fromUsername} → @{tx.toUsername}
              </span>
              <span className={styles.date}>
                {formatDate(tx.createdAt)} {formatTime(tx.createdAt)}
              </span>
            </div>
            <span className={styles.price}>{formatPrice(tx.price)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GiftHistory;
