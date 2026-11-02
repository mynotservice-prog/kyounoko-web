"""まるは食堂: 公式 maruha-net.co.jp/shop/ の店舗情報（店名と住所）。いちご狩り・温泉・割烹の別業態は除く"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, strip_zip, add_pref, save
SRC = 'https://www.maruha-net.co.jp/shop/'
h = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', get(SRC), flags=re.S)
t = clean(h)
rows = []
for m in re.finditer(r'((?:\S+ )?\S+)\s+住 所\s+(〒\d{3}-\d{4}.*?)\s+T E L', t):
    n = m.group(1).replace('店舗詳細ページ ', '').replace('お食事 ', '').replace('ご宿泊とお食事 ', '')
    a = strip_zip(m.group(2))
    if not a.startswith('愛知県'): a = '愛知県' + a if a.startswith(('名古屋市', '常滑市')) else add_pref(a)
    if 'いちご' in n or 'ごんぎつねの湯' in n or '旬彩ふき島' in n: continue  # 温泉・割烹の別業態
    rows.append({'name': 'まるは食堂 ' + n, 'address': a, 'lat': None, 'lng': None, 'url': SRC})
print([(r['name'], r['address']) for r in rows])
save('maruha-shokudo', rows, {'coord': 'none', 'source': SRC, 'fetched': '2026-11-02'})
