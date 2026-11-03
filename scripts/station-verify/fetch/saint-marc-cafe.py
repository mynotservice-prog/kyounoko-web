"""サンマルクカフェ: POST www.saint-marc-hd.com/api/shop/search/saintmarccafe/ に {"limit":5000}（全店・座標つき）
店名が【閉店】で始まる行は除く"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import *
rows = saintmarc('saint-marc-cafe', 'saintmarccafe')
closed = [r['name'] for r in rows if '【閉店】' in r['name']]
print('閉店表示で除外:', closed)
save('saint-marc-cafe', [r for r in rows if '【閉店】' not in r['name']])
