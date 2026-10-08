"""マクドナルド: map.mcdonalds.co.jp/api/poi?bounds=南,西,北,東 （全国を1回で。件数が上限に当たっていないか4分割でも確かめる）"""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import get, row, save
U = 'https://map.mcdonalds.co.jp/api/poi?bounds={}&uuid=sv20261008'
H = {'Referer': 'https://map.mcdonalds.co.jp/'}
allj = json.loads(get(U.format('20,122,46,154'), 'mcdonalds_all.json', H))
# 打ち切り確認: 4分割して和集合が全国一括と一致するか
parts = {}
for i, b in enumerate(['20,122,35.5,137', '20,137,35.5,154', '35.5,122,46,137', '35.5,137,46,154']):
    for s in json.loads(get(U.format(b), f'mcdonalds_q{i}.json', H)): parts[s['key']] = s
keys = {s['key'] for s in allj}
print('一括', len(allj), '4分割の和', len(parts), '差', len(keys ^ set(parts)))
m = {s['key']: s for s in allj}; m.update(parts)
rows = [row('mcdonalds', s['name'], s['address'], s['latitude'], s['longitude'], f"https://map.mcdonalds.co.jp/map/{s['key']}") for s in m.values()]
save('mcdonalds', rows)
