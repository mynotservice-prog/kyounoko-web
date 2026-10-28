"""ロッテリア・ゼッテリア: 公式店舗検索 maps.zetteria.jp（lotteria.jp はここへ転送される）に都道府県番号をPOST → 店舗ページで座標。
一覧・店舗ページとも店名にブランド表記は無く、サイト全体が「ゼッテリア」名義。"""
import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save, strip_zip, PREFS
HOST = 'https://maps.zetteria.jp'
stores, seen = [], set()
for n in range(1, 48):
    t = get(HOST + '/shop/', data=f'search_type=pref&pref={n}', headers={'Content-Type': 'application/x-www-form-urlencoded', 'Referer': HOST + '/'}, key=f'zetteria-pref-{n}')
    for b in t.split('<li class="list-block">')[1:]:
        m = re.search(r'href="(/shop/shop\d+\.html)"', b)
        if not m or m.group(1) in seen: continue
        seen.add(m.group(1))
        name = clean(re.search(r'<h4 class="name">([\s\S]*?)</h4>', b).group(1))
        am = re.search(r'<p class="add">([\s\S]*?)</p>', b)
        addr = strip_zip(clean(am.group(1))) if am else ''
        if addr and not addr.startswith(PREFS[n - 1]): addr = PREFS[n - 1] + addr
        url = HOST + m.group(1)
        d = get(url)
        g = re.search(r'maps\.google\.com/maps\?q=(-?[\d.]+),(-?[\d.]+)', d)
        lat, lng = (float(g.group(1)), float(g.group(2))) if g else (None, None)
        tm = re.search(r'<title>([^｜<]+)｜店舗情報｜([^<]+)</title>', d)
        brand = clean(tm.group(2)) if tm else ''
        note = f'ブランド: {brand}（公式サイトの名義。店名自体にブランド表記なし）' if brand else ''
        txt = clean(re.sub(r'<(script|style)[\s\S]*?</\1>', '', d))
        info = txt[txt.find('SHOP INFO'):txt.find('お問い合わせはこちら')]
        ex = re.findall(r'[^ ]*(?:閉店(?:いたし|予定|しま|のお知らせ|となり)|オープン|改装|臨時休業|移転)[^ ]*', info)
        if ex: note += ' / ' + ' '.join(ex)
        stores.append({'name': name, 'address': addr, 'lat': lat, 'lng': lng, 'url': url, 'note': note})
save('lotteria', stores, {'source': HOST + '/shop/ (POST search_type=pref&pref=1..47)', 'coord': 'wgs84 (店舗ページのGoogleマップ埋め込みの値)', 'brand': '公式サイトは全店ゼッテリア名義。ロッテリア表記の店は一覧に無い'})
