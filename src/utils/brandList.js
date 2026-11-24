// Brands offered in search pickers: the curated list plus every brand that has a model list
// in carData, so a brand with known models can always be picked.
import { csvBrands } from './carData';

const CURATED = ['Abarth', 'Acura', 'Aiways', 'Alfa Romeo', 'Alpine', 'Arcfox', 'Ariel', 'Aston Martin', 'Audi', 'BAIC', 'Baojun', 'Bentley', 'BMW', 'Brilliance', 'Bugatti', 'Buick', 'BYD', 'BYTON', 'Cadillac', 'Changan', 'Chery', 'Chevrolet', 'Chrysler', 'Citroën', 'Cupra', 'Daihatsu', 'Datsun', 'DeLorean', 'Dodge', 'Dongfeng', 'DS', 'Exeed', 'FAW', 'Ferrari', 'Fiat', 'Fisker', 'Ford', 'Foton', 'GAC', 'Geely', 'Genesis', 'GMC', 'Great Wall', 'Haval', 'Honda', 'Hongqi', 'Hummer', 'Hyundai', 'Ineos', 'Infiniti', 'Isuzu', 'JAC', 'Jaguar', 'Jeep', 'Kia', 'Koenigsegg', 'Lada', 'Lamborghini', 'Lancia', 'Land Rover', 'Leapmotor', 'Lexus', 'Li Auto', 'Lifan', 'Lincoln', 'Lotus', 'Lucid', 'Mahindra', 'Maserati', 'Maybach', 'Mazda', 'McLaren', 'Mercedes-Benz', 'MG', 'Mini', 'Mitsubishi', 'NIO', 'Nissan', 'Oldsmobile', 'Opel', 'Pagani', 'Peugeot', 'Perodua', 'Polestar', 'Pontiac', 'Porsche', 'Proton', 'Ram', 'Renault', 'Rivian', 'Rolls-Royce', 'Saab', 'Scion', 'Seat', 'Skoda', 'Skywell', 'Smart', 'SsangYong', 'Subaru', 'Suzuki', 'Tata', 'Tesla', 'Toyota', 'Vauxhall', 'VinFast', 'Volkswagen', 'Volvo', 'Wey', 'XPeng', 'ZEEKR'];

const seen = new Set();
export const BRANDS = [...CURATED, ...csvBrands]
  .filter((b) => { const k = b.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
  .sort((a, b) => a.localeCompare(b));
