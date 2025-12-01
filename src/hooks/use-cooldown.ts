import React, { useState, useEffect, useCallback } from 'react';

/**
 * Manages a time-based cooldown state (session-based, no local storage).
 * @param durationSeconds The duration of the cooldown in seconds.
 * @returns An object containing the remaining time, a boolean indicating if the cooldown is active, and a function to start the cooldown.
 */
export const useCooldown = (durationSeconds: number) => {
  // Store the timestamp when the cooldown should end. Initialized to 0 (no active cooldown).
  const [cooldownEnd, setCooldownEnd] = useState<number>(0);
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
      }
    };

    if (cooldownEnd > Date.now()) {
      updateRemainingTime(); // Initial update
      timer = window.setInterval(updateRemainingTime, 1000);
    } else {
      setRemainingTime(0);
    }

    return () => {
      if (timer !== null) {
        clearInterval(timer);
      }
    };
  }, [cooldownEnd]);

  const startCooldown = useCallback(() => {
    const newCooldownEnd = Date.now() + durationSeconds * 1000;
    setCooldownEnd(newCooldownEnd);
  }, [durationSeconds]);

  return {
    remainingTime,
    isCooldownActive,
    startCooldown,
  };
};