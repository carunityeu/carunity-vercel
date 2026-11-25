/**
 * Fuel chip styling.
 * Electric ("Электро") chips turn brand blue and show a bolt icon instead of the
 * fuel-pump icon; the bolt is always white on the blue background.
 */
export const ELECTRIC_FUEL_BG = '#465A90';

export const ELECTRIC_BOLT_ICON =
  'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/50f28d203_bolt.png';

/** Inline style for the electric chip — overrides the default tile background and text color */
export const ELECTRIC_CHIP_STYLE = { backgroundColor: ELECTRIC_FUEL_BG, color: '#ffffff' };

export const isElectricFuel = (fuelType) => fuelType === 'electric';

/** Plug icon for the electric consumption chip (white glyph on a black square) */
export const ENERGY_PLUG_ICON =
  'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/dfd2de235_plugicon.png';

// Временно отключено: синий акцент на плашках «Электро» и расхода электроэнергии убран,
// плиточки используют обычные цвета. Функции оставлены — чтобы вернуть синий акцент,
// поставьте здесь true.
export const ELECTRIC_ACCENT_ENABLED = false;

/**
 * Icon and styling for the electric consumption chip. При включённом акценте плашка
 * синяя, как топливный чип «Электро»; при отключённом — обычного цвета, иконка-розетка
 * остаётся видимой за счёт screen-смешивания с фоном.
 */
export function energyChip() {
  return {
    icon: ENERGY_PLUG_ICON,
    iconStyle: { mixBlendMode: 'screen' },
    style: ELECTRIC_ACCENT_ENABLED ? ELECTRIC_CHIP_STYLE : undefined,
  };
}

/**
 * Icon, icon class and chip style for a fuel chip.
 * @param {string} fuelType e.g. 'electric', 'diesel'
 * @param {string} defaultIcon fuel-pump icon url (petrol, diesel, gas…); electric gets a bolt, hybrids a plug
 */
export const isHybridFuel = (fuelType) => fuelType === 'hybrid' || fuelType === 'plugin_hybrid';

export function fuelChip(fuelType, defaultIcon) {
  const electric = isElectricFuel(fuelType);
  const accented = electric && ELECTRIC_ACCENT_ENABLED;
  // Hybrids get the plug icon (white glyph on a black square: screen-blend drops the square)
  if (isHybridFuel(fuelType)) return { icon: ENERGY_PLUG_ICON, iconClass: 'mix-blend-screen', style: undefined };
  return {
    icon: electric ? ELECTRIC_BOLT_ICON : defaultIcon,
    // the bolt stays white on the blue chip; other icons invert only in dark mode
    iconClass: accented ? 'invert' : 'dark:invert',
    style: accented ? ELECTRIC_CHIP_STYLE : undefined,
  };
}