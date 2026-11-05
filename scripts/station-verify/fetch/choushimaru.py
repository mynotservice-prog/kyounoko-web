"""すし銚子丸: 公式店舗サイト（Yext）sitemap1.xml → 各店ページに埋め込まれた document。テイクアウト業態・他ブランドは除き、閉店表示は除く"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import urllib.parse
from _lib import get, clean, save
SM = 'https://stores.choushimaru.co.jp/sitemap1.xml'
urls = [u for u in re.findall(r'<loc>([^<]+)</loc>', get(SM)) if re.search(r'/\d+$', u)]
rows = []; sk = {'他ブランド': [], 'テイクアウト': [], '閉店': []}
for u in urls:
    p = get(u)
    d = json.loads(urllib.parse.unquote(re.search(r'decodeURIComponent\(["\']([^"\']+)["\']', p).group(1)))['document']
    b = d.get('c_brandName') or ''; fe = d.get('c_locationFeatures') or []
    if not b.startswith('すし銚子丸'): sk['他ブランド'].append(d['name']); continue
    if 'テイクアウト' in b: sk['テイクアウト'].append(d['name']); continue
    if any('閉店' in f for f in fe) or d.get('closed'): sk['閉店'].append(d['name']); continue
    a = d['address']; c = d.get('yextDisplayCoordinate') or d.get('geocodedCoordinate') or {}
    addr = clean(' '.join(x for x in [(a.get('region') or '') + (a.get('city') or '') + (a.get('sublocality') or '') + (a.get('line1') or ''), a.get('line2') or ''] if x))
    rows.append({'name': clean(d['name']), 'address': addr, 'lat': c.get('latitude'), 'lng': c.get('longitude'), 'url': u, 'note': ''})
print({k: v for k, v in sk.items()})
save('choushimaru', rows, {'coverage': 'all-official', 'coord': 'wgs84', 'source': 'https://stores.choushimaru.co.jp/'})
