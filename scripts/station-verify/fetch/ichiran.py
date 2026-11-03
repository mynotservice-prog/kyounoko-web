"""一蘭: 公式 ichiran.com/shop/ の国内店舗ページ。住所は表、座標は地図の ll=（Google Maps の値）"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, strip_zip, add_pref, num, save
SRC = 'https://ichiran.com/shop/'
urls = sorted(set(re.findall(r'href="(https://ichiran\.com/shop/[a-z]+/[a-z0-9_-]+/)"', get(SRC))))
rows, skip = [], []
for u in urls:
    if re.search(r'/(testshop|oversea)/', u): continue
    h = get(u, allow_status=(404,))
    m = re.search(r'<th>住所</th>\s*<td>(.*?)</td>', h, re.S)
    if not m: skip.append(u); continue
    parts = [clean(x) for x in re.split(r'<br\s*/?>', m.group(1))]
    parts = [x for x in parts if x and not x.startswith(('[', '※')) ]
    a = ' '.join(x for x in parts if not re.fullmatch(r'〒?\d{3}-?\d{4}', x))
    ll = re.search(r'(?:ll|destination)=([\d.]+),([\d.]+)', h)
    t = clean(re.search(r'<title>(.*?)</title>', h, re.S).group(1)).split('｜')[0]
    note = '閉店' if re.search(r'閉店いたしました|閉店しました', h) else ''   # 「オープン予定」は過去の告知が残っている店があるので使わない
    rows.append({'name': t if t.startswith('一蘭') else '一蘭 ' + t, 'address': add_pref(strip_zip(a)), 'lat': num(ll.group(1)) if ll else None, 'lng': num(ll.group(2)) if ll else None, 'url': u, 'note': note})
print('住所の表なし', skip)
save('ichiran', rows, {'coord': 'wgs84（店舗ページの地図の ll=。小数4桁で約10m単位）', 'source': SRC, 'fetched': '2026-11-02'})
