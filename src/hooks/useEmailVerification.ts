import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

export function useEmailVerification() {
  const { user } = useAuthContext();
  const [showBanner, setShowBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    // Verificar si el usuario está autenticado y no tiene email verificado
    if (user && !user.isVerified && !bannerDismissed) {
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
  }, [user, bannerDismissed]);

  // Verificar si el banner fue previamente descartado en esta sesión
  useEffect(() => {
    const dismissed = sessionStorage.getItem('emailVerificationBannerDismissed');
    if (dismissed === 'true') {
      setBannerDismissed(true);
    }
  }, []);

  const dismissBanner = () => {
    setShowBanner(false);
    setBannerDismissed(true);
    // Recordar que fue descartado durante esta sesión
    sessionStorage.setItem('emailVerificationBannerDismissed', 'true');
  };

  const resetBannerState = () => {
    setShowBanner(false);
    setBannerDismissed(false);
    sessionStorage.removeItem('emailVerificationBannerDismissed');
  };

  return {
    showBanner,
    dismissBanner,
    resetBannerState,
    isEmailVerified: user?.isVerified || false,
    userEmail: user?.email
  };
}