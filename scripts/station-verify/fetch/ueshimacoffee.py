"""上島珈琲店: 公式店舗検索（NAVITIME製）/ufs/api/proxy2/shop/list?category=01。全店。座標は住所の位置と中央値464mずれる（NAVITIME系の日本測地系）"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save, add_pref
SRC = 'https://shop.ufs.co.jp/ufs/spot/list?category=01'
items = []; off = 0
while True:
    d = json.loads(get(f'https://shop.ufs.co.jp/ufs/api/proxy2/shop/list?category=01&limit=100&offset={off}', headers={'Referer': SRC, 'X-Requested-With': 'XMLHttpRequest'}))
    items += d['items']; off += 100
    if len(items) >= d['count']['total'] or not d['items']: break
print('total', d['count']['total'], 'items', len(items))
assert len(items) == d['count']['total']
rows = [{'name': clean(s['name']), 'address': add_pref(clean(s['address_name'])), 'lat': s['coord']['lat'], 'lng': s['coord']['lon'], 'url': f"https://shop.ufs.co.jp/ufs/spot/detail?code={s['code']}", 'note': '' if s.get('status') == 'normal' else f"状態 {s.get('status')}"} for s in items if not re.search(r'台湾|台北|新北', s['address_name'])]   # 台湾の店を除く
save('ueshimacoffee', rows, {'coverage': 'national', 'coord': 'tokyo-datum', 'source': SRC, 'official_total': d['count']['total']})
