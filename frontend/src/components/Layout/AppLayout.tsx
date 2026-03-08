import { type ReactNode } from 'react';
import styles from './AppLayout.module.css';
import { classNames } from '@/utils/helpers';
import useUIStore from '@/store/uiStore';

interface AppLayoutProps {
  sidebar?: ReactNode;
  children: ReactNode;
  rightPanel?: ReactNode;
}

export function AppLayout({ sidebar, children, rightPanel }: AppLayoutProps) {
  const isMobile = useUIStore((s) => s.isMobile);
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);

  return (
    <div className={styles.layout}>
      {sidebar && (
        <aside
          className={classNames(
            styles.sidebar,
            isMobile && styles.sidebarMobile,
            isMobile && !isSidebarOpen && styles.sidebarHidden
          )}
        >
          {sidebar}
        </aside>
      )}

      {isMobile && isSidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
        />
      )}

      <main className={styles.main}>
        {children}
      </main>

      {rightPanel && (
        <aside className={styles.rightPanel}>
          {rightPanel}
        </aside>
      )}
    </div>
  );
}

export default AppLayout;
