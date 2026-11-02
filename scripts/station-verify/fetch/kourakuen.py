"""幸楽苑: 公式店舗検索の都道府県別ページ store/search.html?action=prefSearch&pref=N。別業態（餃子の味よし等）は除く。フードコートはタグを note に残す"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
B = 'https://stores.kourakuen.co.jp'
prefs = sorted({int(x) for x in re.findall(r'action=prefSearch&(?:amp;)?pref=(\d+)', get(B + '/'))})
assert prefs
rows, other, seen = [], {}, set()
for p in prefs:
    h = get(f'{B}/store/search.html?action=prefSearch&pref={p}')
    for b in h.split('class="storeListItem"')[1:]:
        n = clean(re.search(r'class="storeListName[^"]*">(.*?)</p>', b, re.S).group(1))
        sid = re.search(r'href="info\.html\?id=(\d+)"', b).group(1)
        if sid in seen: continue
        seen.add(sid)
        if not n.startswith('幸楽苑'):
            k = n.split(' ')[0]; other[k] = other.get(k, 0) + 1; continue
        a = clean(re.search(r'<p class="c-smallText02 mb5">(.*?)</p>', b, re.S).group(1))
        tags = re.findall(r'class="storeListTagItem">([^<]+)<', b)
        rows.append({'name': n, 'address': a, 'lat': None, 'lng': None, 'url': f'{B}/store/info.html?id={sid}', 'note': 'フードコート' if 'フードコート' in tags else ''})
print('除いた別業態', other)
save('kourakuen', rows, {'coord': 'none', 'excluded_brands': other, 'source': B + '/', 'fetched': '2026-11-02'})
