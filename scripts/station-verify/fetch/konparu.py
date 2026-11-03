"""コンパル: 公式 www.konparu.co.jp/shop/（名古屋市内の店舗）。HTMLコメント内のメイチカ店は掲載外"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, add_pref, save
SRC = 'https://www.konparu.co.jp/shop/'
h = re.sub(r'<!--.*?-->', ' ', get(SRC), flags=re.S)
t = clean(re.sub(r'<script.*?</script>|<style.*?</style>', ' ', h, flags=re.S))
official = int(re.search(r'名古屋市内に(\d+)店舗', t).group(1))
rows = [{'name': 'コンパル ' + n, 'address': add_pref(re.sub(r' (大須新天地|地下鉄|今池駅|御器所交差点).*$', '', a)), 'lat': None, 'lng': None, 'url': SRC}
        for n, a in re.findall(r'(\S+店) 住所 (.+?) 電話番号', t)]
print([(r['name'], r['address']) for r in rows])
assert len(rows) == official, (len(rows), official)
save('konparu', rows, {'coord': 'none', 'official_total': official, 'official_total_source': '「名古屋市内に7店舗」', 'source': SRC, 'fetched': '2026-11-02'})
