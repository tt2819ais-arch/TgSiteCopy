import styles from './DateSeparator.module.css';
import { formatDate } from '@/utils/formatters';

interface DateSeparatorProps {
  date: string;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className={styles.separator}>
      <span className={styles.label}>{formatDate(date)}</span>
    </div>
  );
}

export default DateSeparator;
