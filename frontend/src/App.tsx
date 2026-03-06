import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PolandMap from './components/PolandMap';
import StatsCard from './components/StatsCard';
import PriceChart from './components/PriceChart';
import CityCompare from './components/CityCompare';
import {
  getHousingStock,
  getHousingIndicators,
  getConstruction,
} from './api';
import type { HousingRecord, HousingIndicators } from './api';

type MapMetric = 'stock' | 'per1000' | 'construction' | 'avgArea';

const METRIC_LABELS: Record<MapMetric, string> = {
  stock: 'Liczba mieszkań',
  per1000: 'Mieszkania na 1000 os.',
  construction: 'Nowe budownictwo',
  avgArea: 'Średnia pow. (m²)',
};

export default function App() {
  const [selectedVoivodeship, setSelectedVoivodeship] = useState<string | null>(null);
  const [mapMetric, setMapMetric] = useState<MapMetric>('stock');

  const [housingStock, setHousingStock] = useState<HousingRecord[]>([]);
  const [indicators, setIndicators] = useState<HousingIndicators | null>(null);
  const [construction, setConstruction] = useState<HousingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getHousingStock(),
      getHousingIndicators(),
      getConstruction(),
    ])
      .then(([stock, ind, constr]) => {
        setHousingStock(stock);
        setIndicators(ind);
        setConstruction(constr);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getMapData = (): HousingRecord[] => {
    switch (mapMetric) {
      case 'stock': return housingStock;
      case 'per1000': return indicators?.per1000 ?? [];
      case 'construction': return construction;
      case 'avgArea': return indicators?.avgArea ?? [];
    }
  };

  // Compute summary stats
  const totalStock = housingStock
    .filter((d) => d.year === Math.max(...housingStock.map((h) => h.year)))
    .reduce((sum, d) => sum + (d.value ?? 0), 0);

  const avgArea = indicators?.avgArea
    .filter((d) => d.year === Math.max(...(indicators?.avgArea ?? []).map((h) => h.year)))
    .reduce((sum, d, _, arr) => sum + (d.value ?? 0) / arr.length, 0) ?? 0;

  const totalConstruction = construction
    .filter((d) => d.year === Math.max(...construction.map((h) => h.year)))
    .reduce((sum, d) => sum + (d.value ?? 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-lg">
            Ładowanie danych z GUS i NBP...
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Łączna liczba mieszkań"
                value={totalStock.toLocaleString('pl-PL')}
                subtitle="Wszystkie województwa"
              />
              <StatsCard
                title="Średnia powierzchnia"
                value={`${avgArea.toFixed(1)} m²`}
                subtitle="Średnia krajowa"
              />
              <StatsCard
                title="Nowe mieszkania"
                value={totalConstruction.toLocaleString('pl-PL')}
                subtitle="Oddane w ostatnim roku"
              />
              <StatsCard
                title="Województw"
                value="16"
                subtitle="Źródło: GUS BDL"
              />
            </div>

            {/* Map + Metric Selector */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow p-5 border border-slate-100 mb-4">
                  <h3 className="text-sm font-medium text-slate-500 mb-3">Metryka mapy</h3>
                  <div className="space-y-2">
                    {(Object.keys(METRIC_LABELS) as MapMetric[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => setMapMetric(key)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                          mapMetric === key
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {METRIC_LABELS[key]}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedVoivodeship && (
                  <div className="bg-white rounded-xl shadow p-5 border border-slate-100">
                    <h3 className="text-sm font-medium text-slate-500">Wybrane województwo</h3>
                    <p className="text-lg font-bold text-slate-800 mt-1 capitalize">{selectedVoivodeship}</p>
                    <button
                      onClick={() => setSelectedVoivodeship(null)}
                      className="text-xs text-blue-600 mt-2 hover:underline"
                    >
                      Wyczyść wybór
                    </button>
                  </div>
                )}
              </div>
              <div className="lg:col-span-2">
                <PolandMap
                  data={getMapData()}
                  metric={METRIC_LABELS[mapMetric]}
                  onSelect={setSelectedVoivodeship}
                  selected={selectedVoivodeship}
                />
              </div>
            </div>

            {/* Price Chart */}
            <PriceChart />

            {/* City Compare */}
            <CityCompare />
          </>
        )}
      </main>
    </div>
  );
}
