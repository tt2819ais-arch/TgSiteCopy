import { useEffect } from 'react';
import styles from './GiftStore.module.css';
import { GiftCard } from './GiftCard';
import { Spinner } from '@/components/UI/Spinner/Spinner';
import useGiftStore from '@/store/giftStore';
import { CATEGORY_LABELS } from '@/utils/constants';
import { classNames } from '@/utils/helpers';
import type { GiftCategory } from '@/types/gift';

interface GiftStoreProps {
  onSelectGift: (giftId: string) => void;
}

const CATEGORIES: (GiftCategory | 'all')[] = ['all', 'card', 'collectible', 'decoration', 'special'];

export function GiftStoreComponent({ onSelectGift }: GiftStoreProps) {
  const gifts = useGiftStore((s) => s.gifts);
  const isLoadingGifts = useGiftStore((s) => s.isLoadingGifts);
  const activeCategory = useGiftStore((s) => s.activeCategory);
  const loadGifts = useGiftStore((s) => s.loadGifts);
  const setActiveCategory = useGiftStore((s) => s.setActiveCategory);

  useEffect(() => {
    loadGifts();
  }, [loadGifts]);

  return (
    <div className={styles.store}>
      <div className={styles.categories}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={classNames(
              styles.categoryBtn,
              activeCategory === cat && styles.activeCategory
            )}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === 'all' ? 'Все' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {isLoadingGifts ? (
        <div className={styles.loading}>
          <Spinner size={28} />
        </div>
      ) : gifts.length === 0 ? (
        <div className={styles.empty}>
          <span>Подарки не найдены</span>
        </div>
      ) : (
        <div className={styles.grid}>
          {gifts.map((gift) => (
            <GiftCard
              key={gift.id}
              gift={gift}
              onClick={() => onSelectGift(gift.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default GiftStoreComponent;
