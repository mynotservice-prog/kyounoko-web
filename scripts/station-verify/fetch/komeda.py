"""コメダ珈琲店: eu.komeda.co.jp/v1/hp/shop?brand_type=1&all=true（Origin・Referer必須。住所のみ・座標なし）
店舗ページは SPA で /shop/detail.html?id=<id>（公式 /js/app.js が id を読んで /v1/hp/shop/<id> を呼ぶ。座標はこの個別APIにしか無い）"""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import get, row, save
H = {'Origin': 'https://www.komeda.co.jp', 'Referer': 'https://www.komeda.co.jp/'}
d = json.loads(get('https://eu.komeda.co.jp/v1/hp/shop?brand_type=1&all=true', 'komeda_all.json', H))
print('total', d['total'], 'items', len(d['items']))
assert d['total'] == len(d['items'])
rows = [row('komeda', s['name'], s['address'], None, None, f"https://www.komeda.co.jp/shop/detail.html?id={s['id']}") for s in d['items'] if s['brand_type'] == 1
        and not ('テスト' in s['name'] or 'サンプル' in s['name'] or s['address'] in ('０', '0', ''))]  # 営業テスト・表示サンプルの4件を除く
save('komeda', rows, {'coord': 'none', 'coord_hint': '一覧APIに座標なし。個別API https://eu.komeda.co.jp/v1/hp/shop/<id>（Origin・Referer必須）の shop_latitude / shop_longitude にはある（1店1リクエスト）'})
