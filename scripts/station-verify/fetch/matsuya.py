import sys,os,re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _navitime import list_all, cats, row, save, PREF
from _geo_common import norm, log
items = list_all('matsuyafoods')
rows = []
for it in items:
    c = dict(cats(it))
    if not ({'0101', '0102'} & set(c)): continue
    note = 'テイクアウト専門' if 'テイクアウト専門' in it['name'] else ''
    rows.append(row('matsuya', 'matsuyafoods', it, note))
log(f'[matsuya] API {len(items)} 件 → 松屋・松屋PREMIUM {len(rows)}')
save('matsuya', 'matsuyafoods', rows, {'filter': 'category 0101 松屋 / 0102 松屋PREMIUM。松のや・マイカリー食堂等は別エントリなので含めない'})
