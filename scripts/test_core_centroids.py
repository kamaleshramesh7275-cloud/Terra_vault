import json
import asyncio
from tngis_client import TNGISClient

async def main():
    with open('data/centroids_z16.json') as f:
        centroids = json.load(f)

    print(f"Total centroids in file: {len(centroids):,}")
    core_points = [c for c in centroids if 10.98 <= c['lat'] <= 11.06 and 76.92 <= c['lon'] <= 77.02]
    print(f"Centroids in Coimbatore urban core: {len(core_points):,}")

    async with TNGISClient(rate_per_second=1.0) as client:
        hits = 0
        for i, pt in enumerate(core_points[:10]):
            lat = pt['lat']
            lon = pt['lon']
            p = await client.land_info(lat, lon)
            if p and p.get('ulpin'):
                hits += 1
                print(f"[{i+1}] HIT! ULPIN: {p.get('ulpin')} | SF: {p.get('survey_number')}/{p.get('sub_division_number')} | Village: {p.get('village_name')} | Area: {p.get('area_sqm')} sqm")
            else:
                print(f"[{i+1}] No parcel at ({lat:.5f}, {lon:.5f})")
        print(f"\nResult: {hits}/10 centroids matched active cadastral parcels")

if __name__ == '__main__':
    asyncio.run(main())
