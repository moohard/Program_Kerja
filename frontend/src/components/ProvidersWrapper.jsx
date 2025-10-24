import React, { useEffect } from 'react';
import LayoutProvider from '@/context/useLayoutContext';
import { useLocation } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider

const ProvidersWrapper = ({ children }) => {
  const path = useLocation();
  useEffect(() => {
    import('preline/preline').then(() => {
      if (window.HSStaticMethods) {
        window.HSStaticMethods.autoInit();
      }
    });
  }, []);
  useEffect(() => {
    if (window.HSStaticMethods) {
      window.HSStaticMethods.autoInit();
    }
  }, [path]);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (window.HSStaticMethods) {
        window.HSStaticMethods.autoInit();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, []);
  return (
    <LayoutProvider>
      <AuthProvider>{children}</AuthProvider>
    </LayoutProvider>
  );
};
export default ProvidersWrapper;