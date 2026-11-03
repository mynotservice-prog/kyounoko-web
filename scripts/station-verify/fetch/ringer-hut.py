"""リンガーハット: can-ly ディレクトリ型 /v2/directories/84/shops/search（Origin・Referer必須）。冷凍自動販売機は除く"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import *
shops = canly_directory(84, 'https://shop.ringerhut.jp/all/')
save('ringer-hut', canly_rows('ringer-hut', shops, 'https://shop.ringerhut.jp/', lambda s: (s.get('brand') or {}).get('name') == 'リンガーハット'))
