import sys,os,re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _navitime import list_all, cats, row, save, PREF
from _geo_common import norm, log
# 検索画面の既定条件 c_d1=0（「- 閉店 -」など店舗ページに出さない店と本社オフィスを除く）で全国を取る
items = list_all('yoshinoya', '&c_d1=0')
rows = []
for it in items:
    c = dict(cats(it))
    if '01' not in c: continue
    note = []
    if '0101004' in c or 'テイクアウト' in it['name']: note.append('テイクアウト・デリバリー専門店')
    if '0103' in c: note.append('はなまるうどん併設')
    if '閉店' in it['name']: note.append('閉店表示あり')
    rows.append(row('yoshinoya', 'yoshinoya', it, '、'.join(note)))
log(f'[yoshinoya] API {len(items)} 件 → 採用 {len(rows)}')
save('yoshinoya', 'yoshinoya', rows, {'filter': 'c_d1=0, category 01'})
