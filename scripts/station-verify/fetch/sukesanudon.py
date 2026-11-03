"""資さんうどん: 公式 sukesanudon.com/map/（20件ずつ）。カードに店名・住所。一覧の「N件」と突き合わせる"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, strip_zip, save
SRC = 'https://www.sukesanudon.com/map/'
first = get(SRC)
official = max(int(x) for x in re.findall(r'(\d+)件', clean(first)))
pages = max([1] + [int(x) for x in re.findall(r'/map/page/(\d+)/', first)])
rows, seen = [], set()
for p in range(1, pages + 1):
    h = first if p == 1 else get(f'{SRC}page/{p}/')
    for u, b in re.findall(r'<a href="(https://www\.sukesanudon\.com/map/branch/[^"/]+/)" class="archiveList__link">(.*?)archiveList__hours', h, re.S):
        if u in seen: continue
        seen.add(u)
        n = clean(re.search(r'archiveList__title">(.*?)</h2>', b, re.S).group(1))
        a = strip_zip(clean(re.search(r'archiveList__address">(.*?)</p>', b, re.S).group(1)))
        rows.append({'name': n, 'address': a, 'lat': None, 'lng': None, 'url': u})
print('一覧の件数', official, '取得', len(rows))
assert official == len(rows)
save('sukesanudon', rows, {'coord': 'none', 'official_total': official, 'official_total_source': '一覧の件数表示', 'source': SRC, 'fetched': '2026-11-02'})
