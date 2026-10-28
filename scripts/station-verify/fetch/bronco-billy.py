"""ブロンコビリー: 公式 /shop/ の店舗URL一覧 → 各店舗ページ（住所・Googleマップリンクの座標）。"""
import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
SRC = 'https://www.bronco.co.jp/shop/'
top = get(SRC)
links = list(dict.fromkeys(re.findall(r"class='shop_list_item_anchor' href=\"(https://www\.bronco\.co\.jp/shop/[a-z]+/[^\"]+/)\"", top)))
stores = []
for u in links:
    d = get(u)
    name = clean(re.search(r'<h1 class="section-heading__title">([\s\S]*?)</h1>', d).group(1))
    am = re.search(r'info_content_item_title">住所</div>\s*<div class="info_content_item_text">([\s\S]*?)</div>', d)
    addr = clean(am.group(1)) if am else ''
    g = re.search(r'[?&](?:amp;)?ll=(-?[\d.]+),(-?[\d.]+)', d) or re.search(r'embed/v1/place\?key=[^"&]+&(?:amp;)?q=(-?[\d.]+),(-?[\d.]+)', d)
    lat, lng = (float(g.group(1)), float(g.group(2))) if g else (None, None)
    head = d[d.find('section-heading__title'):d.find('info_content_list')]
    txt = clean(re.sub(r'<script[\s\S]*?</script>', '', head))
    notes = [s for s in re.findall(r'[^。 ]*(?:閉店|オープン|移転|改装|休業)[^。]*。?', txt) if '全店舗' not in s]
    stores.append({'name': name, 'address': addr, 'lat': lat, 'lng': lng, 'url': u, 'note': ' '.join(dict.fromkeys(notes))[:300]})
save('bronco-billy', stores, {'source': SRC, 'coord': 'wgs84 (店舗ページのGoogleマップリンクの値)'})
