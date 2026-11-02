"""安楽亭: 公式 /map/result/（全店が1ページ・「○件の店舗が見つかりました」あり）。住所に都県が無いので国土地理院の住所検索で都県だけ補う。座標なし"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import urllib.parse, unicodedata
from _lib import get, clean, save, PREFS
SRC = 'https://anrakutei.jp/map/result/'
h = get(SRC)
total = int(re.search(r'(\d+)件の店舗が見つかりました', h).group(1))
def pref(a):
    r = json.loads(get('https://msearch.gsi.go.jp/address-search/AddressSearch?q=' + urllib.parse.quote(unicodedata.normalize('NFKC', a)), delay=0.3))
    t = [x['properties']['title'] for x in r if x['properties']['title'].startswith(tuple(PREFS))]
    return next((p for p in PREFS if t and t[0].startswith(p)), '')
rows = []
for b in h.split('<li class="list"')[1:]:
    b = re.sub(r'<!--.*?-->', '', b, flags=re.S)
    n = clean(re.search(r'<p class="title">(.*?)</p>', b, re.S).group(1))
    a = clean(re.search(r'住所 ： ([^<]+)<', b).group(1))
    if not a.startswith(tuple(PREFS)): a = pref(a) + a
    rows.append({'name': n, 'address': a, 'lat': None, 'lng': None, 'url': SRC, 'note': ''})
print('公式', total, '取得', len(rows))
assert total == len(rows)
save('anrakutei', rows, {'coverage': 'all-official', 'coord': 'none', 'source': SRC, 'official_total': total, 'pref_hint': '都県は住所検索で補った（公式の住所は都県なし）'})
