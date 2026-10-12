"""
BrandSoul - Qloo API Client
Provides asynchronous and synchronous methods to query Qloo's 250M+ Taste Graph.
Targets https://hackathon.api.qloo.com with API key authentication.
"""

import os
import urllib.parse
from typing import Any, Dict, List, Optional
import httpx
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://hackathon.api.qloo.com"


class QlooClient:
    """Client for interacting with Qloo Cultural AI Hackathon API."""

    def __init__(self, api_key: Optional[str] = None, base_url: str = BASE_URL):
        self.api_key = api_key or os.getenv("QLOO_API_KEY")
        if not self.api_key:
            raise ValueError("QLOO_API_KEY must be provided or set in environment.")
        self.base_url = base_url.rstrip("/")
        self.headers = {
            "X-Api-Key": self.api_key,
            "Accept": "application/json",
            "User-Agent": "BrandSoul-CulturalAI/1.0",
        }
        # In-memory LRU-style cache for fast repeated queries
        self._search_cache: Dict[str, Optional[Dict[str, Any]]] = {}
        self._insights_cache: Dict[str, List[Dict[str, Any]]] = {}

    async def search_entity(
        self, query: str, expected_types: Optional[List[str]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Search for a cultural entity (creator, artist, tv show, book, etc.) by query name.
        Returns canonical entity dictionary containing entity_id, name, and types.
        """
        clean_query = query.strip()
        cache_key = f"{clean_query.lower()}:{expected_types}"
        if cache_key in self._search_cache:
            return self._search_cache[cache_key]

        encoded_query = urllib.parse.quote(clean_query)
        url = f"{self.base_url}/search?query={encoded_query}"

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(url, headers=self.headers)
                if response.status_code != 200:
                    return None
                data = response.json()
                results = data.get("results", [])
                if not results:
                    self._search_cache[cache_key] = None
                    return None

                # Disambiguation: prioritize match by expected_types if provided
                selected = results[0]
                if expected_types:
                    for res in results:
                        res_types = res.get("types", [])
                        if any(t in res_types for t in expected_types):
                            selected = res
                            break

                entity_info = {
                    "entity_id": selected.get("entity_id"),
                    "name": selected.get("name"),
                    "types": selected.get("types", []),
                    "properties": selected.get("properties", {}),
                    "query": clean_query,
                }
                self._search_cache[cache_key] = entity_info
                return entity_info
            except Exception as exc:
                print(f"[QlooClient.search_entity] Error resolving '{clean_query}': {exc}")
                return None

    async def get_brand_insights(
        self,
        entity_ids: List[str],
        age_demographics: Optional[List[str]] = None,
        gender: Optional[str] = None,
        take: int = 12,
    ) -> List[Dict[str, Any]]:
        """
        Query cross-domain brand affinities from Qloo Insights API.
        
        Args:
            entity_ids: List of canonical Qloo entity UUIDs (interests signal).
            age_demographics: Valid Qloo age buckets (e.g. ['25_to_29', '30_to_34']).
            gender: 'male' or 'female' demographic signal.
            take: Number of brand entities to return (1 to 50).
        """
        if not entity_ids:
            return []

        joined_ids = ",".join(entity_ids)
        params: Dict[str, Any] = {
            "filter.type": "urn:entity:brand",
            "signal.interests.entities": joined_ids,
            "take": take,
        }

        if age_demographics:
            params["signal.demographics.age"] = ",".join(age_demographics)

        if gender and gender.lower() in ("male", "female"):
            params["signal.demographics.gender"] = gender.lower()

        cache_key = str(sorted(params.items()))
        if cache_key in self._insights_cache:
            return self._insights_cache[cache_key]

        url = f"{self.base_url}/v2/insights"

        async with httpx.AsyncClient(timeout=20.0) as client:
            try:
                response = await client.get(url, headers=self.headers, params=params)
                if response.status_code != 200:
                    print(
                        f"[QlooClient.get_brand_insights] HTTP {response.status_code}: {response.text}"
                    )
                    return []
                data = response.json()
                entities = data.get("results", {}).get("entities", [])
                self._insights_cache[cache_key] = entities
                return entities
            except Exception as exc:
                print(f"[QlooClient.get_brand_insights] Network error: {exc}")
                return []
