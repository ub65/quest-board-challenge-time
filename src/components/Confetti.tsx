
import React, { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

const Confetti: React.FC = () => {
  const fired = useRef(false);

  useEffect(() => {
    if (!fired.current) {
      fired.current = true;
      // Fire a nice burst!
      confetti({
        particleCount: 130,
        spread: 88,
        angle: 90,
        origin: { y: 0.4 },
        zIndex: 2000,
      });
      // A couple more bursts for fun
      setTimeout(() => {
        confetti({
          particleCount: 90,
          angle: 120,
          spread: 72,
          origin: { x: 0.2, y: 0.35 },
          zIndex: 2000,
        });
        confetti({
          particleCount: 90,
          angle: 60,
          spread: 72,
          origin: { x: 0.8, y: 0.35 },
          zIndex: 2000,
        });
      }, 300);
    }
  }, []);
  return null;
};

export default Confetti;
