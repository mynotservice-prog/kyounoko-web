"""伊達の牛たん本舗: 公式 dategyu.jp/restaurant/ のレストラン一覧"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, add_pref, save
SRC = 'https://www.dategyu.jp/restaurant/'
rows = [{'name': '伊達の牛たん本舗 ' + clean(n), 'address': add_pref(clean(a).split(' ナビを')[0]), 'lat': None, 'lng': None, 'url': SRC}
        for n, a in re.findall(r'<h4 class="restaurant-tt">(.*?)</h4>\s*<dl class="restaurant-spec">\s*<dt>住所</dt>\s*<dd>(.*?)</dd>', get(SRC), re.S)]
print([(r['name'], r['address']) for r in rows])
save('date-gyutan', rows, {'coord': 'none', 'source': SRC, 'fetched': '2026-11-02'})
