"""大阪王将: 公式店舗検索の画面が呼ぶ店舗API（GraphQL）を都道府県番号 1〜47 で取得。
APIのURLと公開キーは公式ページが読み込む /assets/js/search_shops__response.js から実行時に読む（スクリプトには書かない）。"""
import re, sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save, strip_zip, PREFS, num
SRC = 'https://www.osaka-ohsho.com/store/'
js = get('https://www.osaka-ohsho.com/assets/js/search_shops__response.js')
api_url = re.search(r"const apiUrl = '([^']+)'", js).group(1)
api_key = re.search(r"const apiKey = '([^']+)'", js).group(1)
Q = 'query($pref_id:Int!,$condition:[Int],$limit:Int!,$offset:Int!){getShopListByPrefectures(pref_id:$pref_id,condition:$condition,limit:$limit,offset:$offset){total shops{shop_id shopName zipcode address latitude longitude holiday notice}}}'
stores, seen = [], set()
for n in range(1, 48):
    body = json.dumps({'query': Q, 'variables': {'pref_id': n, 'condition': [], 'limit': 1000, 'offset': 0}})
    t = get(api_url, data=body, headers={'Content-Type': 'application/json', 'x-api-key': api_key, 'Origin': 'https://www.osaka-ohsho.com', 'Referer': SRC}, key=f'osaka-ohsho-pref-{n}', delay=0.6)
    j = json.loads(t)
    if j.get('errors'): raise RuntimeError(j['errors'])
    d = j['data']['getShopListByPrefectures']
    assert len(d['shops']) == d['total'], (n, d['total'], len(d['shops']))
    for s in d['shops']:
        if s['shop_id'] in seen: continue
        seen.add(s['shop_id'])
        addr = strip_zip(clean(s.get('address') or ''))
        if addr and not addr.startswith(PREFS[n - 1]): addr = PREFS[n - 1] + addr
        lat, lng = num(s.get('latitude')), num(s.get('longitude'))
        if lat is not None and not (20 < lat < 46 and 122 < (lng or 0) < 154): lat = lng = None
        note = clean(s.get('notice') or '')
        if not re.search(r'閉店|休業|オープン|OPEN|改装|移転|テイクアウト専門|持ち帰り専門', note): note = ''
        if not addr:
            addr = PREFS[n - 1]; note = (note + ' 公式データに住所の記載なし（都道府県のみ。都道府県別検索の結果から補完）').strip()
        stores.append({'name': clean(s['shopName']), 'address': addr, 'lat': lat, 'lng': lng, 'url': f"https://www.osaka-ohsho.com/store/store_detail.php?shop_id={s['shop_id']}", 'note': note[:300]})
save('osaka-ohsho', stores, {'source': SRC, 'coord': 'wgs84? (店舗APIの latitude/longitude。測地系の明記なし)'})
