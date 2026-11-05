"""タリーズコーヒー: shop.tullys.co.jp/all の data-store（全店・data-lat/data-lon つき）"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import *
save('tully-coffee', datastore_rows('tully-coffee', 'https://shop.tullys.co.jp/all', 'tullys_all.html', 'https://shop.tullys.co.jp', 'store_name_info'))
