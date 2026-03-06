import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';
import type { HousingRecord } from '../api';

// @ts-expect-error json import
import geoData from '../data/poland-geo.json';

const COLOR_RANGE = [
  '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af',
];

interface PolandMapProps {
  data: HousingRecord[];
  metric: string;
  onSelect: (voivodeship: string | null) => void;
  selected: string | null;
}

export default function PolandMap({ data, metric, onSelect, selected }: PolandMapProps) {
  const { t } = useTranslation();
  const [tooltip, setTooltip] = useState<{ name: string; value: number | null } | null>(null);

  // Get latest year data per voivodeship
  const latestData = useMemo(() => {
    const map = new Map<string, number>();
    // Get the max year
    const maxYear = Math.max(...data.map((d) => d.year));
    data
      .filter((d) => d.year === maxYear && d.value != null)
      .forEach((d) => map.set(d.voivodeship.toLowerCase(), d.value!));
    return map;
  }, [data]);

  const { min, max } = useMemo(() => {
    const values = Array.from(latestData.values());
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [latestData]);

  const getColor = (name: string) => {
    const val = latestData.get(name.toLowerCase());
    if (val == null) return '#f1f5f9';
    const ratio = max > min ? (val - min) / (max - min) : 0.5;
    const idx = Math.min(Math.floor(ratio * COLOR_RANGE.length), COLOR_RANGE.length - 1);
    return COLOR_RANGE[idx];
  };

  const getVoivodeshipName = (geo: any): string => {
    const props = geo.properties;
    return (
      props.nazwa ||
      props.NAME_1 ||
      props.name ||
      props.VARNAME_1 ||
      ''
    ).toLowerCase();
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 border border-slate-100 relative">
      <h2 className="text-lg font-bold text-slate-800 mb-2">{t('map.title', { metric })}</h2>

      {tooltip && (
        <div className="absolute top-12 right-5 bg-slate-800 text-white text-sm rounded-lg px-3 py-2 shadow-lg z-10">
          <p className="font-medium capitalize">{tooltip.name}</p>
          <p>{tooltip.value != null ? tooltip.value.toLocaleString('pl-PL') : t('noData')}</p>
        </div>
      )}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [19.5, 52],
          scale: 2800,
        }}
        width={500}
        height={500}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={geoData}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo) => {
              const name = getVoivodeshipName(geo);
              const isSelected = selected?.toLowerCase() === name;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getColor(name)}
                  stroke={isSelected ? '#1e293b' : '#fff'}
                  strokeWidth={isSelected ? 2 : 0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#fbbf24', cursor: 'pointer' },
                    pressed: { outline: 'none' },
                  }}
                  onMouseEnter={() => {
                    setTooltip({ name, value: latestData.get(name) ?? null });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={() => {
                    onSelect(isSelected ? null : name);
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}
