import sys,os,re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _navitime import list_all, cats, row, save, PREF
from _geo_common import norm, log
items = list_all('hanamaru')
rows = []
for it in items:
    c = dict(cats(it))
    if not ({'01', '02'} & set(c)): continue
    rows.append(row('hanamaru-udon', 'hanamaru', it, '吉野家併設' if '02' in c else ''))
log(f'[hanamaru-udon] API {len(items)} 件 → {len(rows)}')
save('hanamaru-udon', 'hanamaru', rows, {'filter': 'category 01 はなまるうどん / 02 はなまるうどん×吉野家'})
