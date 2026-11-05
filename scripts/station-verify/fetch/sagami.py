"""サガミ: 公式 gps-search/?pr=<県>。1ページに全ブランドの店舗があり、li の data-brand で分かれる。ブランドが sagami（和食麺処サガミ）の店だけ"""
import os, re, sys, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, strip_zip, add_pref, PREFS, save
top = get('https://www.sagami-holdings.co.jp/store-search/')
prs = sorted(set(re.findall(r'gps-search/\?pr=(\w+)', top)))
PRNAME = dict(re.findall(r'gps-search/\?pr=(\w+)">([^<]+)<', top))
CITY = {'尼崎市': '兵庫県', '東近江市': '滋賀県', '長野市': '長野県', '塩尻市': '長野県', '飯田市': '長野県', '富山市': '富山県', '射水市': '富山県', '本巣市': '岐阜県', '越前市': '福井県', '亀岡市': '京都府'}
seen = {}
for pr in prs:
    h = get(f'https://www.sagami-holdings.co.jp/gps-search/?pr={pr}')
    for b in re.split(r"(?=<li data-brand=)", h)[1:]:
        br = re.match(r"<li data-brand='?\"?([\w-]*)", b).group(1)
        m = re.search(r'js_address"><a href="([^"]+)"[^>]*>(.*?)</a>', b)
        if not m: continue
        a = re.search(r'js_location">(.*?)</p>', b, re.S)
        ar = re.search(r'data-area1="(\w+)"', b)
        addr = strip_zip(clean(a.group(1))) if a else ''
        pref = PRNAME.get(ar.group(1)) if ar else None
        if pref and not addr.startswith(tuple(PREFS)): addr = pref + addr
        for c, p in CITY.items():
            if addr.startswith(c): addr = p + addr
        seen[m.group(1)] = (br, clean(m.group(2)), add_pref(addr))
    print(pr, len(seen))
print(collections.Counter(v[0] for v in seen.values()))
for slug, brand in (('sagami', 'sagami'),):   # 味の民芸は fetch/ajinomingei.py が公式サイトから取る
    rows = [{'name': n, 'address': a, 'lat': None, 'lng': None, 'url': u} for u, (b, n, a) in seen.items() if b == brand]
    save(slug, rows, {'coord': 'none', 'all_brand_total': len(seen), 'source': 'https://www.sagami-holdings.co.jp/store-search/', 'address_note': '都道府県が省略された住所は公式の data-area1（県）で補った', 'fetched': '2026-11-02'})
