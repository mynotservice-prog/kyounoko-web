"""CoCo壱番屋: tenpo.ichibanya.co.jp/api/point/（全国一括）。業態コード=2 はパスタ・デ・ココなので除く"""
import json, sys, os, re, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import get, row, save
d = json.loads(get('https://tenpo.ichibanya.co.jp/api/point/', 'cocoichi_point.json'))
print('total', d['total'], 'items', len(d['items']))
assert d['total'] == len(d['items'])
rows = []
for s in d['items']:
    e = s['extra_fields']
    if e.get('業態コード') != '1' or not s.get('is_active'): continue
    note = ''
    od = e.get('オープン日')
    if od:
        try:
            y, m, dd = [int(x) for x in re.split(r'[/-]', od)[:3]]
            if datetime.date(y, m, dd) > datetime.date.today(): note = f'開店予定 {od}'
        except ValueError: note = f'オープン日 {od}'
    rows.append(row('cocoichi', s['name'], s['address'], s['latitude'], s['longitude'], f"https://tenpo.ichibanya.co.jp/map/{s['key']}", note))
save('cocoichi', rows)
