import sys,os,re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _navitime import list_all, cats, row, save, PREF
from _geo_common import norm, log
items = list_all('arcland')
rows = []; abroad = 0
for it in items:
    if '01' not in dict(cats(it)): continue
    if not PREF.match(norm(it.get('address_name'))): abroad += 1; continue
    rows.append(row('katsuya', 'arcland', it))
log(f'[katsuya] API {len(items)} 件 → かつや国内 {len(rows)}（海外 {abroad} 除外）')
save('katsuya', 'arcland', rows, {'filter': 'category 01 かつや・国内住所のみ', 'abroad_excluded': abroad})
