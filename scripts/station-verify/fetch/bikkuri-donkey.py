"""びっくりドンキー: 公式店舗検索ページに全店カード（data-latlng・data-pref・住所）。住所に都道府県が無いので data-pref から補う。"""
import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save, PREFS
ROMA = ['hokkaido','aomori','iwate','miyagi','akita','yamagata','fukushima','ibaraki','tochigi','gunma','saitama','chiba','tokyo','kanagawa','niigata','toyama','ishikawa','fukui','yamanashi','nagano','gifu','shizuoka','aichi','mie','shiga','kyoto','osaka','hyogo','nara','wakayama','tottori','shimane','okayama','hiroshima','yamaguchi','tokushima','kagawa','ehime','kochi','fukuoka','saga','nagasaki','kumamoto','oita','miyazaki','kagoshima','okinawa']
P = dict(zip(ROMA, PREFS))
SRC = 'https://www.bikkuri-donkey.com/shop/?from=shop&pref=tokyo'
html = get(SRC)
stores, seen = [], set()
for blk in html.split('<div class="col-lg-4 col-md-6 col-12 shop_wrap"')[1:]:
    m = re.match(r'\s*name="shop_(\d+)" data-latlng="([^"]*)" data-pref="([^"]*)"', blk)
    if not m: continue
    sid, ll, pref = m.groups()
    if sid in seen: continue
    seen.add(sid)
    name = clean(re.search(r'<h4>([\s\S]*?)</h4>', blk).group(1))
    addr = clean(re.search(r'class="address">([\s\S]*?)</div>', blk).group(1))
    pj = P[pref]
    if not addr.startswith(pj): addr = pj + addr
    lat = lng = None
    try:
        lat, lng = [float(x) for x in ll.split(',')]
    except Exception: pass
    href = re.search(r'<a href="(/shop/shop_\d+/)"', blk)
    notes = [clean(x) for x in re.findall(r'class="[^"]*(?:notice|info|news|label)[^"]*">([\s\S]*?)</', blk)]
    stores.append({'name': name, 'address': addr, 'lat': lat, 'lng': lng, 'url': 'https://www.bikkuri-donkey.com' + href.group(1) if href else None, 'note': ' '.join(n for n in notes if n)})
save('bikkuri-donkey', stores, {'source': SRC, 'coord': 'wgs84 (公式のGoogleマップ経路リンクと同じ値)'})
