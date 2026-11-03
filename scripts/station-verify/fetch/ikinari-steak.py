"""いきなり！ステーキ: 公式 /shopinfo/ の都道府県リンク → /store_pref/<県>/ の店舗カード。座標なし"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
SRC = 'https://ikinaristeak.com/shopinfo/'
prefs = list(dict.fromkeys(re.findall(r'store_pref/([a-z_-]+)', get(SRC))))
rows = {}
for p in prefs:
    for c in get(f'https://ikinaristeak.com/store_pref/{p}/').split('<div class="storeInfoEach ')[1:]:
        n = clean(re.search(r'<p class="storeEachTitleText">(.*?)</p>', c, re.S).group(1))
        a = re.search(r'<th>住所</th>\s*<td>(.*?)</td>', c, re.S); a = clean(a.group(1)) if a else ''
        a = re.sub(r'^〒?\s*\d{3}-?\d{4}\s*', '', a)
        rows[n + '|' + a] = {'name': n, 'address': a, 'lat': None, 'lng': None, 'url': f'https://ikinaristeak.com/store_pref/{p}/', 'note': ''}
print('県', len(prefs))
save('ikinari-steak', list(rows.values()), {'coverage': 'all-official', 'coord': 'none', 'source': SRC})
