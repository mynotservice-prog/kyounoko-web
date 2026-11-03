"""ばんどう太郎: can-ly ディレクトリ型 https://shop.bandotaro.co.jp/ （directory 39・ブランド 660）。全店・座標つき。IS_CLOSED は note に残す"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import *
shops = canly_directory(39, 'https://shop.bandotaro.co.jp/')
rows = canly_rows('bandotaro', shops, 'https://shop.bandotaro.co.jp/', keep=lambda x: (x.get('brand') or {}).get('id') == 660,
                  note=lambda x: '閉店（公式の状態 IS_CLOSED）' if x.get('openStatus') == 'IS_CLOSED' else '')
save('bandotaro', rows, {'coverage': 'national', 'coord': 'wgs84', 'source': 'https://shop.bandotaro.co.jp/'})
