"""和食さと: can-ly ディレクトリ型 https://store.srsholdings.com/sato/ （directory 9・ブランド 395）。全店・座標つき。IS_CLOSED は note に残す"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import *
shops = canly_directory(9, 'https://store.srsholdings.com/sato/')
rows = canly_rows('washokusato', shops, 'https://store.srsholdings.com/sato/', keep=lambda x: (x.get('brand') or {}).get('id') == 395,
                  note=lambda x: '閉店（公式の状態 IS_CLOSED）' if x.get('openStatus') == 'IS_CLOSED' else '')
save('washokusato', rows, {'coverage': 'national', 'coord': 'wgs84', 'source': 'https://store.srsholdings.com/sato/'})
