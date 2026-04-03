"use client";

import { useState, useEffect } from "react";

type XPEvent = {
  id: number;
  amount: number;
  x: number;
  y: number;
};

let eventId = 0;

export function triggerXPPopup(amount: number, element?: HTMLElement) {
  const event = new CustomEvent("xp-popup", {
    detail: {
      id: ++eventId,
      amount,
      x: element ? element.getBoundingClientRect().left + element.offsetWidth / 2 : window.innerWidth / 2,
      y: element ? element.getBoundingClientRect().top : window.innerHeight / 2,
    },
  });
  window.dispatchEvent(event);
}

export default function XPPopup() {
  const [popups, setPopups] = useState<XPEvent[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as XPEvent;
      setPopups((prev) => [...prev, detail]);
      setTimeout(() => {
        setPopups((prev) => prev.filter((p) => p.id !== detail.id));
      }, 1200);
    };
    window.addEventListener("xp-popup", handler);
    return () => window.removeEventListener("xp-popup", handler);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {popups.map((p) => (
        <div
          key={p.id}
          className="absolute text-sm font-bold animate-xp-float"
          style={{
            left: p.x,
            top: p.y,
            color: 'var(--accent)',
            textShadow: '0 0 8px var(--accent-glow)',
          }}
        >
          +{p.amount} XP
        </div>
      ))}
    </div>
  );
}
