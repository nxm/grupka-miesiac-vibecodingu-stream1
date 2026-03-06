import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getPrices } from '../api';
import type { PriceRecord } from '../api';

const COLORS = [
  '#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c',
  '#0891b2', '#4f46e5', '#be123c',
];

const DEFAULT_CITIES = ['Warszawa', 'Kraków', 'Wrocław', 'Gdańsk', 'Poznań'];

const ALL_CITIES = [
  'Białystok', 'Bydgoszcz', 'Gdańsk', 'Gdynia', 'Katowice',
  'Kielce', 'Kraków', 'Lublin', 'Łódź', 'Olsztyn',
  'Opole', 'Poznań', 'Rzeszów', 'Szczecin', 'Warszawa',
  'Wrocław', 'Zielona Góra',
];

interface ChartDataPoint {
  quarter: string;
  [city: string]: string | number;
}

export default function PriceChart() {
  const { t } = useTranslation();
  const [market, setMarket] = useState<'primary' | 'secondary'>('primary');
  const [type, setType] = useState<'transaction' | 'offer'>('transaction');
  const [selectedCities, setSelectedCities] = useState<string[]>(DEFAULT_CITIES);
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPrices(market, type)
      .then((records) => {
        // Group by quarter, then pivot cities as columns
        const byQuarter = new Map<string, Record<string, number>>();
        records.forEach((r: PriceRecord) => {
          if (!selectedCities.includes(r.city)) return;
          if (!byQuarter.has(r.quarter)) byQuarter.set(r.quarter, {});
          byQuarter.get(r.quarter)![r.city] = r.price;
        });

        const chartData: ChartDataPoint[] = Array.from(byQuarter.entries())
          .map(([quarter, cities]) => ({ quarter, ...cities }))
          .sort((a, b) => a.quarter.localeCompare(b.quarter));

        // Keep last 20 quarters (~5 years)
        setData(chartData.slice(-20));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [market, type, selectedCities]);

  const toggleCity = (city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 border border-slate-100">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h2 className="text-lg font-bold text-slate-800">{t('prices.title')}</h2>
        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => setMarket('primary')}
            className={`px-3 py-1 text-sm rounded-lg ${market === 'primary' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            {t('prices.primary')}
          </button>
          <button
            onClick={() => setMarket('secondary')}
            className={`px-3 py-1 text-sm rounded-lg ${market === 'secondary' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            {t('prices.secondary')}
          </button>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setType('transaction')}
            className={`px-3 py-1 text-sm rounded-lg ${type === 'transaction' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            {t('prices.transactions')}
          </button>
          <button
            onClick={() => setType('offer')}
            className={`px-3 py-1 text-sm rounded-lg ${type === 'offer' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            {t('prices.offers')}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {ALL_CITIES.map((city) => (
          <button
            key={city}
            onClick={() => toggleCity(city)}
            className={`px-2 py-0.5 text-xs rounded-full border ${
              selectedCities.includes(city)
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-80 flex items-center justify-center text-slate-400">{t('loadingShort')}</div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number) => [t('prices.unit', { value: value.toLocaleString('pl-PL') })]}
            />
            <Legend />
            {selectedCities.map((city, i) => (
              <Line
                key={city}
                type="monotone"
                dataKey={city}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
