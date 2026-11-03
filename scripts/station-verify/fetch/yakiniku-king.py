"""焼肉きんぐ: shop.monogatari.co.jp/api/v1/shops/?brandId[]=yakiniku_king&perPage=1000"""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import get, row, save
d = json.loads(get('https://shop.monogatari.co.jp/api/v1/shops/?brandId[]=yakiniku_king&perPage=1000', 'king_shops.json'))
print('total', d['total'], 'last_page', d['last_page'], 'data', len(d['data']))
assert d['last_page'] == 1 and d['total'] == len(d['data'])
rows = [row('yakiniku-king', s['name'], s['address'], s['latitude'], s['longitude'], f"https://www.yakiniku-king.jp/shop/{s['shop_code']}/", (s.get('note') or '')[:120])
        for s in d['data'] if s['brand_id'] == 1 and not s['not_public_flag']]
save('yakiniku-king', rows)
