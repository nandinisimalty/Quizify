import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

export default function ConfettiEffect({ active, duration = 5000 }) {
  const [windowDimension, setDimension] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [show, setShow] = useState(active);

  useEffect(() => {
    setShow(active);
    
    // Auto turn off
    if (active) {
      const timer = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  useEffect(() => {
    const detectSize = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', detectSize);
    return () => window.removeEventListener('resize', detectSize);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <Confetti
        width={windowDimension.width}
        height={windowDimension.height}
        recycle={false}
        numberOfPieces={400}
        gravity={0.15}
      />
    </div>
  );
}
