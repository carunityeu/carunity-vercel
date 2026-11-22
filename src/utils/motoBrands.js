// Curated list of well-known motorcycle brands (matching exact DB casing from MotorcycleModelInfo)
export const KNOWN_MOTO_BRANDS = [
  'Aprilia', 'Arch', 'Bajaj', 'Baltmotors', 'Benelli', 'Beta',
  'Bimota', 'Bmw', 'Boss Hoss', 'Boom Trikes', 'Bsa', 'Buell', 'Bultaco',
  'Cagiva', 'Can-am', 'Ccm', 'Cf Moto', 'Csc Motorcycles', 'Curtiss',
  'Daelim', 'Damon', 'Derbi', 'Dnepr', 'Ducati', 'Energica', 'Gas Gas',
  'Gilera', 'Harley-davidson', 'Haojue', 'Hero', 'Honda', 'Husqvarna', 'Indian',
  'Jawa', 'Keeway', 'Ktm', 'Kymco', 'Laverda', 'Moto Guzzi', 'Mv Agusta',
  'Norton', 'Peugeot', 'Piaggio', 'Polaris', 'Rieju', 'Royal Enfield', 'Sachs',
  'Sherco', 'Super Soco', 'Suzuki', 'Swm', 'Sym', 'Tm Racing', 'Tomos',
  'Triumph', 'Tvs', 'Ural', 'Vespa', 'Victory', 'Voge', 'Yamaha', 'Zero',
  'Zongshen', 'Zontes'
];

// Format brand name for display (fixes casing for well-known acronyms)
export function formatMotoBrand(brand) {
  const special = {
    'Bmw': 'BMW',
    'Ktm': 'KTM',
    'Mv Agusta': 'MV Agusta',
    'Tm Racing': 'TM Racing',
    'Harley-davidson': 'Harley-Davidson',
    'Can-am': 'Can-Am',
    'Cf Moto': 'CFMoto',
    'Swm': 'SWM',
    'Sym': 'SYM',
    'Tvs': 'TVS',
    'Csc Motorcycles': 'CSC Motorcycles',
  };
  return special[brand] || brand;
}