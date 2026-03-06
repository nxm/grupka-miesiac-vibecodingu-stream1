from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

import gus_client
import nbp_client

app = FastAPI(title="Dashboard Mieszkaniowy Polski")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/housing-stock")
async def housing_stock(years: str = Query("2020,2021,2022,2023")):
    year_list = [int(y.strip()) for y in years.split(",")]
    return await gus_client.get_housing_stock(year_list)


@app.get("/api/housing-indicators")
async def housing_indicators(years: str = Query("2023")):
    year_list = [int(y.strip()) for y in years.split(",")]
    return await gus_client.get_housing_indicators(year_list)


@app.get("/api/construction")
async def construction(years: str = Query("2019,2020,2021,2022,2023")):
    year_list = [int(y.strip()) for y in years.split(",")]
    return await gus_client.get_construction(year_list)


@app.get("/api/prices")
async def prices(
    market: str = Query("primary", pattern="^(primary|secondary)$"),
    type: str = Query("transaction", pattern="^(offer|transaction)$"),
):
    all_prices = await nbp_client.get_prices()
    key = f"{market}_{type}"
    return all_prices.get(key, [])


@app.get("/api/prices/city/{city}")
async def prices_for_city(city: str):
    return await nbp_client.get_prices_for_city(city)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
