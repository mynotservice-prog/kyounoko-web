"""ラーメン魁力屋: 公式 https://shop.kairikiya.co.jp/ の __NUXT_DATA__（build_data/stores_domestic）。ブランド=ラーメン魁力屋・open の店"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
SRC = 'https://shop.kairikiya.co.jp/'
h = get(SRC)
arr = json.loads(re.search(r'<script[^>]*id="__NUXT_DATA__"[^>]*>(.*?)</script>', h, re.S).group(1))
WRAP = {'Reactive', 'ShallowReactive', 'Ref', 'ShallowRef', 'EmptyRef', 'NuxtError'}
memo = {}
def rv(i):
    if i in memo: return memo[i]
    x = arr[i]
    if isinstance(x, list):
        if x and isinstance(x[0], str) and x[0] in WRAP:
            r = rv(x[1]) if len(x) > 1 and isinstance(x[1], int) else None
        else:
            r = []; memo[i] = r
            r.extend(rv(j) if isinstance(j, int) else j for j in x)
            return r
    elif isinstance(x, dict):
        r = {}; memo[i] = r
        for k, v in x.items(): r[k] = rv(v) if isinstance(v, int) else v
        return r
    else: r = x
    memo[i] = r
    return r
sys.setrecursionlimit(100000)
al = rv(0)['data']['build_data/stores_domestic']
import collections
print(len(al), collections.Counter((x.get('brand') or {}).get('name') for x in al), collections.Counter(x.get('open') for x in al), json.dumps(al[0]['address'], ensure_ascii=False)[:300])
rows = []
for x in al:
    if (x.get('brand') or {}).get('name') != 'ラーメン魁力屋': continue
    a = x.get('address') or {}
    addr = clean(''.join(a.get('lines') or []))
    note = '' if x.get('open') == 'open' else ('開店予定' if x.get('open') == 'before_open' else f"状態 {x.get('open')}")
    rows.append({'name': clean(x['name']), 'address': addr, 'lat': a.get('latitude'), 'lng': a.get('longitude'), 'url': f"{SRC}{x['id']}", 'note': note})
save('kairikiya', rows, {'coverage': 'national', 'coord': 'unreliable', 'source': SRC, 'coord_hint': '住所の位置との差が中央値232m（2026-11-02 首都圏75店）なので住所を優先'})
