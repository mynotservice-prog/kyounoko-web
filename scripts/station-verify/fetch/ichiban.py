"""魚べい（slug: ichiban）: 公式店舗検索ページ（www.uobei.info/store/）が呼ぶ店舗API（元気寿司グループ共通）を全件取得し、ブランド「魚べい」だけに絞る。
APIのアクセス用の値は公式ページのJSから実行時に読む（スクリプトには書かない）。"""
import re, sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, save, num
SRC = 'https://www.uobei.info/store/'
h = get(SRC)
tok = None
for c in sorted(set(re.findall(r'/_next/static/chunks/[^"]+\.js', h))):
    js = get('https://www.uobei.info' + c, delay=0.3)
    m = re.search(r'rcms-api/8/stores\?"\)\.concat\(\w+\),\{[^}]*?"x-rcms-api-access-token":"([0-9a-f]{64})"', js)
    if m: tok = m.group(1); break
if not tok: raise RuntimeError('店舗APIのアクセス用の値がJSから見つからない')
d = json.loads(get('https://api.genki-gdc.co.jp/rcms-api/8/stores?cnt=1000', headers={'x-rcms-api-access-token': tok, 'Origin': 'https://www.uobei.info', 'Referer': SRC}, key='uobei-stores-all'))
assert d['pageInfo']['totalCnt'] == len(d['list']), d['pageInfo']
stores, others, hidden = [], {}, []
for s in d['list']:
    brand = (s.get('brand') or {}).get('label')
    if brand != '魚べい': others[brand] = others.get(brand, 0) + 1; continue
    if (s.get('is_display') or {}).get('label') not in (None, '表示'): hidden.append(s['subject']); continue
    addr = ((s.get('prefecture') or {}).get('label') or '') + (s.get('address_1') or '') + (s.get('address_2') or '')
    if s.get('building_name'): addr += ' ' + s['building_name']
    ll = (s.get('latlng') or [{}])[0]
    lat, lng = num(ll.get('1')), num(ll.get('2'))
    note = ''
    if lat is not None and lng is not None and 122 < lat < 154 and 20 < lng < 46:
        lat, lng = lng, lat; note = '公式データの緯度と経度が逆に入っていたため入れ替えた'
    stores.append({'name': s['subject'].strip(), 'address': addr.strip(), 'lat': lat, 'lng': lng, 'url': f"{SRC}?id={s['store_id']}", 'note': note})
print('他ブランド', others, '非表示', hidden)
save('ichiban', stores, {'source': SRC, 'api_total': len(d['list']), 'other_brands_excluded': others, 'coord': 'wgs84? (店舗APIの latlng。Googleマップ埋め込み用の値)', 'name_note': '店名は公式の表記のまま（ブランド名なし）'})
