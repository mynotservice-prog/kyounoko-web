"""サブウェイ: 公式店舗検索ページに全店カード（data-name・data-address）。座標なし。"""
import re, sys, os, html as H
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
SRC = 'https://subway.co.jp/shop/search/'
html = get(SRC)
stores, seen = [], set()
for m in re.finditer(r'<li class="item card" data-href="([^"]+)" data-id="(\d+)" data-name="([^"]*)"[^>]*data-address="([^"]*)"', html):
    href, sid, name, addr = m.groups()
    if sid in seen: continue
    seen.add(sid)
    seg = html[m.end():m.end() + 900]
    b = re.search(r'<span class="badge[^"]*">([^<]*)</span>', seg.split('<li class="item card"')[0])
    # 「営業終了」「営業中」は取得時刻の営業状況なので note にしない
    note = b.group(1).strip() if b and b.group(1).strip() not in ('営業終了', '営業中', '') else ''
    stores.append({'name': clean(H.unescape(name)), 'address': clean(H.unescape(addr)), 'lat': None, 'lng': None, 'url': 'https://subway.co.jp' + href, 'note': note})
save('subway', stores, {'source': SRC, 'coord': 'none'})
