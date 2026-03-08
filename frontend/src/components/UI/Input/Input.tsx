import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import styles from './Input.module.css';
import { classNames } from '@/utils/helpers';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  hint?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
  onIconRightClick?: () => void;
  fullWidth?: boolean;
  variant?: 'default' | 'filled';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      iconRight,
      onIconRightClick,
      fullWidth = true,
      variant = 'default',
      className,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div
        className={classNames(
          styles.wrapper,
          fullWidth && styles.fullWidth,
          className
        )}
      >
        {label && (
          <label className={styles.label}>
            {label}
          </label>
        )}

        <div
          className={classNames(
            styles.inputContainer,
            styles[variant],
            isFocused && styles.focused,
            error && styles.hasError,
            props.disabled && styles.disabled
          )}
        >
          {icon && <span className={styles.icon}>{icon}</span>}

          <input
            ref={ref}
            className={styles.input}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {iconRight && (
            <span
              className={classNames(
                styles.iconRight,
                onIconRightClick && styles.iconClickable
              )}
              onClick={onIconRightClick}
            >
              {iconRight}
            </span>
          )}
        </div>

        {error && <span className={styles.error}>{error}</span>}
        {!error && hint && <span className={styles.hint}>{hint}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
