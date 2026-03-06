import httpx
import cache

BASE_URL = "https://bdl.stat.gov.pl/api/v1"

# Variable IDs from GUS BDL
VAR_HOUSING_STOCK = "60811"        # Zasoby mieszkaniowe (liczba mieszkań)
VAR_AVG_AREA = "60572"             # Średnia powierzchnia mieszkania
VAR_PER_1000 = "410600"            # Mieszkania na 1000 ludności
VAR_AVG_ROOMS = "475703"           # Średnia liczba izb w mieszkaniu
VAR_CONSTRUCTION = "748601"        # Mieszkania oddane do użytkowania

VOIVODESHIP_NAMES = {
    "0200000000": "dolnośląskie",
    "0400000000": "kujawsko-pomorskie",
    "0600000000": "lubelskie",
    "0800000000": "lubuskie",
    "1000000000": "łódzkie",
    "1200000000": "małopolskie",
    "1400000000": "mazowieckie",
    "1600000000": "opolskie",
    "1800000000": "podkarpackie",
    "2000000000": "podlaskie",
    "2200000000": "pomorskie",
    "2400000000": "śląskie",
    "2600000000": "świętokrzyskie",
    "2800000000": "warmińsko-mazurskie",
    "3000000000": "wielkopolskie",
    "3200000000": "zachodniopomorskie",
}


async def _fetch_variable(var_id: str, years: list[int]) -> dict:
    cache_key = f"gus_{var_id}_{'_'.join(map(str, years))}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    params = {
        "format": "json",
        "unit-level": "2",
        "page-size": "20",
    }
    for y in years:
        params.setdefault("year", [])
        if isinstance(params["year"], list):
            params["year"].append(str(y))
        else:
            params["year"] = [params["year"], str(y)]

    # httpx handles list params correctly
    url = f"{BASE_URL}/data/by-variable/{var_id}"

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    # Transform to a cleaner format
    results = []
    for item in data.get("results", []):
        unit_id = item.get("id", "")
        name = item.get("name", "")
        # GUS returns uppercase names, normalize to lowercase
        voivodeship = name.lower()
        for val in item.get("values", []):
            results.append({
                "unitId": unit_id,
                "voivodeship": voivodeship,
                "year": int(val.get("year", 0)),
                "value": val.get("val"),
            })

    cache.set(cache_key, results)
    return results


async def get_housing_stock(years: list[int]) -> list[dict]:
    """Zasoby mieszkaniowe wg województw."""
    return await _fetch_variable(VAR_HOUSING_STOCK, years)


async def get_housing_indicators(years: list[int]) -> dict:
    """Wskaźniki mieszkaniowe: avg m², mieszkania/1000 os., avg izby."""
    avg_area = await _fetch_variable(VAR_AVG_AREA, years)
    per_1000 = await _fetch_variable(VAR_PER_1000, years)
    avg_rooms = await _fetch_variable(VAR_AVG_ROOMS, years)
    return {
        "avgArea": avg_area,
        "per1000": per_1000,
        "avgRooms": avg_rooms,
    }


async def get_construction(years: list[int]) -> list[dict]:
    """Mieszkania oddane do użytkowania wg województw."""
    return await _fetch_variable(VAR_CONSTRUCTION, years)
