"""ケンタッキー: search.kfc.co.jp/api/points/<geohash2桁> で日本全域を走査（全国）。
打ち切りが無いことは、最大セルを3桁の子セル32個に割って取り直した件数と一致するかで確かめる。"""
import sys, os, json, time, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _geo_common import http, norm, write, log, japan_cells, B32

S = 'https://search.kfc.co.jp/'
def cell(h):
    return json.loads(http(S + 'api/points/' + h, headers={'Referer': S}, ns='kfc')).get('items') or []

by = {}; sizes = {}
cells = japan_cells(2)
for h in cells:
    items = cell(h); sizes[h] = len(items)
    for it in items: by[it['id']] = it
big = max(sizes, key=sizes.get)
sub = {}
for c in B32:
    for it in cell(big + c): sub[it['id']] = it
log(f'[kfc] 2桁セル {len(cells)} 個 → {len(by)} 店。最大セル {big}={sizes[big]} 店、3桁に分割して取り直すと {len(sub)} 店')
assert len(sub) == sizes[big], '2桁セルが打ち切られている疑い'
for it in sub.values(): by[it['id']] = it

today = time.strftime('%Y-%m-%d')
rows = []
for it in by.values():
    ef = it.get('extra_fields') or {}
    notes = []
    o = str(ef.get('OPEN日') or '')[:10].replace('/', '-')
    if o and o > today: notes.append('開店予定 ' + o)
    for k in ('CLOSE日', '閉店日'):
        if ef.get(k): notes.append(f'閉店予定 {ef[k]}')
    cm = re.sub(r'<br\s*/?>', '\n', ef.get('コメント') or '')
    for line in cm.split('\n'):
        line = norm(line).lstrip('※')
        if re.search(r'持ち帰り専門|休業|閉店|ビュッフェスタイル', line): notes.append(line[:80])
    if '休業中' in it['name'] and not any('休業' in n for n in notes): notes.append('長期休業中')
    rows.append({'chain': 'kfc', 'name': norm(it['name']), 'address': norm(it.get('address')),
                 'lat': it.get('latitude'), 'lng': it.get('longitude'),
                 'url': f'{S}map/{it["key"]}', 'note': '、'.join(notes)})
write('kfc', rows, 'national', 'wgs84', {'source': S + 'api/points/<geohash2>', 'cells': len(cells)})
