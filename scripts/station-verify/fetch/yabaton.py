"""矢場とん: 公式 www.yabaton.com/stores（全店）。各店ページの住所。お持ち帰り専門は note に残す"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
SRC = 'https://www.yabaton.com/stores'
h = get(SRC)
items = re.findall(r'<a href="(https://www\.yabaton\.com/stores/[\w-]+)">\s*<p>\s*<span class="p-store-list_store-name">(.*?)</span>\s*<span class="p-store-list_store-meta">\s*<span class="p-store-list_store-type[^"]*">(.*?)</span>', h, re.S)
print(len(items), len(re.findall('p-store-list_store-name', h)))
rows, seen = [], set()
for u, n, ty in items:
    if u in seen: continue
    seen.add(u)
    d = get(u)
    a = clean(re.search(r'p-store-view_top-info-tel.*?</p>\s*<p>(.*?)</p>', d, re.S).group(1))
    rows.append({'name': '矢場とん ' + clean(n), 'address': a, 'lat': None, 'lng': None, 'url': u, 'note': 'テイクアウト専門' if 'お持ち帰り' in ty else ''})
save('yabaton', rows, {'coord': 'none', 'source': SRC, 'fetched': '2026-11-02'})
