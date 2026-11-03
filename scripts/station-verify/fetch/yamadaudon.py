"""山田うどん食堂: 公式 /shop/<エリア> の15ページ（店舗名・住所の表）。座標なし"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
SRC = 'https://www.yamada-udon.co.jp/shop'
AREAS = ['saitama_saitamashi', 'saitama_nanbu', 'saitama_seibu', 'saitama_nannsei', 'saitama_hiki', 'saitama_kenou', 'saitama_hokubu', 'saitama_tobu', 'saitama_tone', 'tokyo', 'kanagawa', 'chiba', 'ibaraki', 'tochigi', 'gunma']
rows = {}
for a in AREAS:
    t = clean(re.sub(r'<script.*?</script>|<style.*?</style>', ' ', get(f'{SRC}/{a}'), flags=re.S))
    t = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', t))
    for b in t.split(' 店舗名 ')[1:]:
        m = re.match(r'(\S+?(?: \S+){0,2}?) ?住所 ?(.+?) (?:テイクアウト|営業時間|TEL|電話)', b)
        if not m: print('読めない', b[:60]); continue
        rows[m.group(1)] = {'name': m.group(1), 'address': m.group(2), 'lat': None, 'lng': None, 'url': f'{SRC}/{a}', 'note': ''}
save('yamadaudon', list(rows.values()), {'coverage': 'all-official', 'coord': 'none', 'source': SRC})
