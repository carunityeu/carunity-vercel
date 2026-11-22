import { useLayoutEffect, useState } from 'react';

const round = (n) => Math.round(n * 100) / 100;

// Tracks the rendered width/height of an element (before the first paint, and on resize)
export default function useElementSize(ref) {
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const w = round(rect.width);
      const h = round(rect.height);
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}