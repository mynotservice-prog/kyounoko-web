"""味の牛たん喜助: 公式 kisuke.co.jp/store-list/ の店舗（各店ページ）。きぐし・きすけ・お土産処は別業態として含めない"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, strip_zip, add_pref, save
B = 'https://www.kisuke.co.jp/'
NAMES = {'ekimae_chuo': '駅前中央本店', 'minamimachidori': '南町通店', 'spal': 'エスパル店', 'jrsendaieki': 'JR仙台駅店', 'ichibancho': '一番町店', 'tomiya': '仙台富谷店', 'tokyo_yaesu': '東京駅八重洲北口店', 'lumineikebukuro': 'ルミネ池袋店', 'yokohama_mores': '横浜モアーズ店', 'yokohama': '横浜ランドマーク店', 'musashikosugi': 'グランツリー武蔵小杉店', 'osaka_umekita': '大阪うめきた店', 'nagoya': '名古屋店'}
SLUGS = list(NAMES)
rows = []
for s in SLUGS:
    h = get(f'{B}{s}/', allow_status=(404,))
    t = clean(re.sub(r'<script.*?</script>|<style.*?</style>', ' ', h, flags=re.S))
    m = re.search(r'(?:店舗情報|店舗です。)\s*住\s*所\s*(.+?)\s*TEL', t)
    a = m.group(1) if m else ''
    if a.startswith('富谷市'): a = '宮城県' + a
    print(s, '|', a or [t[max(0, x.start() - 20):x.end() + 60] for x in re.finditer(r'住\s*所|青葉区', t)][:3])
    rows.append({'name': '味の牛たん喜助 ' + NAMES[s], 'address': add_pref(strip_zip(a)), 'lat': None, 'lng': None, 'url': f'{B}{s}/'})
save('kisuke', rows, {'coord': 'none', 'official_total': len(SLUGS), 'official_total_source': 'store-list の「味の牛たん喜助」の店舗の数', 'source': B + 'store-list/', 'fetched': '2026-11-02'})
