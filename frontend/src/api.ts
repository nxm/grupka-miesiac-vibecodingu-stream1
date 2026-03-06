const BASE = '/api';

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface HousingRecord {
  unitId: string;
  voivodeship: string;
  year: number;
  value: number | null;
}

export interface HousingIndicators {
  avgArea: HousingRecord[];
  per1000: HousingRecord[];
  avgRooms: HousingRecord[];
}

export interface PriceRecord {
  city: string;
  quarter: string;
  price: number;
}

export function getHousingStock(years = '2020,2021,2022,2023') {
  return fetchJson<HousingRecord[]>(`/housing-stock?years=${years}`);
}

export function getHousingIndicators(years = '2023') {
  return fetchJson<HousingIndicators>(`/housing-indicators?years=${years}`);
}

export function getConstruction(years = '2019,2020,2021,2022,2023') {
  return fetchJson<HousingRecord[]>(`/construction?years=${years}`);
}

export function getPrices(market = 'primary', type = 'transaction') {
  return fetchJson<PriceRecord[]>(`/prices?market=${market}&type=${type}`);
}

export function getCityPrices(city: string) {
  return fetchJson<Record<string, PriceRecord[]>>(`/prices/city/${encodeURIComponent(city)}`);
}
