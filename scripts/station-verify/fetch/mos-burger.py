"""モスバーガー: www.mos.jp/data/shop/shop.json（全店・座標つき）"""
import json, sys, os, datetime, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import get, row, save
d = json.loads(get('https://www.mos.jp/data/shop/shop.json', 'mos_shop.json', {'Referer': 'https://www.mos.jp/shop/'}))
if isinstance(d, dict): d = next(v for v in d.values() if isinstance(v, list))
today = datetime.date.today().isoformat()
import collections
print('bus_cd', collections.Counter(s.get('bus_cd') for s in d))
KEEP = {'MOS_GREEN': '', 'MOS_CF': '', 'MOS_RED': '', 'MOS_PR': '業態: モスプレミアム', 'MOSDO': '業態: MOSDO（ミスタードーナツ併設）', 'MOS_SH': '業態: MOSH Burger&Bar'}
# あえん・マザーリーフ・カフェ山と海と太陽は別業態なので除く
rows = []
for s in d:
    if s.get('bus_cd') not in KEEP: continue
    note = [KEEP[s['bus_cd']]] if KEEP[s['bus_cd']] else []
    od = s.get('openingday') or ''; cd = s.get('closingday') or '9999-12-31'
    if od > today: note.append(f'開店予定 {od}')
    if cd < today: continue
    if cd < '2100': note.append(f'閉店予定 {cd}')
    name = s['name']
    m = re.search(r'[(（]([^()（）]*(休業|オープン|閉店|予定)[^()（）]*)[)）]\s*$', name)
    if m: note.append(m.group(1)); name = name[:m.start()].strip()
    rows.append(row('mos-burger', name, s['addr_all'], s['lat'], s['lon'], f"https://www.mos.jp/shop/detail/?shop_cd={s['shop_cd']}", '／'.join(note)))
save('mos-burger', rows)
