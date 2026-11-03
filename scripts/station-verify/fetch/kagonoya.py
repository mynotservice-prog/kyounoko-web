"""かごの屋: 公式 kagonoya.food-kr.com トップの国内店舗一覧。店名に「かごの屋／かごのや」を含む店だけ。座標は店舗ページの JSON-LD"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, num, save
O = 'https://kagonoya.food-kr.com'
h = get(O + '/')
i = h.index('class="shop_wrap"')
sec = h[i:h.index('</section>', i)]
rows, other = [], []
for it in re.findall(r'<li class="shop_info">(.*?)</li>', sec, re.S):
    n = clean((re.search(r'<div class="shop_name">(.*?)</div>', it, re.S) or [None, ''])[1])
    if not n: continue
    if not re.search(r'かごの[屋や]', n): other.append(n); continue
    a = re.sub(r'\s+', '', clean((re.search(r'<div class="shop_addr">(.*?)</div>', it, re.S) or [None, ''])[1]))
    hr = re.search(r"href=['\"]([^'\"]+)['\"]", it)
    url = O + hr.group(1) if hr else None
    la = lo = None
    if url:
        d = get(url, allow_status=(404,))
        g = re.search(r'"latitude":\s*"([\d.]+)",\s*"longitude":\s*"([\d.]+)"', d)
        if g: la, lo = num(g.group(1)), num(g.group(2))
    rows.append({'name': n, 'address': a, 'lat': la, 'lng': lo, 'url': url})
print('除いた別業態', other)
save('kagonoya', rows, {'coord': 'wgs84（店舗ページ JSON-LD）', 'excluded_brands': other, 'source': O + '/#shoplist', 'fetched': '2026-11-02'})
