"""NAVITIME製店舗検索 {site}api/proxy2/shop/list?limit=500&offset=N で全国全件（count.total と突き合わせ）。
座標は数百mずれることがあるので meta の coord は "unreliable"。"""
import json, re, time
from _geo_common import http, norm, write, log

SITES = {
    'yoshinoya': 'https://stores.yoshinoya.com/yoshinoya/',
    'matsuyafoods': 'https://pkg.navitime.co.jp/matsuyafoods/',
    'arcland': 'https://shop.arclandservice.co.jp/ae-shop/',
    'hanamaru': 'https://stores.hanamaruudon.com/hanamaru/',
    'doutor': 'https://shop.doutor.co.jp/doutor/',
}
PREF = re.compile(r'^(北海道|東京都|(?:京都|大阪)府|.{2,3}県)')

def list_all(sitekey, extra=''):
    site = SITES[sitekey]
    items = []; total = None; off = 0
    while True:
        d = json.loads(http(f'{site}api/proxy2/shop/list?limit=500&offset={off}{extra}',
                            headers={'Referer': site + 'spot/lists', 'Accept': 'application/json'}, ns='navitime-' + sitekey))
        total = d['count']['total']
        items += d['items']
        off += 500
        if len(items) >= total or not d['items']:
            break
    assert len(items) == total, (sitekey, len(items), total)
    return items

def cats(it):
    return [(c.get('code'), c.get('name')) for c in it.get('categories') or []]

def row(slug, sitekey, it, note=''):
    notes = [note] if note else []
    now = time.strftime('%Y-%m-%dT%H:%M:%S')
    fd, td = it.get('from_date') or '', it.get('to_date') or ''
    if fd[:19] > now: notes.append('開店予定 ' + fd[:10])
    if td and td[:4] < '2090': notes.append('閉店予定 ' + td[:10])
    if it.get('status') and it['status'] != 'normal': notes.append('status=' + it['status'])
    c = it.get('coord') or {}
    return {'chain': slug, 'name': norm(it['name']), 'address': norm(it.get('address_name')),
            'lat': c.get('lat'), 'lng': c.get('lon'),
            'url': f'{SITES[sitekey]}spot/detail?code={it["code"]}', 'note': '、'.join(notes)}

def save(slug, sitekey, rows, extra=None):
    e = {'source': SITES[sitekey] + 'api/proxy2/shop/list?limit=500&offset=N'}
    e.update(extra or {})
    return write(slug, rows, 'national', 'unreliable', e)

def summary(sitekey):
    from collections import Counter
    items = list_all(sitekey)
    c = Counter(); st = Counter()
    for it in items:
        c[tuple(sorted(cats(it)))] += 1; st[it.get('status')] += 1
    log(sitekey, len(items), st)
    for k, v in c.most_common(): log('  ', v, k)
    return items
