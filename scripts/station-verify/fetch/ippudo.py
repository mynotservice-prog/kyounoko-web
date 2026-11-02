"""一風堂: 公式 stores.ippudo.com（サイトマップの数字パス＝国内の日本語ページ）。JSON-LD に住所と座標"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, num, save
B = 'https://stores.ippudo.com/'
ids = sorted(set(re.findall(r'<loc>https://stores\.ippudo\.com/(\d+)</loc>', get(B + 'sitemap1.xml'))))
rows = []
for i in ids:
    h = get(B + i, allow_status=(404, 410))
    m = re.search(r'"address":\{"@type":"PostalAddress","addressCountry":"(\w+)","addressLocality":"(.*?)","addressRegion":"(.*?)","postalCode":".*?","streetAddress":"(.*?)"\}.*?"latitude":([\d.]+),"longitude":([\d.]+)\},"name":"(.*?)"', h)
    if not m: print('解析不可', i); continue
    assert m.group(1) == 'JP', i
    st = clean(m.group(4).replace('\\n', ' '))
    rows.append({'name': clean(m.group(7)), 'address': m.group(3) + m.group(2).rstrip(', ') + st, 'lat': num(m.group(5)), 'lng': num(m.group(6)), 'url': B + i, 'note': '閉店' if '閉店' in clean(h)[:3000] else ''})
save('ippudo', rows, {'coord': 'wgs84（JSON-LD geo）', 'source': B, 'sitemap_ja_pages': len(ids), 'fetched': '2026-11-02'})
