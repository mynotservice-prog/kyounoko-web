"""天丼てんや: 公式 店舗案内 → 都道府県ページ（東京は区市ページ経由）→ 各店舗ページ（住所・Googleマップ埋め込みの座標）。
海外（/shop/oversea/）と別業態「天ぷらてんや」（/tenpuratenya/）は除く。"""
import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save, strip_zip
ROOT = 'https://www.tenya.co.jp'
top = get(ROOT + '/shop/')
sec = top[top.find('天丼てんや 店舗情報'):top.find('天ぷらてんや 店舗情報')]
prefs = re.findall(r'href="https://www\.tenya\.co\.jp(/shop/[a-z]+/)"[^>]*>([^<（]+)（(\d+)）', sec)
declared = sum(int(n) for _, _, n in prefs)
def shop_links(path, depth=0):
    t = get(ROOT + path)
    body = t[t.find('id="contents"'):]
    out = [h for h in re.findall(r'href="(/shop/[a-z]+/[^"]+\.html)"', body)]
    if depth == 0:
        for sub in dict.fromkeys(re.findall(r'href="(?:https://www\.tenya\.co\.jp)?(' + re.escape(path) + r'[a-z_-]+/)"', body)):
            out += shop_links(sub, 1)
    return out
stores, seen = [], set()
for path, pref, n in prefs:
    links = [l for l in dict.fromkeys(shop_links(path)) if l.startswith(path)]
    if len(links) != int(n): print(f'件数差 {pref}: 表示{n} 取得{len(links)}')
    for l in links:
        if l in seen: continue
        seen.add(l)
        d = get(ROOT + l)
        name = clean(re.search(r'<h4 class="shopName">([\s\S]*?)</h4>', d).group(1))
        box = re.search(r'class="detailBox">([\s\S]*?)</div>', d).group(1)
        li = re.search(r'<li>(〒[\s\S]*?)</li>', box)
        addr = strip_zip(clean(li.group(1))) if li else ''
        if addr and not addr.startswith(pref): addr = pref + addr
        g = re.search(r'maps\?output=embed&(?:amp;)?q=(-?[\d.]+),(-?[\d.]+)', d)
        lat, lng = (float(g.group(1)), float(g.group(2))) if g else (None, None)
        i = d.find('class="openBox"'); j = d.find('ラストオーダー', i)
        txt = clean(re.sub(r'<script[\s\S]*?</script>', '', d[i:j if j > i else i + 3000])) if i > 0 else ''
        notes = [s.strip() for s in re.findall(r'[^。 ]*(?:休業|閉店|オープン|移転|改装)[^。]*。?', txt.split('営業時間', 1)[-1])]
        stores.append({'name': name, 'address': addr, 'lat': lat, 'lng': lng, 'url': ROOT + l, 'note': ' '.join(dict.fromkeys(notes))[:300]})
print('公式の都道府県別件数の合計', declared)
save('tenya', stores, {'source': ROOT + '/shop/', 'declared': declared, 'coord': 'wgs84 (店舗ページのGoogleマップ埋め込みの値)', 'excluded': '天ぷらてんや（FKD宇都宮インターパーク店・川越野田店）と海外店'})
