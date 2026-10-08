"""丸亀製麺: 公式店舗検索（stores.marugame.com）の都道府県ページ。ページに埋め込まれたディレクトリJSON
（都道府県→市区→店舗）に、店名・住所（区を含む）・座標が全店ぶん入っている。ブランドが丸亀製麺の店だけ採る。"""
import re, sys, os, json, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, save
ROOT = 'https://stores.marugame.com/'
def children(url):
    u = urllib.parse.unquote(get(url))
    i = u.find('"dm_directoryChildren":')
    if i < 0: raise RuntimeError('ディレクトリJSONが無い: ' + url)
    arr, _ = json.JSONDecoder().raw_decode(u[i + len('"dm_directoryChildren":'):])
    return arr
prefs = children(ROOT)
declared = sum(int(p['dm_baseEntityCount']) for p in prefs)
stores, seen = [], set()
def walk(node, depth=0):
    for c in node.get('dm_directoryChildren', []):
        if 'address' in c: yield c
        else: yield from walk(c, depth + 1)
for p in prefs:
    arr = children(ROOT + urllib.parse.quote(p['slug']))
    got = 0
    for s in walk({'dm_directoryChildren': arr}):
        got += 1
        if s['id'] in seen: continue
        seen.add(s['id'])
        brands = [b['displayName'] for b in s.get('c_cp_BrandName', []) if b.get('selected')]
        if brands and '丸亀製麺' not in brands: continue
        a = s['address']
        if a.get('countryCode', 'JP') != 'JP': continue
        line1 = a.get('line1') or ''
        sub = a.get('sublocality') or ''
        addr = (a.get('region') or '') + (a.get('city') or '') + ('' if sub and line1.startswith(sub) else sub) + line1 + ((' ' + a['line2']) if a.get('line2') else '')
        co = s.get('yextDisplayCoordinate') or {}
        info = re.sub(r'\s+', ' ', s.get('c_cp_InformationText') or '')
        note = info if re.search(r'閉店|休業|オープン|改装|移転', info) else ''
        stores.append({'name': s['name'].strip(), 'address': addr, 'lat': co.get('latitude'), 'lng': co.get('longitude'), 'url': ROOT + s['slug'], 'note': note[:300]})
    if got != int(p['dm_baseEntityCount']): print(f"件数差 {p['name']}: 表示{p['dm_baseEntityCount']} 取得{got}")
print('公式の都道府県別件数の合計', declared)
save('marugame', stores, {'source': ROOT, 'declared': declared, 'coord': 'wgs84 (Yext の yextDisplayCoordinate)'})
