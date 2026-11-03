"""不二家レストラン: 公式「不二家レストラン 店舗一覧」（地方別5ページ）→ 各店の公式店舗検索ページ（Mapion系）で住所・座標・店のタイプ。
洋菓子店だけの店は一覧に載らない。"""
import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
SRC = 'https://www.fujiya-peko.co.jp/restaurant/shop-list/'
top = get(SRC)
regions = list(dict.fromkeys(re.findall(r'href="(/restaurant/shop-list/shop-[a-z]+/)"', top)))
assert len(regions) >= 5, regions
stores, seen = [], set()
for r in regions:
    html = re.sub(r'<!--[\s\S]*?-->', '', get('https://www.fujiya-peko.co.jp' + r))
    parts = re.split(r'<h3 class="block14-pref-name"[^>]*>([^<]+)</h3>', html)
    for i in range(1, len(parts), 2):
        pref, body = parts[i].strip(), parts[i + 1]
        for m in re.finditer(r'<dt>([\s\S]*?)</dt>\s*<dd>([\s\S]*?)</dd>', body):
            name = clean(m.group(1))
            hm = re.search(r'href="([^"]+)"', m.group(1))
            url = hm.group(1).replace('http://', 'https://') if hm else None
            if (name, url) in seen: continue
            seen.add((name, url))
            am = re.search(r'class="address">([\s\S]*?)</span>', m.group(2))
            addr = pref + clean(am.group(1)) if am else ''
            lat = lng = None; notes = []
            listnote = clean(re.sub(r'<p><span>(住所|TEL)</span>[\s\S]*?</p>', '', m.group(2)))
            if listnote: notes.append(listnote)
            if url:
                d = get(url)
                la = re.search(r'"latitude":"([\d.]+)"', d); lo = re.search(r'"longitude":"([\d.]+)"', d)
                if la and lo: lat, lng = float(la.group(1)), float(lo.group(1))
                txt = clean(re.sub(r'<script[\s\S]*?</script>', '', d))
                a2 = re.search(r'住所 (\S+(?: \S+)*?) 電話番号', txt)
                if a2 and a2.group(1).startswith(pref[:2]): addr = a2.group(1)
                tp = re.search(r'お店のタイプ (.*?) (?:サービス|決済方法|※)', txt)
                if tp: notes.append('お店のタイプ: ' + tp.group(1))
                info = txt[txt.find('店舗情報'):txt.find('最寄りの店舗')]
                for kw in ['仮設', 'イートインのみ', '閉店', '休業', 'テイクアウトのみ']:
                    if kw in info or kw in name: notes.append(kw + 'の記載あり')
                title = re.search(r'<title>([^|<]+)', d)
                if title and clean(title.group(1)) != name: notes.append('店舗検索上の店名: ' + clean(title.group(1)))
            if 'アンパンマン' in name: notes.append('別業態（アンパンマン＆ペコズキッチン）。公式の不二家レストラン店舗一覧に掲載')
            stores.append({'name': name, 'address': addr, 'lat': lat, 'lng': lng, 'url': url, 'note': ' / '.join(notes)})
save('fujiya-restaurant', stores, {'source': SRC, 'coord': 'wgs84 (Mapion系店舗検索のJSON-LD相当の値)'})
