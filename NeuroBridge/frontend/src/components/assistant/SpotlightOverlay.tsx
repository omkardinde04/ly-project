import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function SpotlightOverlay({ targetId, active = false }: { targetId: string | null, active: boolean }) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!active || !targetId) {
      setRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // wait for scroll to finish before setting rect accurately
        setTimeout(() => {
          const newEl = document.getElementById(targetId);
          if (newEl) setRect(newEl.getBoundingClientRect());
        }, 500);
        // Set immediately for now
        setRect(el.getBoundingClientRect());
      } else {
        setRect(null);
      }
    };

    updateRect();
    window.addEventListener('scroll', updateRect);
    window.addEventListener('resize', updateRect);

    return () => {
      window.removeEventListener('scroll', updateRect);
      window.removeEventListener('resize', updateRect);
    };
  }, [targetId, active]);

  if (!active) return null;

  return (
    <AnimatePresence>
      {active && rect && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Top cover */}
          <div className="absolute bg-black/60 top-0 left-0 right-0 transition-all duration-500 ease-in-out" style={{ height: Math.max(0, rect.top - 10) }} />
          {/* Bottom cover */}
          <div className="absolute bg-black/60 left-0 right-0 bottom-0 transition-all duration-500 ease-in-out" style={{ top: rect.bottom + 10 }} />
          {/* Left cover */}
          <div className="absolute bg-black/60 left-0 transition-all duration-500 ease-in-out" style={{ top: Math.max(0, rect.top - 10), bottom: Math.max(0, window.innerHeight - (rect.bottom + 10)), width: Math.max(0, rect.left - 10) }} />
          {/* Right cover */}
          <div className="absolute bg-black/60 right-0 transition-all duration-500 ease-in-out" style={{ top: Math.max(0, rect.top - 10), bottom: Math.max(0, window.innerHeight - (rect.bottom + 10)), left: rect.right + 10 }} />
          
          {/* Highlight Border */}
          <motion.div 
            className="absolute border-4 border-blue-500 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-500 ease-in-out"
            style={{ 
              top: rect.top - 10, 
              left: rect.left - 10, 
              width: rect.width + 20, 
              height: rect.height + 20 
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
