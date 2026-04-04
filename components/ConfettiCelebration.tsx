"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

type Props = {
  active: boolean;
};

export default function ConfettiCelebration({ active }: Props) {
  useEffect(() => {
    if (!active) return;

    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#e8a838', '#818cf8', '#a78bfa', '#34d399', '#f87171', '#60a5fa', '#fb923c', '#c084fc']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#e8a838', '#818cf8', '#a78bfa', '#34d399', '#f87171', '#60a5fa', '#fb923c', '#c084fc']
      });
    }, 250);

    return () => clearInterval(interval);
  }, [active]);

  return null;
}
