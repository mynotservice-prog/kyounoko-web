"""スターバックス: 公式店舗検索が呼ぶ検索API（CloudSearch）を全件ページ送り。座標は location（WGS84）を使う（location_jp は日本測地系）。
入店制限の公式フラグは無いので、大学・病院・改札内などは店名から判定して note に書く（推定であることを明記）。"""
import re, sys, os, json, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, save
API = 'https://hn8madehag.execute-api.ap-northeast-1.amazonaws.com/prd-2019-08-21/storesearch?'
H = {'Origin': 'https://store.starbucks.co.jp', 'Referer': 'https://store.starbucks.co.jp/'}
hits, found = [], None
for st in range(0, 10000, 100):
    q = {'size': '100', 'q.parser': 'structured', 'q': "(and ver:10000 record_type:1)", 'fq': "(and data_type:'prd')", 'sort': 'store_id asc', 'start': str(st)}
    d = json.loads(get(API + urllib.parse.urlencode(q, quote_via=urllib.parse.quote, safe="():'"), headers=H, delay=0.7))
    found = d['hits']['found']; hits += d['hits']['hit']
    if len(hits) >= found or not d['hits']['hit']: break
assert len(hits) == found, (len(hits), found)
stores, seen = [], set()
for h in hits:
    f = h['fields']
    if f['store_id'] in seen: continue
    seen.add(f['store_id'])
    name = f['name'].replace('　', ' ').strip()
    parts = f.get('address_5', '').replace('　', ' ').split(' ')
    addr = ''.join(parts[:3]) + (' ' + ' '.join(p for p in parts[3:] if p) if len(parts) > 3 else '')
    lat = lng = None
    if f.get('location'):
        lat, lng = [float(x) for x in f['location'].split(',')]
    notes = []
    tag = '（店名からの判定。入店制限の有無は公式の店舗情報に記載なし）'
    if re.search(r'大学(?!駅|前|通)|キャンパス(?!スクェア)', name): notes.append('大学構内の店' + tag)
    if re.search(r'病院|医院|医療センター', name): notes.append('病院内の店' + tag)
    if re.search(r'改札内|ラチ内|ゲートエリア|ゲート内|新幹線.*ホーム|サテライト|出国|制限エリア', name): notes.append('改札内・保安検査後エリアの店（入場券や搭乗券が必要な可能性）' + tag)
    if re.search(r'パーキングエリア|サービスエリア|ＳＡ|ＰＡ', name): notes.append('高速道路のSA/PA内の店')
    if f.get('store_type') in ('11', '12'): notes.append('別業態（リザーブ ロースタリー／プリンチ）')
    stores.append({'name': name, 'address': addr.strip(), 'lat': lat, 'lng': lng, 'url': f"https://store.starbucks.co.jp/detail-{f['store_id']}/", 'note': ' / '.join(notes)})
save('starbucks', stores, {'source': API + "q=(and ver:10000 record_type:1)&fq=(and data_type:'prd')", 'declared': found, 'coord': 'wgs84 (APIの location。location_jp は日本測地系なので使っていない)', 'note': '一般客が入れない店の公式フラグは無い。note は店名からの推定'})
