"""とんかつ和幸: 和幸商事の公式店舗検索。ブランド「とんかつ和幸」(brand=0)×業態「レストラン」(type=0) を都道府県別に取得。
正常ページも HTTP 404 で返るので本文で判定する。住所に都道府県が無いので検索条件の都道府県を前置する。
座標は各店舗ページの Google マップ埋め込み（地図の中心）から読む＝近似値。"""
import re, sys, os, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save, PREFS
BASE = 'https://wako-group.co.jp/shop/result/?brand=0&type=0'
def page(url):
    t = get(url, allow_status=(404,))
    if 'p-shop_list' not in t and 'p-shop_not_found' not in t: raise RuntimeError('店舗検索ページではない: ' + url)
    return t
def cards(t):
    for m in re.finditer(r'<div class="p-shop_list_item">\s*<a href="([^"]+)">([\s\S]*?)</a>\s*</div>', t):
        yield m.group(1), m.group(2)
# 全国一覧（件数の照合用）
first = page(BASE)
last = max([1] + [int(x) for x in re.findall(r'paged=(\d+)', first)])
allurls = []
for p in range(1, last + 1):
    t = first if p == 1 else page(f'{BASE}&paged={p}')
    allurls += [u for u, _ in cards(t)]
allurls = list(dict.fromkeys(allurls))
stores, seen = [], set()
for pref in PREFS:
    q = f'{BASE}&pref={urllib.parse.quote(pref)}'
    t1 = page(q)
    lp = max([1] + [int(x) for x in re.findall(r'paged=(\d+)', t1)])
    for p in range(1, lp + 1):
        t = t1 if p == 1 else page(f'{q}&paged={p}')
        for url, b in cards(t):
            if url in seen: continue
            seen.add(url)
            if 'brand_wako' not in b: continue
            raw = clean(re.search(r'p-shop_list_name">([\s\S]*?)</h3>', b).group(1))
            genres = [clean(x) for x in re.findall(r'<li(?![^>]*visibility:hidden)[^>]*>([\s\S]*?)</li>', re.search(r'p-shop_list_genre">([\s\S]*?)</ul>', b).group(1))]
            if 'レストラン' not in genres: continue
            mm = re.match(r'^(.*?)[（(](.+)[）)]$', raw)
            name, note = (mm.group(1).strip(), mm.group(2)) if mm else (raw, '')
            am = re.search(r'<span>住所</span><span>([\s\S]*?)</span></p>', b)
            addr = clean(am.group(1)) if am else ''
            if not addr.startswith(pref): addr = pref + addr
            lat = lng = None
            d = get(url, allow_status=(404,))
            g = re.search(r'google\.com/maps/embed\?pb=[^"]*?!2d(-?[\d.]+)!3d(-?[\d.]+)', d)
            if g: lng, lat = float(g.group(1)), float(g.group(2))
            stores.append({'name': name, 'address': addr, 'lat': lat, 'lng': lng, 'url': url, 'note': note})
missing = [u for u in allurls if u not in seen]
print('全国一覧', len(allurls), '都道府県別合計', len(stores), '全国一覧にあって都道府県別に無い', missing)
save('tonkatsu-wako', stores, {'source': BASE, 'coord': 'approximate', 'coord_note': '店舗ページのGoogleマップ埋め込みの地図中心（WGS84）。店の位置とほぼ同じだが公式の座標項目ではない', 'national_list_count': len(allurls)})
