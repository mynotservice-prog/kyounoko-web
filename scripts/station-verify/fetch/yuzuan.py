"""ゆず庵: 物語コーポレーション共通 shop.monogatari.co.jp/api/v1/shops/?brandId[]=shabu_yuzuan。全店・座標つき。"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
SRC = 'https://www.shabu-yuzuan.jp/shop/'
d = json.loads(get('https://shop.monogatari.co.jp/api/v1/shops/?brandId[]=shabu_yuzuan&perPage=1000', headers={'Origin': 'https://www.shabu-yuzuan.jp', 'Referer': SRC, 'Accept': 'application/json'}))
print('total', d['total'], 'data', len(d['data']), 'last_page', d['last_page'])
assert d['total'] == len(d['data'])
rows = [{'name': clean(s['name']), 'address': clean(s['address']), 'lat': s.get('latitude'), 'lng': s.get('longitude'), 'url': f"{SRC}{s['shop_code']}/", 'note': ''}
        for s in d['data'] if not s.get('not_public_flag')]
save('yuzuan', rows, {'coverage': 'national', 'coord': 'wgs84', 'source': SRC, 'official_total': d['total']})
