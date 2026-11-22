// EU-style license plate input component
export default function LicensePlateInput({ value, onChange }) {
  const stars = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const r = 9;
    const x = 14 + r * Math.cos(angle);
    const y = 14 + r * Math.sin(angle);
    return { x, y };
  });

  return (
    <div className="flex items-center w-fit">
      <div className="flex items-center justify-center bg-blue-700 rounded-l-lg h-10 w-8 flex-shrink-0">
        <svg width="28" height="28" viewBox="0 0 28 28">
          {stars.map((s, i) => (
            <text key={i} x={s.x} y={s.y} textAnchor="middle" dominantBaseline="middle" fontSize="4" fill="#FFD700">★</text>
          ))}
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value.toUpperCase())}
        placeholder="000 AAA"
        maxLength={10}
        className="h-10 px-3 text-base font-bold tracking-widest text-slate-900 bg-white border-2 border-l-0 border-slate-300 rounded-r-lg w-36 uppercase focus:outline-none focus:border-blue-500"
        style={{ fontFamily: 'monospace', letterSpacing: '0.15em' }}
      />
    </div>
  );
}