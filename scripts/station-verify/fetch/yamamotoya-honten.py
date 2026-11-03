"""山本屋本店: 公式 yamamotoyahonten.co.jp/shop/。売店・カレー煮込うどん鯱市は別業態として note に残す／除く"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, add_pref, save
SRC = 'https://yamamotoyahonten.co.jp/shop/'
h = get(SRC)
rows = []
for m in re.finditer(r'<dl class="shop-data">', h):
    hs = re.findall(r'<h\d[^>]*>(.*?)</h\d>', h[max(0, m.start() - 900):m.start()], re.S)
    d = re.search(r'<dt>住所</dt>\s*<dd>(.*?)</dd>', h[m.start():m.start() + 800], re.S)
    if not hs or not d: continue
    n = clean(hs[-1])
    if '鯱市' in n: continue
    a = re.sub(r'\s*[（(].*$', '', clean(d.group(1)))
    if a.startswith('一宮市'): a = '愛知県' + a
    rows.append({'name': '山本屋本店 ' + n, 'address': add_pref(a), 'lat': None, 'lng': None, 'url': SRC, 'note': 'テイクアウト専門' if '売店' in n else ''})
print([r['name'] for r in rows])
save('yamamotoya-honten', rows, {'coord': 'none', 'source': SRC, 'fetched': '2026-11-02'})
