"""日高屋: 公式店舗検索の一覧（店名のみ・ブランド「日高屋」）→ 各店舗ページの所在地（〒行）と地図の座標（gIdo/gKeido）。
所在地に都道府県が無いので、郵便番号の上2桁から都道府県を補う（出店は関東のみ）。"""
import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
BASE = 'https://hidakaya.hiday.co.jp/hits/ja/shop/1/'
ZIP2 = {}
for a, b, p in [(10, 20, '東京都'), (21, 25, '神奈川県'), (26, 29, '千葉県'), (30, 31, '茨城県'), (32, 32, '栃木県'), (33, 36, '埼玉県'), (37, 37, '群馬県'), (40, 40, '山梨県'), (41, 43, '静岡県'), (38, 39, '長野県'), (96, 97, '福島県'), (98, 98, '宮城県')]:
    for i in range(a, b + 1): ZIP2[i] = p
lst = get(BASE + 'list.html')
items = [(a, clean(b)) for a, b in re.findall(r'<a href="\./detail/(\d+)\.html[^"]*">([\s\S]*?)</a>', lst)]
items = list(dict.fromkeys(items))
stores, unknown = [], []
for sid, name in items:
    if not name.startswith('日高屋'): continue  # 別ブランドは除く
    url = f'{BASE}detail/{sid}.html'
    d = get(url, delay=1.2)
    m = re.search(r'<th>所在地</th>\s*<td>([\s\S]*?)</td>', d)
    raw = clean(m.group(1)) if m else ''
    z = re.search(r'〒\s*(\d{3})-?(\d{4})', raw)
    addr = re.sub(r'^〒\s*\d{3}-?\d{4}\s*', '', raw)
    pref = ZIP2.get(int(z.group(1)[:2])) if z else None
    if pref and not addr.startswith(pref): addr = pref + addr
    if not pref: unknown.append((name, raw))
    la = re.search(r'var gIdo = ([\d.]+)', d); lo = re.search(r'var gKeido = ([\d.]+)', d)
    lat = float(la.group(1)) if la else None; lng = float(lo.group(1)) if lo else None
    if lat is not None and not (20 < lat < 46 and 122 < lng < 154): lat = lng = None
    bm = re.search(r'<th>備考</th>\s*<td[^>]*>([\s\S]*?)</td>', d)
    note = clean(re.sub(r'<!--[\s\S]*?-->', '', bm.group(1))) if bm else ''
    title = re.search(r'<title>([^|<]+)', d)
    if title and clean(title.group(1)) != name: note = (note + ' 店舗ページの店名: ' + clean(title.group(1))).strip()
    stores.append({'name': re.sub(r'\s+', ' ', name), 'address': addr, 'lat': lat, 'lng': lng, 'url': url, 'note': note})
print('都道府県を補えなかった:', unknown)
save('hidakaya', stores, {'source': BASE + 'list.html', 'coord': 'wgs84 (店舗ページの地図ピン。Googleマップ用の値)', 'address_note': '都道府県は郵便番号の上2桁から補完（公式の所在地は市区町村始まり）'})
