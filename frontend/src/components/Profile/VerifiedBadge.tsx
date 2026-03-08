import styles from './VerifiedBadge.module.css';

interface VerifiedBadgeProps {
  size?: number;
  showLabel?: boolean;
}

export function VerifiedBadge({ size = 18, showLabel = false }: VerifiedBadgeProps) {
  return (
    <span className={styles.badge}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="var(--color-verified)"
        className={styles.icon}
      >
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
      </svg>
      {showLabel && (
        <span className={styles.label}>Это официальный аккаунт</span>
      )}
    </span>
  );
}

export default VerifiedBadge;
