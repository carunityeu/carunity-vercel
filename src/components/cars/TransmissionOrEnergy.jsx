import React from 'react';
import ElectricConsumptionChip from '@/components/cars/ElectricConsumptionChip';
import { isElectricFuel } from '@/lib/fuelBadge';

/** True when the listing runs on electricity and its consumption value is known. */
export function hasEnergyValue(car) {
  return isElectricFuel(car?.fuel_type) && car?.energy_consumption != null && car?.energy_consumption !== '';
}

/**
 * Electric cars have no gears worth showing, so their transmission chip is replaced
 * by the kWh/100 km consumption chip. Falls back to the given chip when no value is set.
 */
export default function TransmissionOrEnergy({ car, size = 'sm', radius = null, children = null }) {
  if (hasEnergyValue(car)) {
    return <ElectricConsumptionChip fuelType={car.fuel_type} value={car.energy_consumption} size={size} radius={radius} />;
  }
  return children;
}