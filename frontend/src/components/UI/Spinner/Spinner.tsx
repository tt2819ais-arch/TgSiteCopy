import styles from './Spinner.module.css';
import { classNames } from '@/utils/helpers';

interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export function Spinner({ size = 24, color, className }: SpinnerProps) {
  return (
    <div
      className={classNames(styles.spinner, className)}
      style={{
        width: size,
        height: size,
        ...(color ? { color } : {}),
      }}
    >
      <svg viewBox="0 0 50 50" className={styles.svg}>
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="80 60"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function SpinnerOverlay() {
  return (
    <div className={styles.overlay}>
      <Spinner size={36} />
    </div>
  );
}

export function SpinnerInline({ text }: { text?: string }) {
  return (
    <div className={styles.inline}>
      <Spinner size={18} />
      {text && <span className={styles.inlineText}>{text}</span>}
    </div>
  );
}

export default Spinner;
