"""牛たん炭焼 利久: 公式 www.rikyu-gyutan.co.jp/location.html の拠点一覧の「直営店舗」「◯◯運営店舗」。HTMLコメント内の店は掲載外なので除く。
店舗サイト corp.rikyu-gyutan.co.jp は取得時 503 のため、ここだけが出典（鮮度は未確認）"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
SRC = 'https://www.rikyu-gyutan.co.jp/location.html'
h = re.sub(r'<!--.*?-->', ' ', get(SRC), flags=re.S)
h = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', h, flags=re.S)
t = clean(h)
rows, declared = [], 0
segs = re.split(r'(≪[^≫]+≫)', t)
for i in range(1, len(segs), 2):
    title, body = segs[i], segs[i + 1]
    if not re.search(r'直営店舗|運営店舗', title): continue   # お土産売場・惣菜売場は対象外
    declared += sum(int(x) for x in re.findall(r'[(（](\d+)店舗[)）]', body))
    print(title)
    for e in re.split(r'TEL[：:]+\s*[\d-]+', body):
        m = re.search(r'([^：◇]*?)：((?:北海道|東京都|大阪府|京都府|\S{2,3}県).*)$', e.strip())
        if not m: continue
        nm = re.sub(r'\[[^\]]*\]', '', m.group(1))
        nm = re.sub(r'^.*(?:立入禁止\)有|ません）|店舗[)）]|有り)\s*', '', nm).strip()   # 前の店の注記・節見出しを落とす
        nm = re.sub(r'^利久(?!の)', '', nm)
        rows.append({'name': '牛たん炭焼 利久 ' + nm, 'address': clean(m.group(2)), 'lat': None, 'lng': None, 'url': SRC})
print('宣言の合計', declared, '取得', len(rows)); print([r['name'][9:] for r in rows if not r['name'].endswith(('店', '）'))])
import collections
print(collections.Counter(r['address'][:3] for r in rows))
save('rikyu', rows, {'coord': 'none', 'official_total': declared, 'official_total_source': 'location.html の地域ごとの「N店舗」の合計', 'source': SRC, 'freshness': '店舗サイト corp.rikyu-gyutan.co.jp が503で突合できず', 'fetched': '2026-11-02'})
