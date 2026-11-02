"""ウエスト: 公式店舗検索 www.shop-west.jp/store/list.php?page=N（10件ずつ）。うどんウエスト・生そばウエスト・生そばあずま・焼肉等が同じ一覧にある。麺の「ウエスト」看板だけ残す"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, add_pref, save
B = 'https://www.shop-west.jp/store/'
h = get(B + 'list.php')
pages = max(int(x) for x in re.findall(r'page=(\d+)', h))
rows, seen = [], set()
for p in range(1, pages + 1):
    h = get(f'{B}list.php?&page={p}')
    items = re.findall(r'<a href="(\d+\.html)">\s*<p class="stit01">(.*?)</p>(.*?)TEL ／ 住所</th><td>(.*?)</td>', h, re.S)
    for u, n, mid, c in items:
        if u in seen: continue
        seen.add(u)
        a = clean(c.split('／')[-1])
        rows.append({'name': clean(n), 'address': add_pref(a) if not a.startswith('大野城市') else '福岡県' + a, 'lat': None, 'lng': None, 'url': B + u, 'note': ''})
print('ページ', pages, '店', len(rows))
import collections
print(collections.Counter(r['name'].split(' ')[0] for r in rows))
counts = collections.Counter(r['name'].split(' ')[0] for r in rows)
KEEP = ('うどんウエスト', '博多うどんウエスト', '生そばウエスト')  # 同じ「ウエスト」の麺の店。焼肉・生そばあずま・中華は別の看板なので入れない
keep = [r for r in rows if r['name'].split(' ')[0] in KEEP]
sm = set(re.findall(r'/store/(\d+)\.html', get('https://www.shop-west.jp/sitemap.xml')))
print('サイトマップ', len(sm), '一覧にない', sorted(sm - {r['url'].split('/')[-1][:-5] for r in rows})[:20])
save('west-udon', keep, {'coord': 'none', 'list_total_all_brands': len(rows), 'brands_all': dict(counts), 'kept_brands': KEEP, 'sitemap_store_urls': len(sm), 'source': B, 'fetched': '2026-11-02'})
