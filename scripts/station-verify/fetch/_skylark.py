"""すかいらーく共通店舗検索: /api/point/?backend_filters=カテゴリ=<業態> で全国全店。"""
import json, sys, time, urllib.parse
from _geo_common import http, norm, write, log

S = 'https://store-info.skylark.co.jp/'

def fetch(slug, category):
    q = urllib.parse.quote(json.dumps({'conditions': [{'key': 'カテゴリ', 'is_extra': True, 'comparison': '=', 'value': category}]}, ensure_ascii=False))
    d = json.loads(http(S + 'api/point/?backend_filters=' + q, headers={'Referer': S}, ns='skylark'))
    assert len(d['items']) == d['total'], (len(d['items']), d['total'])
    today = time.strftime('%Y.%m.%d')
    rows = []; dropped = 0
    for p in d['items']:
        ef = p.get('extra_fields') or {}
        if ef.get('削除フラグ') == '1' or p.get('is_active') is False:
            dropped += 1; continue
        notes = []
        o, c = ef.get('開店日データ') or '', ef.get('閉店日データ') or ''
        if o > today: notes.append(f'開店予定 {o}')
        if c and c < '2049': notes.append(f'閉店予定 {c}')
        rows.append({'chain': slug, 'name': norm(p['name']), 'address': norm(p.get('address')),
                     'lat': p.get('latitude'), 'lng': p.get('longitude'),
                     'url': f'{S}map/{p["key"]}/', 'note': '、'.join(notes)})
    log(f'[{slug}] API total={d["total"]} 除外(削除/非アクティブ)={dropped}')
    return write(slug, rows, 'national', 'wgs84', {'source': S + 'api/point/?backend_filters=カテゴリ=' + category})
