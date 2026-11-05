"""博多一幸舎: 公式 ikkousha.com/store の国内店舗（博多一幸舎・二代目一幸舎ほか）。店名は公式の［ブランド］店名のまま"""
import os, re, sys, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, strip_zip, add_pref, save
SRC = 'https://ikkousha.com/store'
t = clean(re.sub(r'<script.*?</script>|<style.*?</style>', ' ', get(SRC), flags=re.S))
rows = [{'name': f'{b} {n}'.replace(' <FC店舗>', ''), 'address': add_pref(strip_zip(a)), 'lat': None, 'lng': None, 'url': SRC, 'note': 'FC' if 'FC' in n else ''}
        for b, n, a in re.findall(r'［(.+?)］(.+?) 所在地 (〒.*?) 電話番号', t)]
print(collections.Counter(r['name'].split(' ')[0] for r in rows), len(rows))
save('ikkousha', rows, {'coord': 'none', 'source': SRC, 'fetched': '2026-11-02'})
