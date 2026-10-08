"""map.reins.co.jp/onyasai/all の data-store（全店・data-lat/data-lon つき）。店名の【休業】【○月○日オープン】は note へ"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import *
save('onyasai', datastore_rows('onyasai', 'https://map.reins.co.jp/onyasai/all', 'onyasai_all.html', 'https://map.reins.co.jp', 'store_name', bracket_fix))
