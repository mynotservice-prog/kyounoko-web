"""洋麺屋五右衛門: 公式の店舗一覧（地方別ページ）。HTMLコメント内の店（画面に出ない）と海外は除く。
個別店舗ページは無いので url は地方ページ＋都道府県アンカー。座標なし。"""
import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
SRC = 'https://www.yomenya-goemon.com/store/'
top = get(SRC)
regions = [r for r in dict.fromkeys(re.findall(r'href="/store/([a-z_]+)/"', top)) if r != 'kaigai']
assert len(regions) >= 5, regions
stores = []
for r in regions:
    url = f'{SRC}{r}/'
    html = re.sub(r'<!--[\s\S]*?-->', '', get(url))
    # 都道府県見出しごとに分割
    parts = re.split(r'<h2 id="([a-z]+)">([^<]+)</h2>', html)
    for i in range(1, len(parts), 3):
        anchor, pref, body = parts[i], parts[i + 1], parts[i + 2]
        for m in re.finditer(r'<li>\s*<dl>([\s\S]*?)</dl>\s*</li>', body):
            b = m.group(1)
            nm = re.search(r'class="store_info_name">([\s\S]*?)</dt>', b)
            if not nm: continue
            note = ' '.join(clean(x) for x in re.findall(r'<span[^>]*>([\s\S]*?)</span>', nm.group(1)))
            name = clean(re.sub(r'<span[\s\S]*?</span>', '', nm.group(1)))
            am = re.search(r'class="store_info_address">([\s\S]*?)</dd>', b)
            addr = clean(am.group(1)) if am else ''
            if addr and not addr.startswith(pref.strip()): addr = pref.strip() + addr
            op = re.search(r'class="store_info_open">([\s\S]*?)</dd>', b)
            opn = clean(op.group(1)) if op else ''
            if re.search(r'閉店|休業|休止|オープン予定|OPEN', opn): note = (note + ' ' + opn).strip()
            stores.append({'name': name, 'address': addr, 'lat': None, 'lng': None, 'url': f'{url}#{anchor}', 'note': note})
save('goemon', stores, {'source': SRC, 'coord': 'none', 'url': '個別店舗ページは無い。地方ページ＋都道府県アンカー'})
