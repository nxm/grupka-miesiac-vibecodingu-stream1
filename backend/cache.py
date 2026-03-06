import json
import hashlib
import time
from pathlib import Path

CACHE_DIR = Path("/tmp/dashboard-cache")
TTL_SECONDS = 24 * 60 * 60  # 24 hours


def _cache_path(key: str) -> Path:
    hashed = hashlib.md5(key.encode()).hexdigest()
    return CACHE_DIR / f"{hashed}.json"


def get(key: str):
    path = _cache_path(key)
    if not path.exists():
        return None
    try:
        data = json.loads(path.read_text())
        if time.time() - data["timestamp"] > TTL_SECONDS:
            path.unlink(missing_ok=True)
            return None
        return data["value"]
    except (json.JSONDecodeError, KeyError):
        path.unlink(missing_ok=True)
        return None


def set(key: str, value):
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    data = {"timestamp": time.time(), "value": value}
    _cache_path(key).write_text(json.dumps(data, ensure_ascii=False))
