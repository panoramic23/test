from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any



@dataclass
class AmazonConfig:
    use_mock: bool = os.getenv("AMAZON_USE_MOCK", "true").lower() == "true"
    host: str = os.getenv("AMAZON_HOST", "webservices.amazon.it")
    marketplace: str = os.getenv("AMAZON_MARKETPLACE", "www.amazon.it")
    associate_tag: str = os.getenv("AMAZON_ASSOCIATE_TAG", "")


class AmazonProductClient:
    """
    Integrazione base con Amazon Product Advertising API.

    Nota: la firma AWS V4 e i dettagli completi della PA-API variano per account.
    Questa implementazione offre:
    - modalità mock per sviluppo immediato;
    - struttura pronta per integrare una chiamata reale firmata.
    """

    def __init__(self, config: AmazonConfig | None = None) -> None:
        self.config = config or AmazonConfig()

    async def search_candidate_products(self) -> list[dict[str, Any]]:
        if self.config.use_mock:
            return self._mock_products()
        return await self._search_via_paapi_placeholder()

    async def _search_via_paapi_placeholder(self) -> list[dict[str, Any]]:
        """
        Placeholder: sostituisci con chiamata firmata PA-API (`SearchItems`/`GetItems`).
        Restituisce lo stesso formato della modalità mock.
        """
        # Endpoint dimostrativo: se non configurato correttamente torna vuoto.
        url = f"https://{self.config.host}/paapi5/searchitems"
        payload = {
            "Marketplace": self.config.marketplace,
            "PartnerTag": self.config.associate_tag,
            "Keywords": "offerte",
            "SearchIndex": "All",
            "ItemCount": 10,
            "Resources": [
                "Images.Primary.Medium",
                "ItemInfo.Title",
                "Offers.Listings.Price",
            ],
        }

        try:
            import httpx

            async with httpx.AsyncClient(timeout=10.0) as client:
                # Richiede firma AWS; senza firma questa chiamata normalmente fallisce.
                response = await client.post(url, json=payload)
                response.raise_for_status()
                data = response.json()
                return self._normalize_paapi_response(data)
        except Exception:
            return []

    def _normalize_paapi_response(self, data: dict[str, Any]) -> list[dict[str, Any]]:
        items = data.get("SearchResult", {}).get("Items", [])
        normalized: list[dict[str, Any]] = []
        for item in items:
            price_payload = (
                item.get("Offers", {})
                .get("Listings", [{}])[0]
                .get("Price", {})
            )
            normalized.append(
                {
                    "asin": item.get("ASIN", ""),
                    "title": item.get("ItemInfo", {}).get("Title", {}).get("DisplayValue", "Prodotto Amazon"),
                    "image_url": item.get("Images", {}).get("Primary", {}).get("Medium", {}).get("URL", ""),
                    "detail_page_url": item.get("DetailPageURL", ""),
                    "current_price": float(price_payload.get("Amount", 0.0)),
                    "currency": price_payload.get("Currency", "EUR"),
                }
            )
        return normalized

    def _mock_products(self) -> list[dict[str, Any]]:
        tag = self.config.associate_tag or "luckthesystem-21"
        return [
            {
                "asin": "B0AAA11111",
                "title": "SSD NVMe 1TB Gen4",
                "image_url": "https://m.media-amazon.com/images/I/61hP0L4JCLL._AC_SL1500_.jpg",
                "detail_page_url": f"https://www.amazon.it/dp/B0AAA11111?tag={tag}",
                "current_price": 49.90,
                "currency": "EUR",
            },
            {
                "asin": "B0BBB22222",
                "title": "Cuffie Bluetooth ANC",
                "image_url": "https://m.media-amazon.com/images/I/61u48FEsz-L._AC_SL1500_.jpg",
                "detail_page_url": f"https://www.amazon.it/dp/B0BBB22222?tag={tag}",
                "current_price": 39.99,
                "currency": "EUR",
            },
            {
                "asin": "B0CCC33333",
                "title": "Robot aspirapolvere smart",
                "image_url": "https://m.media-amazon.com/images/I/71nP7QW3gLL._AC_SL1500_.jpg",
                "detail_page_url": f"https://www.amazon.it/dp/B0CCC33333?tag={tag}",
                "current_price": 149.00,
                "currency": "EUR",
            },
        ]
