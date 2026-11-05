"""スガキヤ: 公式 sugakico.co.jp のサイトマップ wp-sitemap-posts-area-1.xml の店舗ページ。店舗ページのブランドのロゴ画像でスガキヤとラーメンスガキヤを判定する"""
import os, re, sys, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
B = 'https://www.sugakico.co.jp/'
urls = re.findall(r'<loc>([^<]*)</loc>', get(B + 'wp-sitemap-posts-area-1.xml'))
rows, brands = [], collections.Counter()
for u in urls:
    h = get(u, allow_status=(404,))
    lg = re.search(r'<img[^>]*store-brand-logo[^>]*|class="store-brand-logo"[^>]*', h).group(0)
    br = re.sub(r'.*src="[^"]*/([^"/]+)".*', r'\1', lg)
    brands[br] += 1
    if 'sugakiya' not in br: continue   # きむらや・たこ寿・金寿・一徳庵・スーちゃんハウスは除く
    n = clean(re.search(r'class="store-name">(.*?)</h2>', h, re.S).group(1))
    a = clean(re.search(r'<dt>住所</dt>\s*<dd>(.*?)</dd>', h, re.S).group(1))
    rows.append({'name': 'スガキヤ ' + n, 'address': a, 'lat': None, 'lng': None, 'url': u, 'note': '閉店' if '閉店' in n else ''})
print(brands)
save('sugakiya', rows, {'coord': 'none', 'sitemap_stores_all_brands': len(urls), 'brands': dict(brands), 'source': B + 'shop/', 'fetched': '2026-11-02'})
