"""珈琲館: C-United 公式 /store/request_search/（brand=4）。全店・座標つき。営業終了日が過ぎた店は除き、開始日が先の店は note に残す"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import datetime
from _lib import get, clean, save
SRC = 'https://c-united.co.jp/search/khk/'
d = json.loads(get('https://c-united.co.jp/store/request_search/?bounds=20,50,120,155', headers={'Referer': SRC}))
today = datetime.date.today().isoformat()
ymd = lambda y, m, dd: f'{y}-{int(m or 1):02d}-{int(dd or 1):02d}' if y else None
rows = []; closed = 0
for s in d:
    if s['brand'] != 4: continue
    e = ymd(s.get('open_end_year'), s.get('open_end_month'), s.get('open_end_day')); st = ymd(s.get('open_start_year'), s.get('open_start_month'), s.get('open_start_day'))
    if e and e < today: closed += 1; continue
    note = f'開店予定 {st}' if st and st > today else ''
    rows.append({'name': clean(s['name']), 'address': clean(f"{s.get('pref') or ''}{s.get('address') or ''} {s.get('address2') or ''}"), 'lat': float(s['latitude']) if s.get('latitude') else None, 'lng': float(s['longitude']) if s.get('longitude') else None, 'url': f"https://c-united.co.jp/store/detail/{s['code']}/", 'note': note})
print('brand', len(rows), '終了除外', closed)
save('coffeekan', rows, {'coverage': 'national', 'coord': 'wgs84', 'source': SRC})
