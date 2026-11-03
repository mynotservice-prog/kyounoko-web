"""やよい軒: 公式店舗検索（Mapion系）の全件一覧（20件×ページ、店名・住所）→ 各店舗ページで座標。"""
import re, sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
from _mapion_detail import latlng
HOST = 'https://store.yayoiken.com'
LIST = HOST + '/b/yayoiken/attr/?t=attr_con'
first = get(f'{LIST}&start=1')
total = int(re.search(r'<span class="num">(\d+)</span>件の店舗があります', first).group(1))
stores, seen = [], set()
for p in range(1, math.ceil(total / 20) + 1):
    html = first if p == 1 else get(f'{LIST}&start={p}')
    blocks = html.split('<li class="result-list-item">')[1:]
    new = 0
    for b in blocks:
        m = re.search(r'href="(/b/yayoiken/info/\d+/)"', b)
        if not m or m.group(1) in seen: continue
        seen.add(m.group(1)); new += 1
        raw = re.search(r'<h3 class="result-ttl">([\s\S]*?)</h3>', b).group(1)
        name = clean(raw)
        am = re.search(r'class="result-address">([\s\S]*?)</p>', b)
        url = HOST + m.group(1)
        lat, lng = latlng(url)
        notes = [clean(x) for x in re.findall(r'class="[^"]*(?:tag|notice|status)[^"]*">([\s\S]*?)</', b)]
        stores.append({'name': name, 'address': clean(am.group(1)) if am else '', 'lat': lat, 'lng': lng, 'url': url, 'note': ' / '.join(n for n in notes if n)})
    if not new: break
print('公式の件数表示', total)
assert len(stores) == total, (len(stores), total)
save('yayoiken', stores, {'source': LIST, 'declared': total, 'coord': 'wgs84 (Mapion系店舗検索の店舗ページ)'})
