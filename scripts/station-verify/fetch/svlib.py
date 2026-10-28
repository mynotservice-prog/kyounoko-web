"""共通部品（標準ライブラリのみ）。HTTPレスポンスを sv/cache/ に保存して再利用する。
再取得したいときは環境変数 SV_REFRESH=1 を付けるか、cache のファイルを消す。"""
import json, os, sys, time, urllib.request, urllib.error
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(BASE, 'cache'); STORES = os.path.join(BASE, 'stores')
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
PREFS = ['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県']

def get(url, cache_name, headers=None, data=None, sleep=1.0, ok404=False):
    """bytes を返す。cache_name は sv/cache/ 内のファイル名。"""
    p = os.path.join(CACHE, cache_name)
    if os.path.exists(p) and os.path.getsize(p) > 0 and not os.environ.get('SV_REFRESH'):
        return open(p, 'rb').read()
    h = {'User-Agent': UA, 'Accept-Language': 'ja,en;q=0.8'}
    if headers: h.update(headers)
    req = urllib.request.Request(url, headers=h, data=data)
    try:
        body = urllib.request.urlopen(req, timeout=60).read()
    except urllib.error.HTTPError as e:
        if ok404 and e.code == 404: body = e.read()
        else: raise
    os.makedirs(CACHE, exist_ok=True)
    open(p, 'wb').write(body)
    time.sleep(sleep)
    return body

def num(v):
    try:
        f = float(v)
        return f if f != 0 else None
    except (TypeError, ValueError):
        return None

def row(chain, name, address, lat=None, lng=None, url=None, note=''):
    return {'chain': chain, 'name': (name or '').strip(), 'address': (address or '').strip(),
            'lat': num(lat), 'lng': num(lng), 'url': url, 'note': note or ''}

# 県庁所在地のおおよその座標（公式座標の明らかな入力ミスを見つけるためだけに使う）
PREF_LL = [(43.06,141.35),(40.82,140.74),(39.70,141.15),(38.27,140.87),(39.72,140.10),(38.24,140.36),(37.75,140.47),(36.34,140.45),(36.57,139.88),(36.39,139.06),(35.86,139.65),(35.60,140.12),(35.69,139.69),(35.45,139.64),(37.90,139.02),(36.70,137.21),(36.59,136.63),(36.07,136.22),(35.66,138.57),(36.65,138.18),(35.39,136.72),(34.98,138.38),(35.18,136.91),(34.73,136.51),(35.00,135.87),(35.02,135.76),(34.69,135.52),(34.69,135.18),(34.69,135.83),(34.23,135.17),(35.50,134.24),(35.47,133.05),(34.66,133.93),(34.40,132.46),(34.19,131.47),(34.07,134.56),(34.34,134.04),(33.84,132.77),(33.56,133.53),(33.61,130.42),(33.25,130.30),(32.74,129.87),(32.79,130.74),(33.24,131.61),(31.91,131.42),(31.56,130.56),(26.21,127.68)]
PREF_LIMIT_KM = {'北海道': 450, '沖縄県': 500, '鹿児島県': 450, '長崎県': 220, '東京都': 200, '新潟県': 220, '島根県': 220}
def _km(a, b, c, d):
    import math
    p1, p2 = math.radians(a), math.radians(c)
    x = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(math.radians(d - b) / 2) ** 2
    return 12742 * math.asin(math.sqrt(x))

def null_bad_coords(rows):
    """公式座標が住所の都道府県から明らかに外れている行（入力ミス）は lat/lng を null にして note に残す。外した店名を返す"""
    bad = []
    for r in rows:
        if r['lat'] is None or r['lng'] is None: r['lat'] = r['lng'] = None; continue
        pi = next((i for i, p in enumerate(PREFS) if r['address'].startswith(p)), None)
        if pi is None: continue
        d = _km(r['lat'], r['lng'], *PREF_LL[pi])
        if d > PREF_LIMIT_KM.get(PREFS[pi], 170):
            bad.append({'name': r['name'], 'official_lat': r['lat'], 'official_lng': r['lng']})
            r['note'] = (r['note'] + '／' if r['note'] else '') + f"公式座標が住所と不一致のため null（公式値 {r['lat']},{r['lng']}）"
            r['lat'] = r['lng'] = None
    return bad

def save(slug, rows, meta=None):
    os.makedirs(STORES, exist_ok=True)
    bad = null_bad_coords(rows)
    if bad:
        meta = dict(meta or {}); meta['coord_nulled'] = bad
        print('公式座標の入力ミスとみて null にした:', [b['name'] for b in bad])
    json.dump(rows, open(os.path.join(STORES, slug + '.json'), 'w'), ensure_ascii=False, indent=1)
    mp = os.path.join(STORES, slug + '.meta.json')
    if meta: json.dump(meta, open(mp, 'w'), ensure_ascii=False, indent=1)
    elif os.path.exists(mp): os.remove(mp)
    nopref = sum(1 for r in rows if not r['address'].startswith(tuple(PREFS)))
    nocoord = sum(1 for r in rows if r['lat'] is None)
    print(f'{slug}: {len(rows)} 件 / 住所が都道府県で始まらない {nopref} / 座標なし {nocoord} / url なし {sum(1 for r in rows if not r["url"])}')

import re as _re
def _clean(s): return _re.sub(r'[\s　]+', ' ', s or '').strip()

def canly_company(company_id, source):
    """MEO Cloud（can-ly）企業型: 全店を1回で返す。source は店舗検索トップ（末尾 /）"""
    d = json.loads(get(f'https://g9ey9rioe.api.hp.can-ly.com/v2/companies/{company_id}/shops/search', f'canly_{company_id}.json', {'Referer': source}))
    if d.get('maxPage', 0) > 1: raise SystemExit(f'複数ページ maxPage={d["maxPage"]}')
    return d['shops']

def canly_directory(directory_id, source):
    """can-ly ディレクトリ型: Origin・Referer 必須。全ブランドを1回で返す"""
    origin = source.rstrip('/'); origin = origin[:origin.index('/', 8)] if '/' in origin[8:] else origin
    d = json.loads(get(f'https://api.site.can-ly.com/v2/directories/{directory_id}/shops/search', f'canlydir_{directory_id}.json', {'Origin': origin, 'Referer': source}))
    if d.get('maxPage', 0) > 1: raise SystemExit(f'複数ページ maxPage={d["maxPage"]}')
    return d['shops']

def canly_rows(chain, shops, detail_base, keep=lambda s: True, note=lambda s: ''):
    import collections, datetime
    today = datetime.date.today().isoformat()
    print('状態', dict(collections.Counter(s.get('businessStatus') or s.get('openStatus') for s in shops)),
          'ブランド', dict(collections.Counter((s.get('brand') or {}).get('name') for s in shops)))
    rows = []; dropped = []
    for s in shops:
        st = s.get('businessStatus') or s.get('openStatus') or ''
        if 'CLOSED_PERMANENTLY' in st or 'PERMANENTLY_CLOSED' in st: continue
        if not keep(s): continue
        n = [note(s)] if note(s) else []
        if 'TEMPORARILY' in st: n.append('一時休業')
        if st in ('IS_NOT_YET_OPEN', 'FUTURE_OPENING') or 'NOT_YET' in st: n.append('開店予定')
        od = s.get('openingDate') or s.get('establishmentDate')
        if od and od > today: n.append(f'開店予定 {od}')
        addr = _clean(s.get('address'))
        if not addr.startswith(tuple(PREFS)):   # 海外店・住所なしは除く（件数と例を表示）
            dropped.append((_clean(s['nameKanji']), addr[:30])); continue
        rows.append(row(chain, _clean(s['nameKanji']), addr, s.get('latitude'), s.get('longitude'),
                        f"{detail_base}detail/{s['storeCode']}/", '／'.join(n)))
    if dropped: print(f'住所が都道府県で始まらず除外 {len(dropped)} 件: {dropped[:400]}')
    return rows

def saintmarc(chain, brand):
    """サンマルクHD: POST /api/shop/search/<brand>/ に {"limit":N}。limit なしは20件で、offset は効かないので total と件数の一致を確かめる"""
    d = json.loads(get(f'https://www.saint-marc-hd.com/api/shop/search/{brand}/', f'saintmarc_{brand}.json',
                       {'Content-Type': 'application/json', 'Referer': f'https://www.saint-marc-hd.com/{brand}/shop/'}, data=b'{"limit":5000}'))['result']
    print('total', d['total'], 'data', len(d['data']))
    assert d['total'] == len(d['data']) and len({s['id'] for s in d['data']}) == len(d['data'])
    rows = []
    for s in d['data']:
        p = s.get('position') or {}
        rows.append(row(chain, _clean(s['name']), _clean(s['address']), p.get('lat'), p.get('lng'), 'https://www.saint-marc-hd.com' + s['url'] if s.get('url') else None))
    return rows

import html as _html
def datastore_rows(chain, url, cache_name, base, name_key, name_fix=None):
    """can-ly 旧型の店舗一覧（/all に全店の <div class="store" data-lat data-lon data-store="{JSON}"> が並ぶ）。
    個別URLはブロック内の最初の /detail/<番号> の href（data-store の id とは別の番号）。"""
    h = get(url, cache_name).decode('utf-8')
    blocks = _re.split(r'(?=<div class="store"[\s>])', h)[1:]
    assert len(blocks) == len(_re.findall(r'data-store=', h)), 'ブロック数と data-store 数が合わない'
    rows = []; seen = set()
    for b in blocks:
        ds = json.loads(_html.unescape(_re.search(r'data-store="([^"]*)"', b).group(1)))
        lat = _re.search(r'data-lat="([^"]*)"', b); lon = _re.search(r'data-lon="([^"]*)"', b)
        href = _re.search(r'href="([^"]*/detail/\d+)"', b)
        addr = _re.search(r'<div class="store__address">(.*?)</div>', b, _re.S)
        addr = _clean(_html.unescape(_re.sub(r'<[^>]+>', '', addr.group(1)))) if addr else ''
        name = _clean(ds[name_key]); note = ''
        if name_fix: name, note = name_fix(name)
        u = base + href.group(1) if href else None
        if u in seen: continue
        seen.add(u)
        rows.append(row(chain, name, addr, lat and lat.group(1), lon and lon.group(1), u, note))
    print('ブロック', len(blocks), '→ 行', len(rows))
    return rows

def bracket_fix(n):
    """店名の【…】（価格帯・休業・オープン予定など）を note に移す"""
    notes = _re.findall(r'【([^】]*)】', n)
    return _clean(_re.sub(r'【[^】]*】', '', n)), '／'.join(notes)
