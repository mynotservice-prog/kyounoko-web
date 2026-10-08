"""ゼンショー系 maps.<brand>/jp/api/search。
都道府県ごとに address=<都道府県> をPOST → 返ったセッションcookieで morelist=1700 をPOSTすると、その県の全店が
住所（list のHTML）と座標（mapdata）つきで返る。47都道府県の合計を、条件なし検索のヘッダ件数（全国の店舗数）と突き合わせる。"""
import html, json, re, urllib.parse
from _geo_common import http, norm, write, log

PREFS = ['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県']

def _search(base, addr, ns):
    H = {'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest', 'Referer': base + '/jp/index.html'}
    key = f'{base}|address={addr}|morelist=1700'
    try:
        return json.loads(http('', key=key, ns=ns, retries=0))  # キャッシュがあれば使う
    except Exception:
        pass
    body, h = http(base + '/jp/api/search', data=('address=' + urllib.parse.quote(addr)) if addr else '', headers=H, want_headers=True, cache=False)
    ck = (h.get('set-cookie') or '').split(';')[0]
    d = json.loads(body)
    m = re.search(r'検索結果：<strong>(\d+)</strong>', d['list'])
    if m and int(m.group(1)) > 50:
        assert ck, 'セッションcookieが取れない'
        body = http(base + '/jp/api/search', data='morelist=1700', headers=dict(H, Cookie=ck), key=key, ns=ns)
        return json.loads(body)
    import os, hashlib
    from _geo_common import CACHE
    os.makedirs(os.path.join(CACHE, ns), exist_ok=True)
    with open(os.path.join(CACHE, ns, hashlib.sha1(key.encode()).hexdigest() + '.txt'), 'w', encoding='utf-8') as f:
        f.write(body)
    return d

def _count(d):
    m = re.search(r'検索結果：<strong>(\d+)</strong>', d['list'])
    return int(m.group(1)) if m else 0

def _text(s):
    return norm(html.unescape(re.sub(r'<[^>]+>', ' ', s)))

def fetch(slug, base, brand):
    ns = 'zensho-' + slug
    nat = _count(_search(base, '', ns))
    rows = {}; other = {}; per = {}
    for pref in PREFS:
        d = _search(base, pref, ns)
        n = _count(d)
        geo = {m['link'].replace('//', '/'): m for m in d.get('mapdata') or []}
        lis = re.findall(r'<li>(.*?)</li>', d['list'], re.S)
        assert len(lis) == n, (pref, len(lis), n)
        k = 0
        for li in lis:
            href = re.search(r'href="(/jp)?(/detail/\d+\.html)"', li).group(2)
            h2 = _text(re.search(r'<h2>(.*?)</h2>', li, re.S).group(1))
            addr = _text(re.search(r'class="address">.*?<dd>(.*?)</dd>', li, re.S).group(1))
            g = geo.get(href) or {}
            b = g.get('brand') or h2.split(' ')[0]
            if not addr.startswith(pref):
                continue  # 別の県の住所に県名の文字列が含まれて当たったもの（その県の回で拾う）
            if b != brand:
                other[b] = other.get(b, 0) + 1; continue
            notes = [_text(x) for x in re.findall(r'<dd>(.*?)</dd>', li, re.S)]
            notes = [x for x in notes if re.search(r'一時閉店|閉店いた|閉店しま|閉店とな|休業いたして|休業中|オープン予定|開店予定|テイクアウト専門|持ち帰り専門', x) and not re.search(r'の間、休業いたします', x)]
            def f(v):
                try: return float(v)
                except Exception: return None
            rows[href] = {'chain': slug, 'name': h2, 'address': addr, 'lat': f(g.get('lat')), 'lng': f(g.get('lng')),
                          'url': base + '/jp' + href, 'note': ' / '.join(notes)}
            k += 1
        per[pref] = k
    log(f'[{slug}] 全国ヘッダ件数={nat} 都道府県別合計={len(rows)} 他ブランド={other}')
    extra = {'source': base + '/jp/api/search (address=都道府県 + morelist)', 'national_header_count': nat, 'other_brands_excluded': other,
             'by_pref': per}
    return write(slug, list(rows.values()), 'national', 'wgs84', extra)
