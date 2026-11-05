"""ステーキガスト: すかいらーく共通店舗検索 /api/point/（カテゴリ=0105）で全国全店。"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _skylark import fetch
fetch("steak-gusto", "0105")
