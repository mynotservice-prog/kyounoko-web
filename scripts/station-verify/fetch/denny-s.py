"""デニーズ: shop.dennys.jp/api/point/?backend_filters={"conditions":[]}（全店）"""
import json, sys, os, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import get, row, save
d = json.loads(get('https://shop.dennys.jp/api/point/?backend_filters=%7B%22conditions%22%3A%5B%5D%7D', 'dennys_point.json'))
print('total', d['total'], 'items', len(d['items']))
assert d['total'] == len(d['items'])
rows = [row('denny-s', re.sub(r'[\s　]+', ' ', s['name']).strip(), s['address'].replace('　', ' '), s['latitude'], s['longitude'], f"https://shop.dennys.jp/map/{s['key']}")
        for s in d['items'] if s.get('is_active')]
save('denny-s', rows)
