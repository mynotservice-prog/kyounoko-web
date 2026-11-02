"""牧のうどん: 公式「店舗住所」ページ cont6/main.html の一覧。トップに「全１８店舗」。座標なし"""
import os, re, sys, unicodedata
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
SRC = 'https://www.makinoudon.jp/cont6/main.html'
h = get(SRC)
t = clean(re.sub(r'<script.*?</script>', '', h, flags=re.S))
t = t[t.index('店舗住所及び電話番号'):]
top = unicodedata.normalize('NFKC', get('https://www.makinoudon.jp/'))
official = int(re.search(r'全(\d+)店舗', top).group(1))
FUKUOKA = ('糸島市', '太宰府市', '春日市', '糟屋郡')
SAGA = ('鳥栖市',)
rows = []
for m in re.finditer(r'●\s*(\S+店)\s+(.+?)\s*TEL', t):
    n, a = m.group(1), clean(m.group(2))
    if a.startswith(FUKUOKA): a = '福岡県' + a
    elif a.startswith('福岡市'): a = '福岡県' + a
    elif a.startswith(SAGA): a = '佐賀県' + a
    rows.append({'name': '牧のうどん ' + n, 'address': a, 'lat': None, 'lng': None, 'url': SRC})
print([(r['name'], r['address']) for r in rows])
assert len(rows) == official, (len(rows), official)
save('makino-udon', rows, {'coord': 'none', 'official_total': official, 'official_total_source': 'トップの「全１８店舗」', 'address_note': '公式の住所は福岡県・佐賀県の一部で県名が省略されているので市名から補った', 'source': SRC, 'fetched': '2026-11-02'})
