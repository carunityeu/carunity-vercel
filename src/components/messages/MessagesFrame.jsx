import React, { useLayoutEffect, useRef } from 'react';

export default function MessagesFrame({ children, selectedChatId }) {
  const frameRef = useRef(null);
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const header = document.querySelector('header')?.parentElement;
    const update = () => {
      const visibleHeight = window.visualViewport?.height || window.innerHeight;
      const top = Math.max(0, header?.getBoundingClientRect().bottom || 0);
      frame.style.top = `${top}px`;
      frame.style.height = `${Math.max(0, visibleHeight + (window.visualViewport?.offsetTop || 0) - top)}px`;
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(frame.parentElement);
    if (header) observer.observe(header);
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    return () => { observer.disconnect(); window.removeEventListener('resize', update);       window.visualViewport?.removeEventListener('resize', update); };
  }, [selectedChatId]);
  return <div ref={frameRef} style={{ top: 'var(--header-h)' }} className="messages-screen fixed inset-x-0 bottom-0 z-10 flex min-h-0 min-w-0 overflow-hidden border-t border-border bg-background">{children}</div>;
}