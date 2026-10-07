import sys,os,re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _navitime import list_all, cats, row, save, PREF
from _geo_common import norm, log
items = list_all('doutor')
rows = [row('doutor', 'doutor', it) for it in items if '01' in dict(cats(it))]
log(f'[doutor] API {len(items)} 件 → ドトールコーヒーショップ {len(rows)}')
save('doutor', 'doutor', rows, {'filter': 'category 01 ドトールコーヒーショップのみ（ドトールキッチン・ドトール珈琲農園・スタンド・パークカフェ等は除外）'})
