"""山本屋総本家: 公式 yamamotoya.co.jp/shoplist/。営業時間の欄が休業を示すときは note に残す"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, strip_zip, save
SRC = 'https://yamamotoya.co.jp/shoplist/'
h = get(SRC)
rows = []
for b in h.split('shoplist-block')[1:]:
    n = re.search(r'<h3[^>]*>(.*?)</h3>', b, re.S); a = re.search(r'<dt>住所</dt>\s*<dd>(.*?)</dd>', b, re.S)
    if not n or not a: continue
    v = re.sub(r'<!--.*?-->', '', b, flags=re.S)
    o = re.search(r'<dt>営業時間</dt>\s*<dd>(.*?)</dd>', v, re.S)
    rows.append({'name': clean(n.group(1)), 'address': strip_zip(clean(a.group(1))), 'lat': None, 'lng': None, 'url': SRC, 'note': '休業' if o and '休業' in clean(o.group(1))[:12] else ''})
save('yamamotoya-sohonke', rows, {'coord': 'none', 'source': SRC, 'fetched': '2026-11-02'})
