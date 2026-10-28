"""Mapion系店舗検索の店舗ページから座標を読む共通関数"""
import re
from _lib import get
def latlng(url):
    d = get(url)
    la = re.search(r'"latitude":"(-?[\d.]+)"', d) or re.search(r'\blat = (-?[\d.]+)', d)
    lo = re.search(r'"longitude":"(-?[\d.]+)"', d) or re.search(r'\blng = (-?[\d.]+)', d)
    return (float(la.group(1)), float(lo.group(1))) if la and lo else (None, None)
