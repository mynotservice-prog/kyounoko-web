"""味の民芸: 公式 /shop/ の都県別ページ /area_cat/<県>/ の表。住所に都県が無いのでページの県を前に付ける。座標なし"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
SRC = 'https://www.ajino-mingei.co.jp/shop/'
P = {'okayama': '岡山県', 'tokyo': '東京都', 'kanagawa': '神奈川県', 'chiba': '千葉県', 'tochigi': '栃木県', 'saitama': '埼玉県', 'ibaraki': '茨城県', 'gunma': '群馬県', 'yamanashi': '山梨県', 'shizuoka': '静岡県'}
top = get(SRC)
slugs = list(dict.fromkeys(re.findall(r'area_cat/([a-z]+)/', top)))
print(slugs)
rows = {}
for sl in slugs:
    h = get(f'https://www.ajino-mingei.co.jp/area_cat/{sl}/')
    for r in ''.join(h.split('<tbody>')[1:]).split('<tr>')[1:]:
        nm = re.search(r'<p class="storelst_storename">(.*?)</p>', r, re.S)
        if not nm: continue
        cells = re.findall(r'<td[^>]*>(.*?)</td>', r, re.S)
        u = re.search(r'href="([^"]+)"', nm.group(1))
        a = clean(re.sub(r'<p class="zipcode">.*?</p>', '', cells[1], flags=re.S))
        n = clean(re.sub(r'<!--.*?-->', '', nm.group(1), flags=re.S))
        if not a.startswith(P[sl]): a = P[sl] + a
        rows[n] = {'name': n, 'address': a, 'lat': None, 'lng': None, 'url': u.group(1) if u else SRC, 'note': ''}
save('ajinomingei', list(rows.values()), {'coverage': 'all-official', 'coord': 'none', 'source': SRC})
