import React, { useState, useEffect, useCallback } from 'react';

const COOLDOWN_KEY = 'track_add_cooldown_end';

/**
 * Manages a time-based cooldown state using local storage.
 * @param durationSeconds The duration of the cooldown in seconds.
 * @returns An object containing the remaining time, a boolean indicating if the cooldown is active, and a function to start the cooldown.
 */
export const useCooldown = (durationSeconds: number) => {
  const [cooldownEnd, setCooldownEnd] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const storedEnd = localStorage.getItem(COOLDOWN_KEY);
      return storedEnd ? parseInt(storedEnd, 10) : 0;
    }
    return 0;
  });
  const [remainingTime, setRemainingTime] = useState(0);

  const isCooldownActive = remainingTime > 0;

  // Effect to update remaining time every second
  useEffect(() => {
    let timer: number | null = null;

    const updateRemainingTime = () => {
      const now = Date.now();
      const end = cooldownEnd;
      const timeRemaining = Math.max(0, Math.ceil((end - now) / 1000));
      
      setRemainingTime(timeRemaining);

      if (timeRemaining === 0 && timer !== null) {
        clearInterval(timer);
        localStorage.removeItem(COOLDOWN_KEY);
      }
    };

    if (cooldownEnd > Date.now()) {
      updateRemainingTime(); // Initial update
      timer = window.setInterval(updateRemainingTime, 1000);
    } else {
      setRemainingTime(0);
      localStorage.removeItem(COOLDOWN_KEY);
    }

    return () => {
      if (timer !== null) {
        clearInterval(timer);
      }
    };
  }, [cooldownEnd]);

  const startCooldown = useCallback(() => {
    const newCooldownEnd = Date.now() + durationSeconds * 1000;
    localStorage.setItem(COOLDOWN_KEY, newCooldownEnd.toString());
    setCooldownEnd(newCooldownEnd);
  }, [durationSeconds]);

  return {
    remainingTime,
    isCooldownActive,
    startCooldown,
  };
};