"""大起水産回転寿司: can-ly ディレクトリ型 https://shop.daiki-suisan.co.jp/ （directory 86・ブランド 2501）。全店・座標つき。IS_CLOSED は note に残す"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import *
shops = canly_directory(86, 'https://shop.daiki-suisan.co.jp/')
rows = canly_rows('daiki-suisan', shops, 'https://shop.daiki-suisan.co.jp/', keep=lambda x: (x.get('brand') or {}).get('id') == 2501,
                  note=lambda x: '閉店（公式の状態 IS_CLOSED）' if x.get('openStatus') == 'IS_CLOSED' else '')
save('daiki-suisan', rows, {'coverage': 'national', 'coord': 'wgs84', 'source': 'https://shop.daiki-suisan.co.jp/'})
