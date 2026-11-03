"""ミスタードーナツ: 公式「ショップを探す」（Mapion系）の全件一覧（20件×ページ）。住所・座標・タグ（テイクアウト専門店など）が一覧に入る。"""
import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save, add_pref
HOST = 'https://md.mapion.co.jp'
LIST = HOST + '/b/misterdonut/attr/?t=attr_con'
first = get(f'{LIST}&start=1')
total = int(re.search(r'(\d+)件のショップがあります', first).group(1))
pages = int(re.search(r'\d+/(\d+)</li>', first).group(1))
stores, seen = [], set()
for p in range(1, pages + 1):
    html = first if p == 1 else get(f'{LIST}&start={p}')
    for b in html.split('<li class="list-item">')[1:]:
        if not re.match(r'\s*<div class="list-content">', b): continue
        m = re.search(r'href="(/b/misterdonut/info/\d+/)">\s*<h2 class="list-content-name">([\s\S]*?)</h2>', b)
        if not m or m.group(1) in seen: continue
        seen.add(m.group(1))
        raw = m.group(2)
        notes = [clean(x) for x in re.findall(r'<span[^>]*>([\s\S]*?)</span>', raw)]
        name = clean(re.sub(r'<span[\s\S]*?</span>', '', raw))
        notes += [clean(x) for x in re.findall(r'<li class="tag">([\s\S]*?)</li>', b)]
        ll = re.search(r'data-lat="([\d.]+)" data-lng="([\d.]+)"', b)
        am = re.search(r'class="list-content-text">([\s\S]*?)</div>', b)
        stores.append({'name': name, 'address': add_pref(clean(am.group(1))) if am else '', 'lat': float(ll.group(1)) if ll else None, 'lng': float(ll.group(2)) if ll else None, 'url': HOST + m.group(1), 'note': ' / '.join(n for n in notes if n)})
assert len(stores) == total, (len(stores), total)
save('mister-donut', stores, {'source': LIST, 'declared': total, 'coord': 'wgs84 (Mapion系店舗検索の一覧 data-lat/data-lng)'})
