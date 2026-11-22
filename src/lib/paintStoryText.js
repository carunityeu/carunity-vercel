// Paint text with the browser's real font metrics, not html2canvas's inferred baselines.
export default function paintStoryText(canvas, root) {
  const ctx = canvas.getContext('2d');
  ctx.save();
  const origin = root.getBoundingClientRect();
  ctx.setTransform(canvas.width / origin.width, 0, 0, canvas.height / origin.height, 0, 0);
  for (const element of root.querySelectorAll('[data-story-text]')) {
    const text = element.firstChild;
    if (!text || text.nodeType !== Node.TEXT_NODE) continue;
    const style = getComputedStyle(element);
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    ctx.fillStyle = style.color;
    ctx.textBaseline = 'alphabetic';
    ctx.letterSpacing = style.letterSpacing === 'normal' ? '0px' : style.letterSpacing;
    const lines = [];
    const range = document.createRange();
    for (let i = 0; i < text.length; i++) {
      range.setStart(text, i);
      range.setEnd(text, i + 1);
      const rect = range.getBoundingClientRect();
      let line = lines[lines.length - 1];
      if (!line || Math.abs(line.top - rect.top) > 2) {
        line = { value: '', left: rect.left, top: rect.top, height: rect.height };
        lines.push(line);
      }
      line.value += text.textContent[i];
    }
    for (const line of lines) {
      const metrics = ctx.measureText(line.value);
      const ascent = metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent;
      const descent = metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent;
      const x = line.left - origin.left;
      const baseline = line.top - origin.top + (line.height - ascent - descent) / 2 + ascent;
      ctx.fillText(line.value, x, baseline);
      if (style.textDecorationLine.includes('line-through')) {
        ctx.fillRect(x, baseline - parseFloat(style.fontSize) * 0.32, metrics.width, 2);
      }
    }
  }
  ctx.restore();
}