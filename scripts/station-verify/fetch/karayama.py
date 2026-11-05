"""からやま: アークランドサービス公式店舗検索（NAVITIME製）。カテゴリでからやまを絞り、国内住所のみ。座標は NAVITIME 系なので unreliable"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _navitime import list_all, cats, row, save, PREF
from _geo_common import norm, log
items = list_all('arcland')
print(sorted({c for it in items for c in cats(it)}, key=str)[:12])
code = next(c for c, n in {c for it in items for c in cats(it)} if n and 'からやま' in n)
rows = []; abroad = 0
for it in items:
    if code not in dict(cats(it)): continue
    if not PREF.match(norm(it.get('address_name'))): abroad += 1; continue
    rows.append(row('karayama', 'arcland', it))
log(f'[karayama] API {len(items)} 件 → からやま国内 {len(rows)}（海外 {abroad} 除外）')
save('karayama', 'arcland', rows, {'filter': f'category {code} からやま・国内住所のみ', 'abroad_excluded': abroad})
