from __future__ import annotations

import asyncio
import os
from datetime import datetime, timezone
from statistics import mean

from app.amazon_client import AmazonProductClient
from app.models import ProductDeal
from app.storage import JsonStorage


class DealHunterAgent:
    def __init__(self, storage: JsonStorage, amazon_client: AmazonProductClient) -> None:
        self.storage = storage
        self.amazon_client = amazon_client
        self.scan_interval_seconds = int(os.getenv("SCAN_INTERVAL_SECONDS", "1800"))
        self.min_discount_percent = float(os.getenv("MIN_DISCOUNT_PERCENT", "35"))
        self._task: asyncio.Task | None = None

    async def start(self) -> None:
        if self._task and not self._task.done():
            return
        self._task = asyncio.create_task(self._run_loop())

    async def stop(self) -> None:
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

    async def scan_once(self) -> list[ProductDeal]:
        history = self.storage.load_price_history()
        products = await self.amazon_client.search_candidate_products()

        deals: list[ProductDeal] = []
        for product in products:
            asin = product["asin"]
            current_price = float(product["current_price"])
            asin_history = history.get(asin, [])

            if asin_history:
                average_price = mean(asin_history)
            else:
                average_price = current_price

            discount_percent = self._discount_percent(current_price, average_price)
            anomaly_score = self._anomaly_score(current_price, average_price)

            asin_history = (asin_history + [current_price])[-30:]
            history[asin] = asin_history

            if discount_percent >= self.min_discount_percent:
                deals.append(
                    ProductDeal(
                        asin=asin,
                        title=product["title"],
                        image_url=product["image_url"],
                        detail_page_url=product["detail_page_url"],
                        current_price=current_price,
                        currency=product["currency"],
                        average_price=round(average_price, 2),
                        discount_percent=round(discount_percent, 2),
                        anomaly_score=round(anomaly_score, 3),
                        last_seen=datetime.now(timezone.utc).isoformat(),
                    )
                )

        self.storage.save_price_history(history)
        self.storage.save_deals([deal.to_dict() for deal in deals])
        return deals

    async def _run_loop(self) -> None:
        while True:
            try:
                await self.scan_once()
            except Exception:
                # continua anche se una scansione fallisce
                pass
            await asyncio.sleep(self.scan_interval_seconds)

    @staticmethod
    def _discount_percent(current_price: float, average_price: float) -> float:
        if average_price <= 0:
            return 0.0
        return max(0.0, (average_price - current_price) / average_price * 100)

    @staticmethod
    def _anomaly_score(current_price: float, average_price: float) -> float:
        if average_price <= 0:
            return 0.0
        ratio = current_price / average_price
        # score alto quando il prezzo corrente è molto sotto la media
        return max(0.0, 1.0 - ratio)
