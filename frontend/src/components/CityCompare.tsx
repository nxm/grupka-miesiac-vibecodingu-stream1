import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getPrices } from '../api';
import type { PriceRecord } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const ALL_CITIES = [
  'Białystok', 'Bydgoszcz', 'Gdańsk', 'Gdynia', 'Katowice',
  'Kielce', 'Kraków', 'Lublin', 'Łódź', 'Olsztyn',
  'Opole', 'Poznań', 'Rzeszów', 'Szczecin', 'Warszawa',
  'Wrocław', 'Zielona Góra',
];

const COLORS = [
  '#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c',
  '#0891b2', '#4f46e5', '#be123c',
];

interface CityStats {
  city: string;
  latestPrice: number;
  prevYearPrice: number;
  change: number;
}

export default function CityCompare() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string[]>(['Warszawa', 'Kraków', 'Wrocław', 'Gdańsk']);
  const [stats, setStats] = useState<CityStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPrices('primary', 'transaction')
      .then((records) => {
        const cityStats: CityStats[] = selected.map((city) => {
          const cityRecords = records
            .filter((r: PriceRecord) => r.city === city)
            .sort((a: PriceRecord, b: PriceRecord) => a.quarter.localeCompare(b.quarter));

          const latest = cityRecords[cityRecords.length - 1];
          const prevYear = cityRecords[Math.max(0, cityRecords.length - 5)];

          const latestPrice = latest?.price ?? 0;
          const prevYearPrice = prevYear?.price ?? 0;
          const change = prevYearPrice > 0
            ? ((latestPrice - prevYearPrice) / prevYearPrice) * 100
            : 0;

          return { city, latestPrice, prevYearPrice, change };
        });

        setStats(cityStats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selected]);

  const toggleCity = (city: string) => {
    setSelected((prev) => {
      if (prev.includes(city)) return prev.filter((c) => c !== city);
      if (prev.length >= 4) return prev;
      return [...prev, city];
    });
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 border border-slate-100">
      <h2 className="text-lg font-bold text-slate-800 mb-3">{t('compare.title')}</h2>

      <div className="flex flex-wrap gap-1 mb-4">
        {ALL_CITIES.map((city) => (
          <button
            key={city}
            onClick={() => toggleCity(city)}
            className={`px-2 py-0.5 text-xs rounded-full border ${
              selected.includes(city)
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            {city}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-400 mb-4">{t('compare.selectUpTo')}</p>

      {loading ? (
        <div className="h-60 flex items-center justify-center text-slate-400">{t('loadingShort')}</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats}>
              <XAxis dataKey="city" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => [t('prices.unit', { value: value.toLocaleString('pl-PL') })]} />
              <Bar dataKey="latestPrice" name={t('compare.pricePerSqm')} radius={[6, 6, 0, 0]}>
                {stats.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <table className="w-full mt-4 text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="pb-2">{t('compare.city')}</th>
                <th className="pb-2 text-right">{t('compare.pricePerSqmShort')}</th>
                <th className="pb-2 text-right">{t('compare.yoyChange')}</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.city} className="border-b border-slate-50">
                  <td className="py-2 font-medium">{s.city}</td>
                  <td className="py-2 text-right">{s.latestPrice.toLocaleString('pl-PL')} zł</td>
                  <td className={`py-2 text-right font-medium ${s.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {s.change >= 0 ? '+' : ''}{s.change.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
