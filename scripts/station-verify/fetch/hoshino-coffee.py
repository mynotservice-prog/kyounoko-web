"""星乃珈琲店: 公式の店舗一覧（全店1ページの表）。個別ページは無く、ページ内アンカーのみ。座標なし。"""
import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save, PREFS
SRC = 'https://www.hoshinocoffee.com/shop.html'
html = re.sub(r'<!--[\s\S]*?-->', '', get(SRC))
stores = []
for row in re.split(r'<tr[^>]*>', html):
    m = re.search(r'class="shop_name">([\s\S]*?)</div>', row)
    if not m: continue
    tds = re.findall(r'<td[^>]*>([\s\S]*?)</td>', row)
    if not tds: continue
    a = re.search(r'<a name="([^"]+)"', row)
    name_raw = m.group(1)
    note = ' '.join(clean(x) for x in re.findall(r'<span[^>]*>([\s\S]*?)</span>', name_raw))
    name = clean(re.sub(r'<span[\s\S]*?</span>', '', name_raw))
    addr = clean(tds[0])
    stores.append({'name': name, 'address': addr, 'lat': None, 'lng': None, 'url': f'{SRC}#{a.group(1)}' if a else None, 'note': note, '_hours': clean(tds[1]) if len(tds) > 1 else ''})
dom = [s for s in stores if any(s['address'].startswith(p) for p in PREFS)]
print('国内以外として除外:', [(s['name'], s['address']) for s in stores if s not in dom])
save('hoshino-coffee', dom, {'source': SRC, 'coord': 'none', 'url': '個別ページは無い。一覧ページ内アンカー'})
