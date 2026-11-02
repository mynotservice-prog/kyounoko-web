"""ぎょうざの満洲: 公式 /shop/shop.json（店舗一覧画面のデータ）。ギャラリー・貸教室・工場直売は飲食店ではないので除く。座標は公式の gps_lat/gps_lon"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
SRC = 'https://www.mansyu.co.jp/shop/'
d = json.loads(get(SRC + 'shop.json', headers={'Referer': SRC}))
rows = []; ex = []
def fl(v):
    m = re.search(r'[\d.]+', v or '')   # 「36.33, 」のように区切りが残る行がある
    return float(m.group()) if m else None
for s in d:
    if re.search('ギャラリー|貸教室|工場直売', s['name']): ex.append(s['name']); continue
    a = clean(' '.join(x for x in (s.get('state', '') + s.get('city', '') + s.get('address1', ''), s.get('address2', '')) if x))
    rows.append({'name': clean(s['name']), 'address': a, 'lat': fl(s.get('gps_lat')), 'lng': fl(s.get('gps_lon')), 'url': SRC + '#' + s['anchor'], 'note': ''})
print('json', len(d), '除外', ex)
save('gyoza-no-mansyu', rows, {'coverage': 'all-official', 'coord': 'wgs84', 'source': SRC})
