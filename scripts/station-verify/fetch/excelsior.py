import sys,os,re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _navitime import list_all, cats, row, save, PREF
from _geo_common import norm, log
items = list_all('doutor')
rows = [row('excelsior', 'doutor', it) for it in items if '04' in dict(cats(it))]
log(f'[excelsior] API {len(items)} 件 → エクセルシオール カフェ {len(rows)}')
save('excelsior', 'doutor', rows, {'filter': 'category 04 エクセルシオール カフェ'})
