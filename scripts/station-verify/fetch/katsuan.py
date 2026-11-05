"""かつ庵: ゼンショー系共通店舗検索 https://maps.katsuan.co.jp/jp/api/search（都道府県別・住所と座標つき）。"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _zensho import fetch
fetch("katsuan", "https://maps.katsuan.co.jp", "かつ庵")
