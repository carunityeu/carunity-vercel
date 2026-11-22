import React from 'react';
import { ArrowRight } from 'lucide-react';
const photoBase = 'https://base44.app/api/apps/6973f00466c3a37f3d8e7e53/files/mp/public/6973f00466c3a37f3d8e7e53/';
const photos = {
  car: '75d22f1ab_2a6199b99_caricon.png', motorcycle: '72d265459_2781448fd_motoicon.png',
  bus: '853335803_ccd1f2474_busicon.png', special: 'ec919a1b4_5ee93569b_tracktoricon.png',
  truck: '448498192_fda52f2a7_cargoicon.png', boat: 'e679f4701_f76692d2d_boaticon.png',
  motorhome: 'a2f22b23b_50fc1112c_autohouseicon.png', trailer: '80ce5a485_0c14e1eae_trunkicon.png',
};
const media = 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/';
const types = [
  ['car', '3ed0c0079_sedaniconcu.png'], ['motorcycle', 'f0312e09d_motocycleiconcu.png'],
  ['bus', '25ce6f6a7_busiconcu.png'], ['special', 'a935d278f_traktoriconcu.png'],
  ['truck', '122985056_truckiconcu.png'], ['boat', '3d51d9a96_boaticoncu.png'],
  ['motorhome', 'c42e06342_housetrailericoncu.png'], ['trailer', 'd68253701_trailericoncu.png'],
];

export default function ListingVehicleBar({ value, onChange, t, tiles = false }) {
  return <div className={tiles ? 'lc-vehicles lc-vehicle-tiles' : 'lc-vehicles'} role="group" aria-label={t('listing.cr_vehicle_type')}>
    {types.map(([key, image]) => <button key={key} type="button" disabled={key !== 'car'} aria-label={t('listing.cr_vehicle_' + key)} aria-pressed={value === key} onClick={() => onChange(key)}>
      {tiles && <img className="lc-vehicle-photo" src={photoBase + photos[key]} alt="" />}
      <img className="lc-vehicle-icon" src={media + image} alt="" />
      {tiles && <><span className="lc-vehicle-label">{t('listing.cr_vehicle_' + key)}</span><span className="lc-vehicle-arrow" aria-hidden="true"><ArrowRight /></span></>}
    </button>)}
  </div>;
}