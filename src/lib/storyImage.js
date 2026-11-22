import html2canvas from 'html2canvas';
import paintStoryText from '@/lib/paintStoryText';
import { ELECTRIC_BOLT_ICON, ENERGY_PLUG_ICON } from '@/lib/fuelBadge';

export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;
export const STORY_EXPORT_SCALE = 2;
export const STORY_BG = '#101014';
/** Reference story photo frame, inset 60px on each side. */
export const STORY_PHOTO_WIDTH = 960;
export const STORY_PHOTO_HEIGHT = 656;
export const STORY_LOGO_URL =
  'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/fc09a8e55_culogo.png';

const MEDIA = 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/';

/** The app's own spec icons — the same png files the car cards use. */
export const STORY_ICON_URLS = {
  date: `${MEDIA}d58467efb_icons8-calendar-96.png`,
  mileage: `${MEDIA}f3a09dd47_road-perspective.png`,
  power: `${MEDIA}e4b346d84_speedometer1.png`,
  fuel: `${MEDIA}6feb2f9c7_gas-station1.png`,
  transmission: `${MEDIA}5bf7d42bf_gearbox3.png`,
  drive: `${MEDIA}acf090957_4wd.png`,
  body: `${MEDIA}04d21af6a_car.png`,
  volume: `${MEDIA}8312588b3_piston.png`,
  location: `${MEDIA}042a078cf_pin.png`,
  electric: ELECTRIC_BOLT_ICON,
  hybrid: ENERGY_PLUG_ICON,
};

/**
 * Loads every spec icon as a white glyph on a square canvas, so the exported
 * card shows the app's own icons in one consistent size.
 */
export async function loadStoryIcons() {
  const entries = await Promise.all(
    Object.entries(STORY_ICON_URLS).map(async ([key, url]) => [
      key,
      await toWhiteIconDataUrl(url),
    ])
  );
  return Object.fromEntries(entries.filter(([, value]) => value));
}

/**
 * Loads an image and returns it as a data URL.
 * Data URLs never taint the canvas, so the exported story can always be saved.
 * Returns null when the image cannot be read (blocked host, missing file, ...).
 */
export async function toDataUrl(url) {
  if (!url) return null;
  try {
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type || !blob.type.startsWith('image/')) return null;
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('read_failed'));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

const ICON_CANVAS = 128;
const ICON_GLYPH = 116;

/**
 * Reads one icon file and returns it as a white glyph, cropped to its own
 * edges and centred on a square canvas: every icon then shows at the same
 * optical size and keeps its proportions no matter what box it lands in.
 * Returns null when the icon cannot be read.
 */
export async function toWhiteIconDataUrl(url) {
  const raw = await toDataUrl(url);
  if (!raw) return null;
  return await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const full = document.createElement('canvas');
        full.width = img.naturalWidth;
        full.height = img.naturalHeight;
        const ctx = full.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const frame = ctx.getImageData(0, 0, full.width, full.height);
        const px = frame.data;
        const corners = [0, (full.width - 1) * 4, (full.height - 1) * full.width * 4, (full.width * full.height - 1) * 4];
        const darkBackground = corners.every(i => px[i + 3] > 240 && Math.max(px[i], px[i + 1], px[i + 2]) < 40);
        if (darkBackground) {
          for (let i = 0; i < px.length; i += 4) {
            px[i + 3] = Math.round(px[i + 3] * Math.max(px[i], px[i + 1], px[i + 2]) / 255);
          }
        }
        let minX = full.width;
        let minY = full.height;
        let maxX = -1;
        let maxY = -1;
        for (let y = 0; y < full.height; y++) {
          for (let x = 0; x < full.width; x++) {
            const i = (y * full.width + x) * 4;
            if (px[i + 3] > 40) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        for (let i = 0; i < px.length; i += 4) {
          px[i] = 255;
          px[i + 1] = 255;
          px[i + 2] = 255;
        }
        ctx.putImageData(frame, 0, 0);

        const cropped = maxX > minX && maxY > minY;
        const srcX = cropped ? minX : 0;
        const srcY = cropped ? minY : 0;
        const srcW = cropped ? maxX - minX + 1 : full.width;
        const srcH = cropped ? maxY - minY + 1 : full.height;
        const glyph = ICON_GLYPH / Math.max(srcW, srcH);

        const out = document.createElement('canvas');
        out.width = ICON_CANVAS;
        out.height = ICON_CANVAS;
        out.getContext('2d').drawImage(
          full,
          srcX,
          srcY,
          srcW,
          srcH,
          (ICON_CANVAS - srcW * glyph) / 2,
          (ICON_CANVAS - srcH * glyph) / 2,
          srcW * glyph,
          srcH * glyph
        );
        resolve(out.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = raw;
  });
}

/**
 * The listing photo cropped to the story frame's own shape. The exporter draws
 * images into their box regardless of object-fit, so pre-cropping is what keeps
 * the car photo from stretching in the exported PNG.
 * Returns null when the photo cannot be read.
 */
export async function toStoryPhotoDataUrl(url, scale = STORY_EXPORT_SCALE) {
  const raw = await toDataUrl(url);
  if (!raw) return null;
  return await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const out = document.createElement('canvas');
        out.width = Math.round(STORY_PHOTO_WIDTH * scale);
        out.height = Math.round(STORY_PHOTO_HEIGHT * scale);
        const target = out.width / out.height;
        const source = img.naturalWidth / img.naturalHeight;
        let sw = img.naturalWidth;
        let sh = img.naturalHeight;
        if (source > target) sw = img.naturalHeight * target;
        else sh = img.naturalWidth / target;
        const ctx = out.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
          img,
          (img.naturalWidth - sw) / 2,
          (img.naturalHeight - sh) / 2,
          sw,
          sh,
          0,
          0,
          out.width,
          out.height
        );
        resolve(out.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = raw;
  });
}

/** True when the device can hand a real image file to another app (Instagram). */
export function supportsFileShare() {
  if (typeof navigator === 'undefined' || typeof navigator.canShare !== 'function') return false;
  try {
    const probe = new File([new Blob([''], { type: 'image/png' })], 'probe.png', { type: 'image/png' });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

export function waitForPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

/** Renders a lossless 2160x3840 PNG while preserving the 1080x1920 layout. */
export async function renderStoryBlob(node) {
  if (!node) throw new Error('nothing_to_render');
  if (document.fonts?.ready) {
    try {
      // Every weight the artwork uses, so the export never falls back to a system font.
      await Promise.all(
        [400, 500, 600, 700, 800].map((weight) => document.fonts.load(`${weight} 100px Roboto`, node.textContent || 'CarUnity'))
      );
      await document.fonts.ready;
    } catch {
      /* Fonts API unavailable — continue with system fallback */
    }
  }
  // html2canvas crops at the card's own position on the page, so the card must
  // sit in the document flow far to the left (not fixed, not scrolled).
  const canvas = await html2canvas(node, {
    scale: STORY_EXPORT_SCALE,
    width: STORY_WIDTH,
    height: STORY_HEIGHT,
    windowWidth: STORY_WIDTH,
    windowHeight: STORY_HEIGHT,
    backgroundColor: STORY_BG,
    useCORS: true,
    logging: false,
    onclone: (doc) => {
      doc.querySelectorAll('[data-story-text]').forEach((element) => {
        element.style.setProperty('color', 'transparent', 'important');
        element.style.setProperty('text-decoration-color', 'transparent', 'important');
      });
    },
  });
  paintStoryText(canvas, node);
  return await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('blob_failed'));
    }, 'image/png');
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export async function copyText(text) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function buildStoryFilename(car) {
  const id = car?.short_id || car?.id || 'listing';
  return `carunity-story-${id}.png`;
}

export function buildStoryFile(blob, car) {
  return new File([blob], buildStoryFilename(car), { type: 'image/png' });
}

/**
 * Opens the native share sheet with the story image.
 * Instagram appears as a target, so the image lands in the story editor
 * without ever being saved to the gallery.
 */
export async function shareStoryFile(file) {
  if (!navigator.canShare?.({ files: [file] })) return false;
  try {
    await navigator.share({ files: [file] });
    return true;
  } catch (err) {
    if (err?.name === 'AbortError') return true;
    throw err;
  }
}