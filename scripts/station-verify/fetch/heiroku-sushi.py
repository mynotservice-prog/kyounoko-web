"""平禄寿司: Y's HOLDINGS 公式 /shop/ の検索結果（検索結果N件と照合）。海外は都道府県=overseas の結果で除く。都道府県が無い住所は住所検索で補う。座標なし"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import urllib.parse, unicodedata
from _lib import get, clean, save, PREFS, add_pref
BASE = 'https://ys-holdings.co.jp/shop/'
def cards(q):
    first = get(BASE + q); n = int(re.search(r'検索結果\s*(\d+)件', first).group(1))
    last = max([1] + [int(x) for x in re.findall(r'/shop/page/(\d+)/', first)])
    out = {}
    for p in range(1, last + 1):
        h = first if p == 1 else get(f'{BASE}page/{p}/{q}')
        for c in re.findall(r'<li class="shop-card">(.*?)</article>', h, re.S):
            a = re.search(r'<h2 class="shop-card_ttl"><a href="([^"]+)">(.*?)</a>', c, re.S)
            ps = re.findall(r'<p>(.*?)</p>', c, re.S)
            out[a.group(1)] = (clean(a.group(2)), clean(ps[0]) if ps else '')
    assert len(out) == n, (q, len(out), n)
    return out
def pref(a):
    r = json.loads(get('https://msearch.gsi.go.jp/address-search/AddressSearch?q=' + urllib.parse.quote(unicodedata.normalize('NFKC', a)), delay=0.3))
    t = [x['properties']['title'] for x in r if x['properties']['title'].startswith(tuple(PREFS))]
    return next((p for p in PREFS if t and t[0].startswith(p)), '')
al = cards('?f&shop-prefectures&shop-brand%5B0%5D=heiroku-sushi'); ov = cards('?f=&shop-prefectures=overseas&shop-brand%5B%5D=heiroku-sushi')
rows = []
for u, (n, a) in al.items():
    if u in ov: continue
    a = add_pref(a)
    if not a.startswith(tuple(PREFS)): a = pref(a) + a
    rows.append({'name': n, 'address': a, 'lat': None, 'lng': None, 'url': u, 'note': ''})
print('全', len(al), '海外', len(ov), '国内', len(rows))
save('heiroku-sushi', rows, {'coverage': 'all-official', 'coord': 'none', 'source': BASE + '?f&shop-prefectures&shop-brand%5B0%5D=heiroku-sushi', 'official_total': len(al) - len(ov)})
