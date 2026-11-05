"""共通部品: キャッシュ付きHTTP取得とJSON保存（標準ライブラリのみ）"""
import hashlib, json, os, re, ssl, sys, time, urllib.request, urllib.error, urllib.parse, html as _html, gzip

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'cache')
STORES = os.path.join(ROOT, 'stores')
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'
_last = {}

PREFS = ['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県']

SEIREI = {'札幌市':'北海道','仙台市':'宮城県','さいたま市':'埼玉県','千葉市':'千葉県','横浜市':'神奈川県','川崎市':'神奈川県','相模原市':'神奈川県','新潟市':'新潟県','静岡市':'静岡県','浜松市':'静岡県','名古屋市':'愛知県','京都市':'京都府','大阪市':'大阪府','堺市':'大阪府','神戸市':'兵庫県','岡山市':'岡山県','広島市':'広島県','北九州市':'福岡県','福岡市':'福岡県','熊本市':'熊本県'}

def add_pref(addr):
    """都道府県が落ちている住所に、政令指定都市名から都道府県を補う（補えなければそのまま）"""
    if any(addr.startswith(p) for p in PREFS): return addr
    for c, p in SEIREI.items():
        if addr.startswith(c): return p + addr
    return addr

def get(url, headers=None, data=None, delay=1.0, key=None, allow_status=(), encoding='utf-8', retries=2, refresh=False):
    """URLを取得して文字列で返す。cache/ に保存し、2回目以降は再利用する。"""
    k = key or (url + ('|' + (data if isinstance(data, str) else data.decode()) if data else ''))
    fn = os.path.join(CACHE, hashlib.sha1(k.encode()).hexdigest()[:16] + '_' + re.sub(r'[^A-Za-z0-9._-]+', '_', urllib.parse.urlparse(url).netloc + urllib.parse.urlparse(url).path)[:80])
    if os.path.exists(fn) and not refresh and not os.environ.get('SV_REFRESH'):
        return open(fn, encoding='utf-8').read()
    host = urllib.parse.urlparse(url).netloc
    h = {'User-Agent': UA, 'Accept-Language': 'ja,en;q=0.8', 'Accept': '*/*'}
    h.update(headers or {})
    body = data.encode() if isinstance(data, str) else data
    for i in range(retries + 1):
        w = _last.get(host, 0) + delay - time.time()
        if w > 0: time.sleep(w)
        _last[host] = time.time()
        try:
            req = urllib.request.Request(url, data=body, headers=h)
            try:
                r = urllib.request.urlopen(req, timeout=40)
                raw = r.read(); enc = r.headers.get('Content-Encoding')
            except urllib.error.HTTPError as e:
                if e.code in allow_status:
                    raw = e.read(); enc = e.headers.get('Content-Encoding')
                else:
                    raise
            if enc == 'gzip': raw = gzip.decompress(raw)
            txt = raw.decode(encoding, errors='replace')
            os.makedirs(CACHE, exist_ok=True)
            open(fn, 'w', encoding='utf-8').write(txt)
            return txt
        except Exception as e:
            if i >= retries: raise
            time.sleep(2 * (i + 1))

def clean(s):
    s = re.sub(r'<br\s*/?>', ' ', s or '')
    s = re.sub(r'<[^>]+>', '', s)
    return re.sub(r'\s+', ' ', _html.unescape(s)).replace('　', ' ').strip()

def strip_zip(a):
    return re.sub(r'^\s*〒?\s*\d{3}[-‐－ー]?\d{4}\s*', '', a or '').strip()

def num(v):
    try:
        f = float(v)
        return f if f == f else None
    except Exception:
        return None

def save(slug, stores, meta=None):
    os.makedirs(STORES, exist_ok=True)
    out = []
    for s in stores:
        la, lo = s.get('lat'), s.get('lng')
        if la is None or lo is None or not (20 < la < 46 and 122 < lo < 154):
            if la is not None or lo is not None: print('  座標を null に:', s['name'], la, lo)
            s = dict(s, lat=None, lng=None)
        out.append({'chain': slug, 'name': s['name'], 'address': s.get('address') or '', 'lat': s.get('lat'), 'lng': s.get('lng'), 'url': s.get('url'), 'note': s.get('note') or ''})
    json.dump(out, open(os.path.join(STORES, slug + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    if meta:
        json.dump(meta, open(os.path.join(STORES, slug + '.meta.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    nopref = sum(1 for s in out if not any(s['address'].startswith(p) for p in PREFS))
    print(f'{slug}: {len(out)}件 / 座標あり {sum(1 for s in out if s["lat"] is not None)} / URLあり {sum(1 for s in out if s["url"])} / 住所が都道府県始まりでない {nopref}')
    return out
