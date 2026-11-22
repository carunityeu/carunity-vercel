import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const FEATURE_KEYS = {
  interior: ['leather_interior','velour_interior','alcantara','heated_seats','ventilated_seats','massage_seats','heated_steering','electric_seats','memory_seats','sport_seats','sunroof','panoramic_roof','glass_roof','climate_control','dual_zone_climate','triple_zone_climate','ac','rear_heated_seats','third_row','wood_trim'],
  multimedia: ['navigation','carplay','bluetooth','usb','aux','wireless_charging','wifi','audio_system','bose','harman_kardon','bang_olufsen','digital_dash','hud','rear_monitor','dvd_tv'],
  safety: ['abs','esp','airbags','lane_assist','auto_emergency_braking','blind_spot','adaptive_cruise','side_airbags','front_airbags','knee_airbags','pedestrian_warning','fatigue_sensor','lane_departure','night_vision','sign_recognition','parking_assist','auto_parking'],
  exterior: ['alloy_wheels','winter_tires','summer_tires','second_tires','front_parktronic','rear_parktronic','rear_camera','camera_360','electric_trunk','tow_bar','roof_rails','side_steps','spoiler','xenon','led','matrix_lights','adaptive_light','headlight_washers','tinting','chrome','heated_mirrors','folding_mirrors'],
  suspension: ['air_suspension','adaptive_suspension','sport_suspension','lowered_suspension','diff_lock','electronic_diff','drive_modes','regenerative_braking'],
  other: ['cruise_control','electric_windows','electric_mirrors','keyless','remote_start','alarm','immobilizer','spare_wheel','space_saver','tow_hook','engine_guard','floor_mats','trunk_mats','window_deflectors'],
};

export default function FeaturesEditor({ value = [], onChange }) {
  const { t } = useTranslation();

  const toggle = (feature) => {
    if (value.includes(feature)) {
      onChange(value.filter(f => f !== feature));
    } else {
      onChange([...value, feature]);
    }
  };

  const sections = [
    { titleKey: 'features.interior', keys: FEATURE_KEYS.interior },
    { titleKey: 'features.multimedia', keys: FEATURE_KEYS.multimedia },
    { titleKey: 'features.safety', keys: FEATURE_KEYS.safety },
    { titleKey: 'features.exterior', keys: FEATURE_KEYS.exterior },
    { titleKey: 'features.suspension', keys: FEATURE_KEYS.suspension },
    { titleKey: 'features.other', keys: FEATURE_KEYS.other },
  ].map(s => ({ ...s, title: t(s.titleKey), items: s.keys.map(k => t('feature_items.' + k, k)) }));

  // Custom features: items in value that are NOT known keys
  const knownKeys = Object.values(FEATURE_KEYS).flat();
  const customFeatures = value.filter(f => !knownKeys.includes(f));

  return (
    <div className="space-y-4">
      <div className="space-y-5">
        {sections.map(section => (
          <div key={section.title}>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">{section.title}</p>
            <div className="flex flex-wrap gap-2">
              {section.items.map((feature, idx) => {
                const key = section.keys[idx];
                const active = value.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggle(key)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-full text-xs sm:text-sm transition-colors",
                      active
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    )}
                  >
                    {feature}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Custom features chips */}
      {customFeatures.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customFeatures.map(f => (
            <button
              key={f}
              type="button"
              onClick={() => toggle(f)}
              className="px-2.5 py-1.5 rounded-full text-xs sm:text-sm bg-emerald-500 text-white flex items-center gap-1"
            >
              {f}
              <span className="text-white/80">×</span>
            </button>
          ))}
        </div>
      )}

      {/* Add custom feature */}
      <div className="flex gap-2">
        <Input
          placeholder={t('listing.add_custom_feature', 'Своё доп. оснащение')}
          id="editCustomFeatureInput"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const val = e.target.value.trim();
              if (val && !value.includes(val)) {
                onChange([...value, val]);
                e.target.value = '';
              }
            }
          }}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const input = document.getElementById('editCustomFeatureInput');
            const val = input?.value?.trim();
            if (val && !value.includes(val)) {
              onChange([...value, val]);
              input.value = '';
            }
          }}
        >
          {t('listing.add', 'Добавить')}
        </Button>
      </div>
    </div>
  );
}