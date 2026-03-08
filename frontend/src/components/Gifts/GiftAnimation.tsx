import { useEffect, useState } from 'react';
import styles from './GiftAnimation.module.css';
import useGiftStore from '@/store/giftStore';
import type { GiftTransaction } from '@/types/gift';

export function GiftAnimation() {
  const receivedGiftAnimation = useGiftStore((s) => s.receivedGiftAnimation);
  const setReceivedGiftAnimation = useGiftStore((s) => s.setReceivedGiftAnimation);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (receivedGiftAnimation) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setReceivedGiftAnimation(null), 500);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [receivedGiftAnimation, setReceivedGiftAnimation]);

  if (!receivedGiftAnimation) return null;

  return (
    <div className={`${styles.overlay} ${visible ? styles.visible : styles.hidden}`}>
      <div className={styles.content}>
        <img
          src={receivedGiftAnimation.giftImage}
          alt={receivedGiftAnimation.giftName}
          className={styles.giftImage}
        />
        <div className={styles.info}>
          <span className={styles.fromText}>
            Подарок от @{receivedGiftAnimation.fromUsername}
          </span>
          <span className={styles.giftName}>{receivedGiftAnimation.giftName}</span>
        </div>
      </div>
    </div>
  );
}

export default GiftAnimation;
