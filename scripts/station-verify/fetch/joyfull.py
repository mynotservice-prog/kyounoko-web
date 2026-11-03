"""ジョイフル: 公式店舗検索 www.joyfull.co.jp/shop?prefecture=<番号>。各店リンクに data-latitude / data-longitude / data-shop-name / data-shop-address が全店分ある（「もっと見る」の分もHTMLにある）"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, num, save
SRC = 'https://www.joyfull.co.jp/shop'
prefs = sorted({int(x) for x in re.findall(r'shop\?prefecture=(\d+)', get(SRC))})
assert len(prefs) >= 20, prefs
rows, seen, shown = [], set(), 0
for p in prefs:
    h = get(f'{SRC}?prefecture={p}')
    exp = re.search(r'<span class="count">(\d+)</span>件の店舗があります', h)
    items = re.findall(r'<a href="(https://www\.joyfull\.co\.jp/shop/\d+)" class="result-shop-item[^"]*"[^>]*data-latitude="([^"]*)" data-longitude="([^"]*)" data-shop-name="([^"]*)" data-shop-address="([^"]*)"', h)
    assert exp and int(exp.group(1)) == len(items), (p, exp and exp.group(1), len(items))
    shown += len(items)
    for u, la, lo, n, a in items:
        if u in seen: continue
        seen.add(u)
        rows.append({'name': 'ジョイフル ' + clean(n), 'address': clean(a), 'lat': num(la), 'lng': num(lo), 'url': u})
print('都道府県別の件数表示の合計', shown)
save('joyfull', rows, {'coord': 'wgs84（公式 data-latitude/longitude。Google Maps に渡している値）', 'official_total': shown, 'official_total_source': '都道府県別「N件の店舗があります」の合計', 'source': SRC, 'fetched': '2026-11-02'})
