from __future__ import annotations

import json
from pathlib import Path
from typing import Any


class JsonStorage:
    def __init__(self, base_path: str = "data") -> None:
        self.base_dir = Path(base_path)
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self.price_history_path = self.base_dir / "price_history.json"
        self.deals_path = self.base_dir / "deals.json"

    def _read_json(self, path: Path, default: Any) -> Any:
        if not path.exists():
            return default
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return default

    def _write_json(self, path: Path, payload: Any) -> None:
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    def load_price_history(self) -> dict[str, list[float]]:
        return self._read_json(self.price_history_path, {})

    def save_price_history(self, history: dict[str, list[float]]) -> None:
        self._write_json(self.price_history_path, history)

    def load_deals(self) -> list[dict[str, Any]]:
        return self._read_json(self.deals_path, [])

    def save_deals(self, deals: list[dict[str, Any]]) -> None:
        self._write_json(self.deals_path, deals)
