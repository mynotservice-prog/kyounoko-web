"""華屋与兵衛: ゼンショー系共通店舗検索 https://maps.hanayayohei.co.jp/jp/api/search（都道府県別・住所と座標つき）。"""
import sys,os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _zensho import fetch
fetch("hanayayohei", "https://maps.hanayayohei.co.jp", "華屋与兵衛")
