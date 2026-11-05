"""カプリチョーザ: 公式 /location/ の店舗URL → 各店舗ページの caption と住所欄。座標なし（地図埋め込みの中心は使わない）"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
SRC = 'https://capricciosa.com/location/'
urls = list(dict.fromkeys(re.findall(r'href="(https://capricciosa\.com/location/[^"]+/)"', get(SRC))))
rows = []
for u in urls:
    p = get(u)
    n = re.search(r'<caption>(.*?)</caption>', p, re.S); a = re.search(r'<th>住所</th>\s*<td>(.*?)</td>', p, re.S)
    if not n: print('店舗ではない', u); continue
    r = re.search(r'<th>備考</th>\s*<td>(.*?)</td>', p, re.S)
    note = clean(r.group(1)) if r and re.search('閉店|休業|オープン|テイクアウト', r.group(1)) else ''
    rows.append({'name': clean(n.group(1)), 'address': clean(a.group(1)) if a else '', 'lat': None, 'lng': None, 'url': u, 'note': note})
save('capricciosa', rows, {'coverage': 'all-official', 'coord': 'none', 'source': SRC})
