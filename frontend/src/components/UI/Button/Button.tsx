import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './Button.module.css';
import { classNames } from '@/utils/helpers';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      icon,
      iconRight,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={classNames(
          styles.button,
          styles[variant],
          styles[size],
          fullWidth && styles.fullWidth,
          loading && styles.loading,
          !children && icon && styles.iconOnly,
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className={styles.spinner}>
            <svg viewBox="0 0 24 24" className={styles.spinnerIcon}>
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray="31.4 31.4"
                strokeLinecap="round"
              />
            </svg>
          </span>
        )}
        {!loading && icon && <span className={styles.icon}>{icon}</span>}
        {children && <span className={styles.label}>{children}</span>}
        {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
