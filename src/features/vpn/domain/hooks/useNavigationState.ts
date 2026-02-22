import { useCallback, useEffect, useState } from 'react';
import type { ScreenType } from '@/core/types';
import { SCREENS } from '@/core/constants';
import { useIsMobilePortrait } from '@/shared/hooks/useIsMobilePortrait';

export function useNavigationState(termsAccepted: boolean) {
  const [screen, setScreenState] = useState<ScreenType>('home');
  const isMobilePortrait = useIsMobilePortrait();

  const setScreen = useCallback((next: ScreenType) => {
    if (!SCREENS.includes(next)) return;
    setScreenState((current) => (current === next ? current : next));
  }, []);

  useEffect(() => {
    // Only force the terms screen on narrow mobile in portrait
    if (!termsAccepted && screen !== 'terms' && isMobilePortrait) {
      setScreenState('terms');
    }
  }, [screen, termsAccepted, isMobilePortrait]);

  return { screen, setScreen };
}
