import { getModelsForBrand } from '@/utils/carData';

export const carBrands = [
  'Abarth','Acura','Aiways','Alfa Romeo','Alpine','Arcfox','Ariel','Aston Martin','Audi','BAIC',
  'Baojun','Bentley','BMW','Brilliance','Bugatti','Buick','BYD','BYTON','Cadillac','Changan',
  'Chery','Chevrolet','Chrysler','Citroën','Cupra','Daihatsu','Datsun','DeLorean','Dodge',
  'Dongfeng','DS','Exeed','FAW','Ferrari','Fiat','Fisker','Ford','Foton','GAC','Geely',
  'Genesis','GMC','Great Wall','Haval','Honda','Hongqi','Hummer','Hyundai','Ineos','Infiniti',
  'Isuzu','JAC','Jaguar','Jeep','Kia','Koenigsegg','Lada','Lamborghini','Lancia','Land Rover',
  'Leapmotor','Lexus','Li Auto','Lifan','Lincoln','Lotus','Lucid','Mahindra','Maserati','Maybach',
  'Mazda','McLaren','Mercedes-Benz','MG','Mini','Mitsubishi','NIO','Nissan','Oldsmobile','Opel',
  'Pagani','Peugeot','Perodua','Polestar','Pontiac','Porsche','Proton','Ram','Renault','Rivian',
  'Rolls-Royce','Saab','Scion','Seat','Skoda','Skywell','Smart','Ssangyong','Subaru','Suzuki',
  'Tata','Tesla','Toyota','Vauxhall','VinFast','Volkswagen','Volvo','Wey','XPeng','ZEEKR',
];

export const FUEL_VALUES = ['petrol','diesel','electric','hybrid','plugin_hybrid','gas','petrol_cng','petrol_lng','diesel_cng','diesel_lng','lpg','cng','lng','hydrogen','ethanol'];
export const BODY_VALUES = ['sedan','hatchback','suv','crossover','wagon','coupe','convertible','minivan','pickup'];
export const TRANSMISSION_VALUES = ['manual','automatic'];
export const DRIVE_VALUES = ['fwd','rwd','awd'];

export const EXTERIOR_COLORS = [
  { key: 'white',       swatch: '#ffffff', border: true },
  { key: 'red',         swatch: '#d72425' },
  { key: 'orange',      swatch: '#e95600' },
  { key: 'black',       swatch: '#000000', border: true },
  { key: 'yellow',      swatch: '#e0b900' },
  { key: 'purple',      swatch: '#7e0bbd' },
  { key: 'gray',        swatch: '#aaaaaa', labelKey: 'listing.cr_gray_metallic' },
  { key: 'blue',        swatch: '#2d4fa7' },
  { key: 'brown',       swatch: '#4c2f1b' },
  { key: 'dark_gray',   swatch: '#565656' },
  { key: 'green',       swatch: '#32a500' },
  { key: 'beige',       swatch: '#e2935c' },
];

export const INTERIOR_SWATCHES = {
  black: '#101010', white: '#d9d9d9', beige: '#b88a5e', gray: '#292929',
  blue: '#314779', green: '#31751b', brown: '#4d3425', red: '#7b1515',
  other: 'conic-gradient(#e84a18, #e6c815, #36a936, #248cce, #8b34ad, #e84a18)',
};

export const INTERIOR_MATERIALS = ['alcantara','faux_leather','fabric','partial_leather','velour','full_leather','other'];
export const INTERIOR_COLORS = ['black','white','beige','gray','blue','green','brown','red','other'];
export const EMISSION_CLASSES = ['Euro 4','Euro 5','Euro 6','Euro 6d-TEMP','Euro 6d'];
export const ECO_STICKERS = ['2','3','4','5'];
export const COUNTRIES = ['Latvia','Lithuania','Estonia'];

export const FEATURE_GROUPS = {
  interior: ['leather_interior','velour_interior','alcantara','heated_seats','ventilated_seats','massage_seats','heated_steering','electric_seats','memory_seats','sport_seats','sunroof','panoramic_roof','glass_roof','climate_control','dual_zone_climate','triple_zone_climate','ac','rear_heated_seats','third_row','wood_trim'],
  multimedia: ['navigation','carplay','android_auto','bluetooth','usb','aux','wireless_charging','wifi','audio_system','bose','harman_kardon','bang_olufsen','digital_dash','hud','rear_monitor','dvd_tv'],
  exterior: ['alloy_wheels','winter_tires','summer_tires','second_tires','front_parktronic','rear_parktronic','rear_camera','camera_360','electric_trunk','tow_bar','roof_rails','side_steps','spoiler','xenon','led','matrix_lights','adaptive_light','headlight_washers','tinting','chrome','heated_mirrors','folding_mirrors'],
  drivetrain: ['air_suspension','adaptive_suspension','sport_suspension','lowered_suspension','diff_lock','electronic_diff','drive_modes','regenerative_braking','abs','esp','airbags','lane_assist','auto_emergency_braking','blind_spot','adaptive_cruise','side_airbags','front_airbags','knee_airbags','pedestrian_warning','fatigue_sensor','lane_departure','night_vision','sign_recognition','parking_assist','auto_parking'],
  other: ['cruise_control','electric_windows','electric_mirrors','keyless','remote_start','alarm','immobilizer','spare_wheel','space_saver','tow_hook','engine_guard','floor_mats','trunk_mats','window_deflectors','auto_start_stop','auto_dimming_mirror','climate_auto','climate_2zone','climate_3zone','climate_4zone','auto_tailgate','auto_high_beams','led_headlights','rain_sensor','light_sensor','fog_lights','xenon_lights','heated_windshield','winter_package','smoker_package','parking_sensors','ambient_lighting','premium_sound','privacy_glass','tinted_windows','keyless_entry','power_mirror','heated_wheel'],
};

export const BOOST_OPTIONS = [
  { days: 1, price: 1.99 },
  { days: 3, price: 4.99 },
  { days: 7, price: 9.99 },
  { days: 14, price: 17.99 },
  { days: 30, price: 29.99 },
];

export const BASE_LISTING_PRICE = 4.99;
export const TOP_SPOT_PRICE = 59.99;

export const VEHICLE_TYPES = [
  { key: 'car',        icon: 'Car' },
  { key: 'motorcycle', icon: 'Bike' },
  { key: 'truck',      icon: 'Truck' },
  { key: 'bus',        icon: 'Bus' },
  { key: 'boat',       icon: 'Ship' },
  { key: 'special',    icon: 'Wrench' },
];

export const currentYear = new Date().getFullYear();
export const years = Array.from({ length: 35 }, (_, i) => currentYear - i);

export { getModelsForBrand };