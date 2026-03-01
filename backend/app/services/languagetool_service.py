"""
LanguageTool public API - free, no API key required.
https://api.languagetool.org/v2/check
Rate limit: 20 req/min per IP, 20KB per request.
"""
import httpx

LANGUAGETOOL_URL = "https://api.languagetool.org/v2/check"


async def check_grammar(text: str, lang: str = "en-US") -> list[dict]:
    """Return list of grammar/spelling issues. Empty list on error or if text too long."""
    if not text or len(text.strip()) == 0:
        return []
    text = text[:20_000]
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.post(
                LANGUAGETOOL_URL,
                data={"text": text, "language": lang},
            )
            r.raise_for_status()
            data = r.json()
            return [
                {
                    "message": m.get("message", ""),
                    "short_message": m.get("shortMessage", ""),
                    "offset": m.get("offset", 0),
                    "length": m.get("length", 0),
                    "context": m.get("context", {}).get("text", ""),
                    "replacements": [x.get("value") for x in m.get("replacements", [])[:3]],
                }
                for m in data.get("matches", [])
            ]
    except Exception:
        return []
