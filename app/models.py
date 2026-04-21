from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any


@dataclass
class ProductDeal:
    asin: str
    title: str
    image_url: str
    detail_page_url: str
    current_price: float
    currency: str
    average_price: float
    discount_percent: float
    anomaly_score: float
    last_seen: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
