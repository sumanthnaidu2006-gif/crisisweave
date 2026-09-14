import { useState, useEffect } from 'react';
import { haptics } from '../services/haptics';

export function useHaptics() {
  const [isEnabled, setIsEnabled] = useState(() => haptics.isEnabled());

  useEffect(() => {
    const unsubscribe = haptics.subscribe((enabled) => {
      setIsEnabled(enabled);
    });
    return unsubscribe;
  }, []);

  const toggle = () => {
    return haptics.toggle();
  };

  return {
    isEnabled,
    toggle,
    haptics,
    light: () => haptics.light(),
    medium: () => haptics.medium(),
    heavy: () => haptics.heavy(),
    success: () => haptics.success(),
    warning: () => haptics.warning(),
    emergencySOS: () => haptics.emergencySOS(),
  };
}
