"""フライングガーデン: 公式 /restaurant/index.php（全店が1ページ）。座標は各店のGoogleマップリンクの ll"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
SRC = 'https://www.fgarden.co.jp/restaurant/index.php'
h = get(SRC)
rows = []
for b in re.findall(r'<dl class="branch">(.*?)</dl>', h, re.S):
    n = clean(re.search(r'<dt class="name"><p>(.*?)</p>', b, re.S).group(1))
    a = re.search(r'<dd class="add">\s*<p>(.*?)</p>', b, re.S).group(1)
    a = clean(re.sub(r'〒[\d-]+\s*(<br\s*/?>)?', '', a))
    ll = re.search(r'[?&;]ll=([\d.]+),([\d.]+)', b)
    rows.append({'name': n, 'address': a, 'lat': float(ll.group(1)) if ll else None, 'lng': float(ll.group(2)) if ll else None, 'url': SRC, 'note': ''})
save('flyinggarden', rows, {'coverage': 'all-official', 'coord': 'unreliable', 'source': SRC, 'coord_hint': 'Googleマップリンクの ll。店ごとの精度は不明なので住所を優先'})
