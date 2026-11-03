"""ポポラマーマ: 公式 /restaurant/index.php の都道府県別ページ /info/category/restaurant<番号> の表。住所に都道府県が無いので見出しの県を付ける。座標なし"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
top = get('https://www.popolamama.com/restaurant/index.php')
cs = sorted(set(re.findall(r'category/restaurant(\d+)', top)))
rows = {}
for c in cs:
    h = get(f'https://www.popolamama.com/info/category/restaurant{c}')
    for sec in re.split(r'(?=<h3 class="title_red)', h)[1:]:
        p = clean(re.search(r'<h3[^>]*>(.*?)</h3>', sec, re.S).group(1))
        for r in re.findall(r'<tr>(.*?)</tr>', sec, re.S):
            tds = re.findall(r'<td[^>]*>(.*?)</td>', r, re.S)
            a = re.search(r'href="([^"]+)"', tds[0]) if tds else None
            if not a: continue
            ad = clean(tds[1]); note = clean(tds[3]) if len(tds) > 3 and re.search('閉店|休業|オープン|テイクアウト', tds[3]) else ''
            rows[a.group(1)] = {'name': clean(tds[0]), 'address': ad if ad.startswith(p) else p + ad, 'lat': None, 'lng': None, 'url': a.group(1), 'note': note}
print('県ページ', cs)
save('popolamama', list(rows.values()), {'coverage': 'all-official', 'coord': 'none', 'source': 'https://www.popolamama.com/restaurant/index.php'})
