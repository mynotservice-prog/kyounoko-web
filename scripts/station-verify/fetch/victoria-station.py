"""ヴィクトリアステーション: ビッグボーイと同じ検索 https://maps.bigboyjapan.co.jp/jp/api/search に載る別ブランド。"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _zensho import fetch
fetch("victoria-station", "https://maps.bigboyjapan.co.jp", "ヴィクトリアステーション")
