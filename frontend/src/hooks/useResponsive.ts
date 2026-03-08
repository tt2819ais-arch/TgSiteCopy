import { useEffect } from 'react';
import useUIStore from '@/store/uiStore';
import { MOBILE_BREAKPOINT, TABLET_BREAKPOINT } from '@/utils/constants';

export function useResponsive() {
  const setScreenWidth = useUIStore((s) => s.setScreenWidth);
  const setOnline = useUIStore((s) => s.setOnline);
  const isMobile = useUIStore((s) => s.isMobile);
  const screenWidth = useUIStore((s) => s.screenWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Начальная проверка
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setScreenWidth, setOnline]);

  return {
    isMobile,
    isTablet: screenWidth >= MOBILE_BREAKPOINT && screenWidth < TABLET_BREAKPOINT,
    isDesktop: screenWidth >= TABLET_BREAKPOINT,
    screenWidth,
  };
}

export default useResponsive;
