"""藍屋: すかいらーく共通店舗検索 /api/point/（カテゴリ=0107）で全国全店。"""
import sys,os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _skylark import fetch
fetch("aiya", "0107")
