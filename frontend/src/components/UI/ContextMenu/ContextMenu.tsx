import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import useUIStore from '@/store/uiStore';
import styles from './ContextMenu.module.css';
import { classNames } from '@/utils/helpers';

export function ContextMenu() {
  const { visible, x, y, items } = useUIStore((s) => s.contextMenu);
  const hideContextMenu = useUIStore((s) => s.hideContextMenu);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;

    const handleClick = () => hideContextMenu();
    const handleScroll = () => hideContextMenu();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideContextMenu();
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, hideContextMenu]);

  useEffect(() => {
    if (!visible || !menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + rect.width > viewportWidth) {
      adjustedX = viewportWidth - rect.width - 8;
    }
    if (y + rect.height > viewportHeight) {
      adjustedY = viewportHeight - rect.height - 8;
    }

    if (adjustedX < 8) adjustedX = 8;
    if (adjustedY < 8) adjustedY = 8;

    menu.style.left = `${adjustedX}px`;
    menu.style.top = `${adjustedY}px`;
  }, [visible, x, y]);

  if (!visible || items.length === 0) return null;

  return createPortal(
    <div
      ref={menuRef}
      className={styles.menu}
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item) => {
        if (item.separator) {
          return <div key={item.id} className={styles.separator} />;
        }

        return (
          <button
            key={item.id}
            className={classNames(
              styles.menuItem,
              item.danger && styles.danger,
              item.disabled && styles.disabled
            )}
            onClick={() => {
              if (!item.disabled) {
                item.onClick?.();
                hideContextMenu();
              }
            }}
            disabled={item.disabled}
          >
            {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
            <span className={styles.itemLabel}>{item.label}</span>
          </button>
        );
      })}
    </div>,
    document.body
  );
}

export default ContextMenu;
