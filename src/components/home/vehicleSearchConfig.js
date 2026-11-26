// What the home search shows for each vehicle type. Every type uses the same fields and layout
// (two rows of four on laptops, the rest under "All filters"); only the set and order differ.
import { KNOWN_MOTO_BRANDS, formatMotoBrand } from '@/utils/motoBrands';

const ICON_BASE = 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/';

// Tabs in this order; the first MAIN_TYPES are always shown, the rest open in the same row
export const VEHICLE_TYPES = [
  { key: 'car', labelKey: 'nav.passenger', fallback: 'Легковые', icon: ICON_BASE + '3ed0c0079_sedaniconcu.png' },
  { key: 'moto', labelKey: 'home.vtype_moto', icon: ICON_BASE + 'f0312e09d_motocycleiconcu.png' },
  { key: 'bus', labelKey: 'home.vtype_bus', icon: ICON_BASE + '25ce6f6a7_busiconcu.png' },
  { key: 'truck', labelKey: 'home.vtype_truck', icon: ICON_BASE + '122985056_truckiconcu.png' },
  { key: 'special', labelKey: 'home.vtype_special', icon: ICON_BASE + 'a935d278f_traktoriconcu.png' },
  { key: 'boat', labelKey: 'home.vtype_boat', icon: ICON_BASE + '3d51d9a96_boaticoncu.png' },
  { key: 'motorhome', labelKey: 'home.vtype_motorhome', icon: ICON_BASE + 'c42e06342_housetrailericoncu.png' },
  { key: 'trailer', labelKey: 'home.vtype_trailer', icon: ICON_BASE + 'd68253701_trailericoncu.png' },
];
export const MAIN_TYPES = 5;

export const CAR_FUELS = ['petrol', 'diesel', 'electric', 'hybrid', 'plugin_hybrid', 'gas', 'petrol_cng', 'petrol_lng', 'diesel_cng', 'diesel_lng', 'lpg', 'cng', 'lng', 'hydrogen', 'ethanol'];
const HEAVY_FUELS = ['petrol', 'diesel', 'electric', 'hybrid', 'gas', 'lpg', 'cng', 'lng', 'hydrogen'];

export const MOTO_BRANDS = KNOWN_MOTO_BRANDS.map((b) => ({ value: b, label: formatMotoBrand(b) }));

/*
 * main  — fields of the two rows, in order (brand, model and price are always visible on phones)
 * extra — fields under "All filters"
 * sub   — the "kind of vehicle" select: URL key, translation prefix and options
 * fuels — fuel / engine options; fuelLabel overrides the field name (boats: engine type)
 */
export const TYPE_CONFIG = {
  car: {
    main: ['brand', 'model', 'price', 'fuel', 'gearbox', 'year', 'country', 'power'],
    extra: ['body', 'mileage', 'city', 'color', 'drive', 'extended'],
    fuels: CAR_FUELS,
  },
  moto: {
    main: ['brand', 'model', 'price', 'sub', 'fuel', 'year', 'country', 'power'],
    extra: ['gearbox', 'color'],
    sub: { key: 'moto_type', labelKey: 'vehicle_filters.moto_type', fallback: 'Тип мотоцикла', tPrefix: 'moto_types', options: ['sport', 'naked', 'touring', 'cruiser', 'enduro', 'scooter', 'chopper', 'motocross', 'quad'] },
    fuels: ['petrol', 'electric'],
  },
  bus: {
    main: ['brand', 'model', 'price', 'sub', 'gearbox', 'year', 'country', 'power'],
    extra: ['fuel', 'color'],
    sub: { key: 'bus_type', labelKey: 'vehicle_filters.bus_type', fallback: 'Тип автобуса', tPrefix: 'bus_types', options: ['minibus', 'midi', 'full_size', 'double_decker', 'school', 'tourist'] },
    fuels: HEAVY_FUELS,
  },
  truck: {
    main: ['brand', 'model', 'price', 'sub', 'gearbox', 'year', 'country', 'power'],
    extra: ['fuel', 'color'],
    sub: { key: 'truck_type', labelKey: 'vehicle_filters.truck_type', fallback: 'Тип грузовика', tPrefix: 'truck_types', options: ['semi_truck', 'box_truck', 'flatbed', 'refrigerated', 'tanker', 'tipper', 'curtainsider', 'other'] },
    fuels: HEAVY_FUELS,
  },
  special: {
    main: ['brand', 'model', 'price', 'sub', 'fuel', 'year', 'country', 'power'],
    extra: ['color'],
    sub: { key: 'equipment_type', labelKey: 'vehicle_filters.equipment_type', fallback: 'Тип техники', tPrefix: 'equipment_types', options: ['excavator', 'bulldozer', 'crane', 'loader', 'tractor', 'harvester', 'forklift', 'compressor', 'generator', 'other'] },
    fuels: ['diesel', 'petrol', 'electric', 'gas'],
  },
  boat: {
    main: ['brand', 'model', 'price', 'sub', 'fuel', 'year', 'country', 'power'],
    extra: ['color'],
    sub: { key: 'boat_type', labelKey: 'vehicle_filters.boat_type', fallback: 'Тип лодки', tPrefix: 'boat_types', options: ['motorboat', 'sailboat', 'yacht', 'pontoon', 'speedboat', 'fishing', 'inflatable', 'catamaran', 'jet_ski', 'other'] },
    fuels: ['petrol', 'diesel', 'electric', 'sail'],
    fuelLabel: { key: 'vehicle_filters.engine_type', fallback: 'Тип двигателя' },
  },
  motorhome: {
    main: ['brand', 'model', 'price', 'sub', 'gearbox', 'year', 'country', 'power'],
    extra: ['fuel', 'color'],
    sub: { key: 'motorhome_type', labelKey: 'vehicle_filters.motorhome_type', fallback: 'Тип автодома', tPrefix: 'motorhome_types', options: ['alcove', 'semi_integrated', 'integrated', 'van_conversion', 'campervan', 'fifth_wheel'] },
    fuels: ['diesel', 'petrol', 'electric', 'hybrid'],
  },
  trailer: {
    main: ['brand', 'model', 'price', 'sub', 'year', 'country', 'color'],
    extra: [],
    sub: { key: 'trailer_type', labelKey: 'vehicle_filters.trailer_type', fallback: 'Тип прицепа', tPrefix: 'trailer_types', options: ['caravan', 'car_trailer', 'boat_trailer', 'flatbed_trailer', 'curtainsider', 'refrigerated', 'tanker', 'livestock', 'other'] },
  },
};

/** Fields that stay visible on phones and tablets without "All filters". */
export const ALWAYS_VISIBLE = ['brand', 'model', 'price'];
