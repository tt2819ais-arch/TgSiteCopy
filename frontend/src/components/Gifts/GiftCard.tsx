import styles from './GiftCard.module.css';
import { classNames } from '@/utils/helpers';
import { formatPrice } from '@/utils/formatters';
import { RARITY_LABELS, RARITY_COLORS } from '@/utils/constants';
import type { Gift } from '@/types/gift';

interface GiftCardProps {
  gift: Gift;
  onClick?: () => void;
  compact?: boolean;
}

export function GiftCard({ gift, onClick, compact = false }: GiftCardProps) {
  return (
    <div
      className={classNames(styles.card, compact && styles.compact)}
      onClick={onClick}
    >
      <div className={styles.imageWrapper}>
        <img src={gift.image} alt={gift.name} className={styles.image} />
        <span
          className={styles.rarityBadge}
          style={{ backgroundColor: RARITY_COLORS[gift.rarity] }}
        >
          {RARITY_LABELS[gift.rarity]}
        </span>
        {gift.isLimited && (
          <span className={styles.limitedBadge}>
            {gift.currentSupply}/{gift.maxSupply}
          </span>
        )}
      </div>

      <div className={styles.info}>
        <span className={styles.name}>{gift.name}</span>
        {!compact && (
          <span className={styles.description}>{gift.description}</span>
        )}
        <span className={styles.price}>{formatPrice(gift.price)}</span>
      </div>
    </div>
  );
}

export default GiftCard;
