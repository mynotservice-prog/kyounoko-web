"""くら寿司: shop.kurasushi.co.jp/all の data-store（全店・data-lat/data-lon つき）。
店名末尾の【１皿…円～】は価格帯の表示なので note へ。別業態の「無添蔵」と【閉店】表示の店は除く"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import *
rows = datastore_rows('kura-sushi', 'https://shop.kurasushi.co.jp/all', 'kura_all.html', 'https://shop.kurasushi.co.jp', 'name', bracket_fix)
drop = [r for r in rows if r['name'].startswith('無添蔵') or '閉店' in r['note'].split('／')]
print('除外:', [(r['name'], r['note']) for r in drop])
save('kura-sushi', [r for r in rows if r not in drop])
