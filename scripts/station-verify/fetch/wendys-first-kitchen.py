"""ウェンディーズ・ファーストキッチン: 公式 /shop/result.php?areaid=<エリア>（EUC-JP）で店を列挙し、map.php?shopid=<id>（UTF-8）で住所と座標を読む。
店名に【WFK】とある店だけ。開店日が先の店は新店舗情報から note に残す"""
import sys, os, re, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
SRC = 'https://wendys-firstkitchen.co.jp/shop/'
top = get(SRC, encoding='euc_jp')
areas = list(dict.fromkeys(re.findall(r'<option value="([a-z]+)"\s*>', top)))
today = datetime.date.today().isoformat(); soon = {}
for m in re.finditer(r'<dl>\s*<dt><h4>(.*?)</h4></dt>(.*?)shopid=(\d+)', top, re.S):
    d = re.search(r'(\d{4})年(\d{1,2})月(\d{1,2})日', m.group(2))
    if d and f'{d.group(1)}-{int(d.group(2)):02d}-{int(d.group(3)):02d}' > today: soon[m.group(3)] = d.group(0)
rows = {}; other = []
for a in areas:
    t = get(f'{SRC}result.php?areaid={a}', encoding='euc_jp')
    if 'class="result-pc"' not in t: print('結果の表なし', a); continue
    t = t[t.index('class="result-pc"'):]; t = t[:t.index('</table>')]
    for r in re.findall(r'<tr>.*?</tr>', t, re.S):
        n = re.search(r'class="shop-name"[^>]*>(.*?)</h4>', r, re.S); i = re.search(r'shopid=(\d+)', r)
        if not n or not i or i.group(1) in rows: continue
        name = clean(n.group(1))
        if '【WFK】' not in name: other.append(name); continue
        h = get(f'{SRC}map.php?shopid={i.group(1)}', key=f'wfk|{i.group(1)}|u8', encoding='utf-8')
        ad = re.search(r'<p id="address">(.*?)</p>', h, re.S); ll = re.search(r"LatLng\('([\d.]+)',\s*'([\d.]+)'", h)
        note = f'開店予定 {soon[i.group(1)]}' if i.group(1) in soon else ''
        rows[i.group(1)] = {'name': name, 'address': clean(ad.group(1)) if ad else '', 'lat': float(ll.group(1)) if ll else None, 'lng': float(ll.group(2)) if ll else None, 'url': f'{SRC}map.php?shopid={i.group(1)}', 'note': note}
print('エリア', areas, 'WFK以外', len(other), other[:5], '開店予定', soon)
save('wendys-first-kitchen', list(rows.values()), {'coverage': 'all-official', 'coord': 'wgs84', 'source': SRC})
