"""スシロー: 公式店舗検索「サービスから探す」が全店を1ページで返す（店名・住所）。座標なし。"""
import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
BASE = 'https://www.akindo-sushiro.co.jp/shop/'
html = get(BASE + '?mode=service')
declared = int(re.search(r'result-count__num">(\d+)', html).group(1))
stores, seen = [], set()
for m in re.finditer(r'<a href="detail\.php\?id=(\d+)" class="common-shop-list__panel">([\s\S]*?)</a>', html):
    sid, b = m.group(1), m.group(2)
    if sid in seen: continue
    seen.add(sid)
    name = clean(re.search(r'common-shop-list__name">([\s\S]*?)</div>', b).group(1))
    addr = clean(re.search(r'common-shop-list__address">([\s\S]*?)</div>', b).group(1))
    stores.append({'name': name, 'address': addr, 'lat': None, 'lng': None, 'url': f'{BASE}detail.php?id={sid}', 'note': ''})
assert abs(declared - len(stores)) <= 2, (declared, len(stores))
save('sushiro', stores, {'source': BASE + '?mode=service', 'declared': declared, 'coord': 'none'})
