"""各チェーンの url を5件ずつ開き、HTTP 200 と店名が本文に含まれるかを確かめる（結果は cache/verify_*.html に保存）"""
import sys, os, json, re, hashlib, unicodedata, html
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import *
import urllib.error
def norm(s): return re.sub(r'[\s　]+', '', unicodedata.normalize('NFKC', html.unescape(s)))
MINE = 'mcdonalds mos-burger komeda cocoichi denny-s tully-coffee kura-sushi gyukaku onyasai ootoya freshness-burger royal-host pronto ringer-hut kushikatsu-tanaka kappa-sushi yakiniku-king saint-marc-cafe kamakura-pasta'.split()
slugs = sys.argv[1:] or MINE
for slug in slugs:
    rows = [r for r in json.load(open(os.path.join(STORES, slug + '.json'))) if r['url']]
    if not rows: print(slug, 'url なし'); continue
    n = len(rows); picks = [rows[i] for i in sorted({0, n // 4, n // 2, 3 * n // 4, n - 1})]
    res = []
    for r in picks:
        try:
            u = r['url']
            if slug == 'komeda':  # 店舗ページは SPA なので、ページが呼ぶ個別APIで店名を確かめる
                u = 'https://eu.komeda.co.jp/v1/hp/shop/' + u.split('id=')[1]
            body = get(u, 'verify_' + hashlib.md5(r['url'].encode()).hexdigest()[:12] + '.html', {'Origin': 'https://www.komeda.co.jp', 'Referer': 'https://www.komeda.co.jp/'} if slug == 'komeda' else None).decode('utf-8', 'replace')
            core = norm(r['name']); short = norm(re.split(r'[ 　]', r['name'].strip())[-1])
            ok = core in norm(body) or (len(short) >= 3 and short in norm(body))
            res.append(('200', 'OK' if ok else '店名なし', r['name'], r['url']))
        except urllib.error.HTTPError as e:
            res.append((str(e.code), 'NG', r['name'], r['url']))
        except Exception as e:
            res.append(('ERR', str(e)[:40], r['name'], r['url']))
    good = sum(1 for x in res if x[1] == 'OK')
    print(f'{slug}: {good}/{len(res)}', [x for x in res if x[1] != 'OK'], flush=True)
