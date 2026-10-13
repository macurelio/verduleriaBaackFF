"""Download attributed product photographs from Wikimedia Commons."""
import concurrent.futures, html, json, re, urllib.parse, urllib.request, time
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
QUERIES = {
 'lechuga': 'lettuce vegetable', 'espinaca': 'intitle:Spinach -soup -dish -salad -pasta',
 'acelga': 'swiss chard vegetable', 'rucula': 'intitle:Eruca -salad -coleslaw -flower',
 'papa': 'potatoes vegetable', 'cebolla': 'onions vegetable',
 'zanahoria': 'carrots vegetable', 'betarraga': 'beetroot vegetable',
 'tomate': 'tomatoes fruit', 'palta': 'avocado fruit', 'limon': 'lemons fruit',
 'platano': 'bananas fruit', 'cilantro': 'coriander leaves', 'perejil': 'parsley leaves',
 'albahaca': 'basil leaves', 'ajo': 'garlic bulbs', 'camote': 'sweet potatoes vegetable',
 'arandano': 'blueberries fruit', 'aceituna': 'olives food', 'almendra': 'almonds food',
}
def fetch(url):
 return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'MoraVerdurasCatalog/1.0 (attributed product photos)'}), timeout=30).read()
def plain(value):
 return html.unescape(re.sub('<[^>]+>', '', value))
def download(entry):
 name, query = entry
 params = dict(action='query', generator='search', gsrsearch=f'{query} filetype:bitmap', gsrnamespace=6, gsrlimit=8, prop='imageinfo', iiprop='url|extmetadata', iiurlwidth=800, format='json')
 time.sleep(3)
 for attempt in range(4):
  try:
   data=json.loads(fetch('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params))); break
  except Exception:
   if attempt == 3: raise
   time.sleep(8)
 for page in sorted(data.get('query',{}).get('pages',{}).values(), key=lambda p:p['index']):
  info=page.get('imageinfo',[{}])[0]; meta=info.get('extmetadata',{})
  license=meta.get('LicenseShortName',{}).get('value','')
  if any(word in page['title'].lower() for word in ['soup','salad','coleslaw','pasta','pizza','sauce','dish']): continue
  if not page['title'].lower().endswith(('.jpg','.jpeg')) or not (license.startswith('CC BY') or license in ['CC0','Public domain']): continue
  try: content=fetch(info.get('thumburl',info['url']))
  except Exception: continue
  if not content.startswith(b'\xff\xd8'): continue
  for target in [ROOT/'assets/photos',ROOT/'web/src/assets/photos']:
   (target/(name+'.jpg')).write_bytes(content)
  return dict(product=name, source=info['descriptionurl'], author=plain(meta.get('Artist',{}).get('value','Unknown')), license=license, licenseUrl=meta.get('LicenseUrl',{}).get('value',''), title=page['title'])
 raise RuntimeError('No suitable photograph for '+name)
if __name__ == '__main__':
 records=json.loads((ROOT/'web/public/photo-credits.json').read_text(encoding='utf-8'))
 records=[r for r in records if r['product'] not in ['espinaca','rucula']]
 done={r['product'] for r in records}
 with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
  futures={pool.submit(download,item):item[0] for item in QUERIES.items() if item[0] not in done}
  for future in concurrent.futures.as_completed(futures):
   try:
    record=future.result(); records.append(record); print(record['product']+': '+record['title'],flush=True)
   except Exception as error: print(str(error),flush=True)
 records.sort(key=lambda r:r['product'])
 (ROOT/'web/public/photo-credits.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
 (ROOT/'assets/photos/CREDITS.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
