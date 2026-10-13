"""Refresh the reviewed Wikimedia photographs pinned in photo-credits.json.
Run explicitly with Python 3 and network access. No search-based substitutions.
"""
import json
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "MoraVerdurasCatalog/1.0 (attributed photographs)"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()

if __name__ == "__main__":
    credits_path = ROOT / "web/public/photo-credits.json"
    credits = json.loads(credits_path.read_text(encoding="utf-8"))
    params = dict(action="query", titles="|".join(record["title"] for record in credits),
                  prop="imageinfo", iiprop="url", iiurlwidth=800, format="json")
    response = json.loads(fetch("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)))
    pages = {page["title"]: page for page in response["query"]["pages"].values()}
    for record in credits:
        info = pages[record["title"]]["imageinfo"][0]
        content = fetch(info.get("thumburl", info["url"]))
        if not content.startswith(bytes([255, 216])):
            raise ValueError("Expected JPEG for " + record["product"])
        for folder in [ROOT / "assets/photos", ROOT / "web/src/assets/photos"]:
            (folder / (record["product"] + ".jpg")).write_bytes(content)
        print(record["product"], flush=True)
    (ROOT / "assets/photos/CREDITS.json").write_text(credits_path.read_text(encoding="utf-8"), encoding="utf-8")
