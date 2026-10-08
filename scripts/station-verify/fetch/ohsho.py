"""餃子の王将: 公式店舗検索（Mapion系）の全件一覧（20件×ページ、店名・住所）→ 各店舗ページで座標。"""
import re, sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save, strip_zip
from _mapion_detail import latlng
HOST = 'https://map.ohsho.co.jp'
LIST = HOST + '/b/ohsho/attr/?t=attr_con'
first = get(f'{LIST}&start=1')
total = max(int(x) for x in re.findall(r'(\d+)件', first))
stores, seen = [], set()
for p in range(1, math.ceil(total / 20) + 1):
    html = first if p == 1 else get(f'{LIST}&start={p}')
    new = 0
    for b in html.split('<div class="shopBlock')[1:]:
        m = re.search(r'<h3 class="shopName"><a href="(/b/ohsho/info/\d+/)">([\s\S]*?)</a>', b)
        if not m or m.group(1) in seen: continue
        seen.add(m.group(1)); new += 1
        am = re.search(r'<span>住所</span></h4>\s*<div class="detail">\s*<p class="paragraph01">([\s\S]*?)</p>', b)
        url = HOST + m.group(1)
        lat, lng = latlng(url)
        hm = re.search(r'<span>営業時間</span></h4>\s*<div class="detail">\s*<p class="paragraph01">([\s\S]*?)</p>', b)
        hours = clean(hm.group(1)) if hm else ''
        note = hours if re.search(r'臨時休業|閉店(?!時)|オープン予定|改装|移転', hours) else ''
        nm = clean(m.group(2))
        if not nm.startswith('餃子の王将'): note = (note + ' 別業態の店名表記（' + nm.split(' ')[0] + ' ' + nm.split(' ')[1] + '）。公式の餃子の王将 店舗検索に掲載').strip() if nm.startswith('GYOZA OHSHO') else note
        stores.append({'name': clean(m.group(2)), 'address': strip_zip(clean(am.group(1))) if am else '', 'lat': lat, 'lng': lng, 'url': url, 'note': note[:200]})
    if not new: break
print('公式の件数表示', total)
assert len(stores) == total, (len(stores), total)
save('ohsho', stores, {'source': LIST, 'declared': total, 'coord': 'wgs84 (Mapion系店舗検索の店舗ページ)'})
