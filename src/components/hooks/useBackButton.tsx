'use client';

import { useEffect } from 'react';

function useBackButton(callback: (e: PopStateEvent) => void) {
  useEffect(() => {
    const handleBackButton = (e: PopStateEvent) => {
      e.preventDefault();
      console.log(e);
      callback(e);
    };

    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [callback]);
}

export default useBackButton;
