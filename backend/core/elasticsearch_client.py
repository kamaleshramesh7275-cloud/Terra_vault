"""Terra_vault — Elasticsearch client for full-text record search"""
from elasticsearch import AsyncElasticsearch
from core.config import settings


class ESClient:
    INDEX = "terra_vault_records"

    def __init__(self):
        self._es = AsyncElasticsearch([settings.ELASTICSEARCH_URL])

    async def ensure_indices(self):
        try:
            import asyncio
            exists = await asyncio.wait_for(self._es.indices.exists(index=self.INDEX), timeout=1.0)
            if not exists:
                await self._es.indices.create(index=self.INDEX, body={
                    "mappings": {
                        "properties": {
                            "id": {"type": "keyword"},
                            "owner_name": {"type": "text", "analyzer": "standard"},
                            "khasra_no": {"type": "keyword"},
                            "village": {"type": "text"},
                            "district": {"type": "keyword"},
                            "state": {"type": "keyword"},
                            "status": {"type": "keyword"},
                            "overall_confidence": {"type": "float"},
                            "detected_script": {"type": "keyword"},
                            "created_at": {"type": "date"},
                        }
                    }
                })
        except Exception as e:
            print(f"[INFO] Elasticsearch index check skipped (offline or timeout): {e}")

    async def index_record(self, record: dict):
        try:
            await self._es.index(index=self.INDEX, id=record["id"], document=record)
        except Exception as e:
            # Silently catch and log warning if Elasticsearch is offline
            print(f"[WARN] Elasticsearch indexing failed (offline): {e}")

    async def search(self, query: str, filters: dict = None, page: int = 1, size: int = 20) -> dict:
        try:
            must = [{"multi_match": {"query": query, "fields": ["owner_name", "khasra_no", "village", "district"]}}]
            if filters:
                for k, v in filters.items():
                    must.append({"term": {k: v}})
            body = {"query": {"bool": {"must": must}}, "from": (page - 1) * size, "size": size}
            result = await self._es.search(index=self.INDEX, body=body)
            return result
        except Exception as e:
            print(f"[WARN] Elasticsearch search failed (offline): {e}")
            return {"hits": {"total": {"value": 0}, "hits": []}}

    async def close(self):
        await self._es.close()


es_client = ESClient()
