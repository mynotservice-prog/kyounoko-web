"""サイゼリヤ: 公式店舗検索（NAVITIME系）の一覧API（limit=500でページ送り）。カテゴリ「海外店舗」と国外住所を除く。"""
import re, sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, save, PREFS
SITE = 'https://shop.saizeriya.co.jp/sz_restaurant/'
items, total = [], None
for off in range(0, 10000, 500):
    d = json.loads(get(f'{SITE}api/proxy2/shop/list?limit=500&offset={off}', headers={'Referer': SITE + 'spot/lists', 'Accept': 'application/json'}))
    total = d['count']['total']; items += d['items']
    if len(items) >= total or not d['items']: break
assert len(items) == total, (len(items), total)
sp = lambda x: re.sub(r'[\s　]+', ' ', x or '').strip()
stores, over = [], 0
for s in items:
    cats = [c['name'] for c in s.get('categories', [])]
    if '海外店舗' in cats: over += 1; continue
    c = s.get('coord') or {}
    addr = sp(s.get('address_name'))
    if not any(addr.startswith(p) for p in PREFS):
        code = s.get('address_code') or ''
        if re.search(r'[市区町村郡]', addr) and re.fullmatch(r'\d{5}', code) and 1 <= int(code[:2]) <= 47 and 122 < (c.get('lon') or 0) < 154 and 24 < (c.get('lat') or 0) < 46:
            addr = PREFS[int(code[:2]) - 1] + addr
        else:
            over += 1; print('国内でないとして除外:', s['name'], '|', addr[:40], '|', code); continue
    note = ' / '.join(x for x in cats if x != '営業中')
    stores.append({'name': sp(s['name']), 'address': addr, 'lat': c.get('lat'), 'lng': c.get('lon'), 'url': f"{SITE}spot/detail?code={s['code']}", 'note': note})
print('API総数', total, '海外', over)
save('saizeriya', stores, {'source': SITE + 'api/proxy2/shop/list', 'coord': 'tokyo-datum', 'coord_note': 'NAVITIME系APIの coord をそのまま格納。国土地理院の住所検索と比べ一律に約450m（緯度-0.0032・経度+0.0032前後）ずれており日本測地系とみられる。使う前に世界測地系へ変換が必要', 'overseas_excluded': over})
