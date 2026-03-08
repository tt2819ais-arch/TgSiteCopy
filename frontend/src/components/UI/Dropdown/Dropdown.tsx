import { useState, useRef, type ReactNode } from 'react';
import styles from './Dropdown.module.css';
import { classNames } from '@/utils/helpers';
import { useClickOutside } from '@/hooks/useClickOutside';

interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, items, align = 'left', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false), isOpen);

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div ref={ref} className={classNames(styles.wrapper, className)}>
      <div className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div className={classNames(styles.menu, styles[align])}>
          {items.map((item) => (
            <button
              key={item.id}
              className={classNames(
                styles.menuItem,
                item.danger && styles.danger,
                item.disabled && styles.disabled
              )}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
            >
              {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
              <span className={styles.itemLabel}>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
