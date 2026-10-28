"""地点検索型チェーン（すかいらーく・ゼンショー・NAVITIME・KFC）用の共通処理。標準ライブラリのみ。
（同じディレクトリの _lib.py / svlib.py は別担当のもの。こちらは独立）"""
import hashlib, json, os, re, sys, time, urllib.request, urllib.parse, urllib.error

SV = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(SV, 'cache')
STORES = os.path.join(SV, 'stores')
UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) '
      'Chrome/128.0 Safari/537.36 kyounoko-store-ledger/1.0 (+https://kyounoko.jp/contact)')
_last = {}

def log(*a):
    print(*a, file=sys.stderr, flush=True)

def http(url, data=None, headers=None, key=None, delay=0.6, retries=3, ns='misc', want_headers=False, cache=True):
    """GET/POST。レスポンス本文を cache/<ns>/<sha1>.txt に保存し、あれば再利用する。"""
    k = key or (url + ('\n' + data if data else ''))
    d = os.path.join(CACHE, ns)
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, hashlib.sha1(k.encode()).hexdigest() + '.txt')
    if cache and os.path.exists(p) and not want_headers:
        with open(p, encoding='utf-8') as f:
            return f.read()
    host = urllib.parse.urlsplit(url).netloc
    for i in range(retries + 1):
        w = _last.get(host, 0) + delay - time.time()
        if w > 0:
            time.sleep(w)
        _last[host] = time.time()
        try:
            h = {'User-Agent': UA, 'Accept-Language': 'ja'}
            h.update(headers or {})
            req = urllib.request.Request(url, data=data.encode() if data is not None else None, headers=h)
            with urllib.request.urlopen(req, timeout=60) as r:
                body = r.read().decode('utf-8', 'replace')
                hdrs = r.headers
            if cache:
                with open(p, 'w', encoding='utf-8') as f:
                    f.write(body)
            return (body, hdrs) if want_headers else body
        except urllib.error.HTTPError as e:
            if e.code in (400, 404):
                raise
            err = e
        except Exception as e:
            err = e
        if i >= retries:
            raise err
        time.sleep(2 * (i + 1))

B32 = '0123456789bcdefghjkmnpqrstuvwxyz'
def geohash(lat, lon, precision):
    la, lo = [-90.0, 90.0], [-180.0, 180.0]
    bit = ch = 0; even = True; out = ''
    while len(out) < precision:
        if even:
            mid = sum(lo) / 2
            if lon >= mid: ch = ch * 2 + 1; lo[0] = mid
            else: ch *= 2; lo[1] = mid
        else:
            mid = sum(la) / 2
            if lat >= mid: ch = ch * 2 + 1; la[0] = mid
            else: ch *= 2; la[1] = mid
        even = not even
        bit += 1
        if bit == 5:
            out += B32[ch]; bit = ch = 0
    return out

def japan_cells(precision=2):
    s = set()
    lat = 24.0
    while lat <= 46:
        lon = 122.0
        while lon <= 154:
            s.add(geohash(lat, lon, precision)); lon += 0.5
        lat += 0.5
    return sorted(s)

def norm(s):
    return re.sub(r'[\s　]+', ' ', s or '').strip()

def stations():
    with open(os.path.join(SV, 'stations.json'), encoding='utf-8') as f:
        return json.load(f)

_FAC = re.compile(r'(病院|医療センター|医大|医科大学|大学|県庁|道庁|都庁|府庁|市役所|区役所|合同庁舎|駐屯地|基地|キャンパス|競馬場|競輪場|ボートレース|空港)(?!前|駅|通|入口|口|東|西|南|北|町|橋|線)[^前駅]{0,8}店')

def write(slug, rows, coverage, coord, extra=None):
    seen = set(); out = []
    for r in rows:
        k = (r['name'], r.get('address') or '', r.get('url') or '')
        if k in seen: continue
        seen.add(k)
        # 店名からの推定（公式の区分ではない）。病院・大学・官公庁などの中にある店は一般客が入れない場合がある
        m = _FAC.search(r['name'])
        if m and not re.search(r'(学芸|都立)大学店', r['name']) and '施設内' not in (r.get('note') or ''):
            r['note'] = '、'.join([x for x in [r.get('note'), f'施設内の可能性（店名に「{m.group(1)}」・未確認）'] if x])
        out.append(r)
    out.sort(key=lambda r: (r.get('address') or '', r['name']))
    with open(os.path.join(STORES, slug + '.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    meta = {'coverage': coverage, 'coord': coord, 'count': len(out), 'fetched': time.strftime('%Y-%m-%d')}
    meta.update(extra or {})
    with open(os.path.join(STORES, slug + '.meta.json'), 'w', encoding='utf-8') as f:
        json.dump(meta, f, ensure_ascii=False, indent=1)
    log(f'[{slug}] {len(out)} 件 coverage={coverage} coord={coord}')
    return out
