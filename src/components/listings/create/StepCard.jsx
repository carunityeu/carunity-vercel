import React from 'react';

export default function StepCard({ num, title, optional, visible = true, children, id }) {
  if (!visible) return null;
  return (
    <section id={id} className="lc-step">
      <h3>
        {title}
        {optional && <span className="lc-optional">({optional})</span>}
      </h3>
      {children}
    </section>
  );
}