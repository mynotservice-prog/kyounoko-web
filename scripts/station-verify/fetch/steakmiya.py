"""ステーキ宮: 公式 /shop/ の一覧（住所と座標 latlang が並ぶ）"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
SRC = 'https://www.miya.com/shop/'
h = get(SRC)
rows = []
for m in re.finditer(r'<td class="name"><a href="(detail\.php\?shop_no=\d+)">([^<]+)</a></td>\s*<td>\s*<div class="address">(.*?)</div>\s*<div class="latlang">([^<]*)</div>', h, re.S):
    ll = [float(x) for x in re.findall(r'[\d.]+', m.group(4))]
    rows.append({'name': clean(m.group(2)), 'address': clean(m.group(3)), 'lat': ll[0] if len(ll) == 2 else None, 'lng': ll[1] if len(ll) == 2 else None, 'url': SRC + m.group(1), 'note': ''})
print('name列', len(re.findall('<td class="name">', h)), '取得', len(rows))
assert len(rows) == len(re.findall('<td class="name">', h))
save('steakmiya', rows, {'coverage': 'all-official', 'coord': 'wgs84', 'source': SRC})
