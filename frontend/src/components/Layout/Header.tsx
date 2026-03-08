import styles from './Header.module.css';
import { classNames } from '@/utils/helpers';
import { type ReactNode } from 'react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftAction?: ReactNode;
  rightActions?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function Header({
  title,
  subtitle,
  leftAction,
  rightActions,
  className,
  children,
}: HeaderProps) {
  return (
    <header className={classNames(styles.header, className)}>
      {leftAction && (
        <div className={styles.leftAction}>{leftAction}</div>
      )}

      {children ? (
        <div className={styles.content}>{children}</div>
      ) : (
        <div className={styles.titleSection}>
          {title && <h1 className={styles.title}>{title}</h1>}
          {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        </div>
      )}

      {rightActions && (
        <div className={styles.rightActions}>{rightActions}</div>
      )}
    </header>
  );
}

interface HeaderButtonProps {
  onClick: () => void;
  children: ReactNode;
  className?: string;
  title?: string;
}

export function HeaderButton({ onClick, children, className, title }: HeaderButtonProps) {
  return (
    <button
      className={classNames(styles.headerButton, className)}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <HeaderButton onClick={onClick} title="Назад">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </HeaderButton>
  );
}

export default Header;
