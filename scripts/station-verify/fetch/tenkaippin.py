"""天下一品: 公式 tenkaippin.co.jp/shop/ の都道府県検索（POST /search/）で列挙し、店舗ページの住所を読む"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, strip_zip, save
SRC = 'https://www.tenkaippin.co.jp/shop/'
top = get(SRC)
sel = top[top.index('name="pref_select"'):]
prefs = re.findall(r'<option\s+value="(\d+)">([^<]+)<', sel[:sel.index('</select>')])
assert len(prefs) >= 40
urls = set()
H = {'Content-Type': 'application/x-www-form-urlencoded', 'Referer': SRC}
for c, _ in prefs:
    urls |= set(re.findall(r'href="(https://www\.tenkaippin\.co\.jp/shop/\d+/)"', get('https://www.tenkaippin.co.jp/search/', headers=H, data=f'pref_select={c}')))
print('店舗URL', len(urls))
rows = []
for u in sorted(urls):
    h = get(u, allow_status=(404,))
    n = clean(re.search(r'<title>(.*?)</title>', h, re.S).group(1)).split(' - ')[0]
    m = re.search(r'<p class="shop01_add">(.*?)</p>', h, re.S)
    rows.append({'name': '天下一品 ' + n, 'address': strip_zip(clean(m.group(1))) if m else '', 'lat': None, 'lng': None, 'url': u})
save('tenkaippin', rows, {'coord': 'none', 'source': SRC, 'fetched': '2026-11-02'})
