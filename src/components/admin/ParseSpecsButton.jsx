import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ParseSpecsButton({ form, set }) {
  const [isParsing, setIsParsing] = useState(false);

  const handleParse = async () => {
    if (!form.brand || !form.model || !form.year) {
      toast.error('Заполните марку, модель и год для парсинга');
      return;
    }

    setIsParsing(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Find detailed technical specifications for ${form.brand} ${form.model} ${form.year}.
Search on drom.ru catalog for this car. Find the correct generation based on the year ${form.year}.
Extract the following data. Use the most common/representative trim level.
Return only numbers (no units) and enum values.

Fields needed:
- length_mm, width_mm, height_mm, wheelbase_mm, clearance_mm (all in mm)
- weight_empty_kg, weight_max_kg (in kg)
- seats, doors, trunk_volume (liters)
- engine_volume (liters, e.g. 2.0), engine_volume_cc (cc, e.g. 1995), engine_power (hp), cylinders
- max_speed_kmh, acceleration_0_100 (seconds)
- fuel_consumption_city, fuel_consumption_highway, fuel_consumption_combined (l/100km)
- co2_emissions (g/km), fuel_tank_volume (liters)
- drive_type: one of "fwd", "rwd", "awd"
- transmission: one of "manual", "automatic"
- fuel_type: one of "petrol", "diesel", "electric", "hybrid", "plugin_hybrid", "gas"
- body_type: one of "sedan", "hatchback", "suv", "crossover", "wagon", "coupe", "convertible", "minivan", "pickup"
- transmission_type: string like "AT8", "DSG7" if known, otherwise empty`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            length_mm: { type: 'number' },
            width_mm: { type: 'number' },
            height_mm: { type: 'number' },
            wheelbase_mm: { type: 'number' },
            clearance_mm: { type: 'number' },
            weight_empty_kg: { type: 'number' },
            weight_max_kg: { type: 'number' },
            seats: { type: 'number' },
            doors: { type: 'number' },
            trunk_volume: { type: 'number' },
            engine_volume: { type: 'number' },
            engine_volume_cc: { type: 'number' },
            engine_power: { type: 'number' },
            cylinders: { type: 'number' },
            max_speed_kmh: { type: 'number' },
            acceleration_0_100: { type: 'number' },
            fuel_consumption_city: { type: 'number' },
            fuel_consumption_highway: { type: 'number' },
            fuel_consumption_combined: { type: 'number' },
            co2_emissions: { type: 'number' },
            fuel_tank_volume: { type: 'number' },
            drive_type: { type: 'string' },
            transmission: { type: 'string' },
            fuel_type: { type: 'string' },
            body_type: { type: 'string' },
            transmission_type: { type: 'string' },
          },
        },
      });

      let filledCount = 0;
      Object.keys(res).forEach((key) => {
        const val = res[key];
        if (val === null || val === undefined || val === '') return;
        const currentVal = form[key];
        const isEmpty = currentVal === '' || currentVal === null || currentVal === undefined;
        if (isEmpty) {
          set(key, val);
          filledCount++;
        }
      });

      if (filledCount > 0) {
        toast.success(`Заполнено ${filledCount} полей из drom.ru`);
      } else {
        toast.info('Все поля уже заполнены — данные не перезаписаны');
      }
    } catch (err) {
      toast.error('Ошибка парсинга: ' + (err.message || 'неизвестная'));
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleParse}
      disabled={isParsing}
      className="gap-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
    >
      {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
      {isParsing ? 'Парсинг...' : 'Парсить с drom.ru'}
    </Button>
  );
}