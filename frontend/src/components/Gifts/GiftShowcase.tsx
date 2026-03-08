import { useEffect, useState } from 'react';
import styles from './GiftShowcase.module.css';
import { GiftCard } from './GiftCard';
import useGiftStore from '@/store/giftStore';
import type { UserGift } from '@/types/gift';

interface GiftShowcaseProps {
  userId: string;
}

export function GiftShowcase({ userId }: GiftShowcaseProps) {
  const getUserGifts = useGiftStore((s) => s.getUserGifts);
  const [gifts, setGifts] = useState<UserGift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getUserGifts(userId)
      .then(setGifts)
      .finally(() => setLoading(false));
  }, [userId, getUserGifts]);

  const displayedGifts = gifts.filter((g) => g.isDisplayed);

  if (loading) return null;
  if (displayedGifts.length === 0) return null;

  return (
    <div className={styles.showcase}>
      <h4 className={styles.title}>Подарки</h4>
      <div className={styles.grid}>
        {displayedGifts.map((ug) => (
          <GiftCard key={ug.id} gift={ug.gift} compact />
        ))}
      </div>
    </div>
  );
}

export default GiftShowcase;
