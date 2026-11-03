"""鎌倉パスタ: POST www.saint-marc-hd.com/api/shop/search/kamakura/ に {"limit":5000}（全店・座標つき）
同じ一覧に入る別業態（てっぱんのスパゲッティ・おだしもん・ぎをん椿庵）は除く"""
import sys, os, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import *
rows = saintmarc('kamakura-pasta', 'kamakura')
keep = []; drop = []
for r in rows:
    if '【閉店】' in r['name'] or not re.match(r'(鎌倉パスタ|Kamakurapasta)', r['name']): drop.append(r['name']); continue
    if re.match(r'(鎌倉パスタダイニング|Kamakurapasta Fresca)', r['name']): r['note'] = '派生業態（店名のとおり）'
    keep.append(r)
print(f'別業態・閉店で除外 {len(drop)} 件:', sorted(set(n.split(" ")[0] for n in drop)))
save('kamakura-pasta', keep)
