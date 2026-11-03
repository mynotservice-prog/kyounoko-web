"""木曽路: 公式店舗検索 navi.kisoji.co.jp/shop/list?shopAreaId=<地域>。セレクトの「地域（N）」の件数と突き合わせる"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
B = 'https://navi.kisoji.co.jp'
top = get(B + '/shop/list?shopAreaId=2301')
areas = re.findall(r'value="(\d+)"[^>]*>\s*([^<（]+)（(\d+)）', top)
assert len(areas) >= 15, areas
rows, seen = [], set()
for aid, an, cnt in areas:
    h = get(f'{B}/shop/list?shopAreaId={aid}')
    it = re.findall(r'<a href="/shop/(K\d+)\?[^"]*"\s*>\s*<h2\s+class="shop_name"\s*>(.*?)</h2\s*>\s*<p class="shop_address"\s*>(.*?)</p', h, re.S)
    assert len(it) == int(cnt), (an, cnt, len(it))
    for c, n, a in it:
        if c in seen: continue
        seen.add(c)
        rows.append({'name': '木曽路 ' + clean(n), 'address': clean(a), 'lat': None, 'lng': None, 'url': f'{B}/shop/{c}'})
total = sum(int(c) for _, _, c in areas)
save('kisoji', rows, {'coord': 'none', 'official_total': total, 'official_total_source': '店舗検索の地域セレクトの件数の合計', 'source': B + '/shop/top', 'fetched': '2026-11-02'})
