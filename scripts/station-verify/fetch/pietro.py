"""ピエトロ: 公式 /restaurant/all/ の店舗カード（総数表示あり）。閉店表示の店は除く。座標なし"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
SRC = 'https://www.pietro.co.jp/restaurant/all/'
h = get(SRC)
n = int(re.search(r'<span class="number">(\d+)</span>', h).group(1))
cards = re.findall(r'<li>\s*<a href="(/restaurant/detail/\d+)">(.*?)</a>\s*</li>', h, re.S)
assert len(cards) == n, (len(cards), n)
rows = []
for path, b in cards:
    name = clean(re.search(r'<h3>(.*?)</h3>', b, re.S).group(1))
    if '閉店' in name: continue
    a = clean(re.sub(r'〒[\d-]+\s*(<br\s*/?>)?', '', re.search(r'</h3>\s*<p>(.*?)</p>', b, re.S).group(1)))
    rows.append({'name': name, 'address': a, 'lat': None, 'lng': None, 'url': 'https://www.pietro.co.jp' + path, 'note': ''})
print('公式', n, '取得', len(rows))
save('pietro', rows, {'coverage': 'all-official', 'coord': 'none', 'source': SRC, 'official_total': n})
