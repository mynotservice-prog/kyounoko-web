"""かっぱ寿司: www.kappasushi.jp/master_data/json/shoplist.json"""
import json, sys, os, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import get, row, save
d = json.loads(get('https://www.kappasushi.jp/master_data/json/shoplist.json', 'kappa_shoplist.json', {'Referer': 'https://www.kappasushi.jp/shop/'}))
if isinstance(d, dict): d = next(v for v in d.values() if isinstance(v, list))
rows = []
for s in d:
    name = re.sub(r'\s*※.*$', '', s['name']).strip()   # 「※タイプA」は価格帯の注記
    rows.append(row('kappa-sushi', name, s['prefecture'] + s['city'] + s['address'], s.get('latitude'), s.get('longitude'),
                    f"https://www.kappasushi.jp/shop/{s['code']}", re.sub(r'<[^>]+>', ' ', s.get('comment') or '').strip()[:120]))
save('kappa-sushi', rows)
