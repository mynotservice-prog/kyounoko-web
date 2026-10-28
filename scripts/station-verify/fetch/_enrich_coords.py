#!/usr/bin/env python3
"""一覧に座標が無いチェーン（スシロー・サブウェイ・コメダ）の座標を、各店の公式ページ／公式APIから補う。
対象は首都圏・関西の都府県の店だけ。stores/<slug>.json を上書きし、meta の coord を wgs84 にする。"""
import json,os,re,sys,time,urllib.request
from concurrent.futures import ThreadPoolExecutor
B=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PREFS=('東京都','神奈川県','埼玉県','千葉県','大阪府','京都府','兵庫県','奈良県','滋賀県')
UA={'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36'}
def get(u,h=None):
    hh=dict(UA); hh.update(h or {})
    for i in range(3):
        try: return urllib.request.urlopen(urllib.request.Request(u,headers=hh),timeout=30).read().decode('utf-8','ignore')
        except Exception as e:
            time.sleep(1.5)
    return ''
def sushiro(s):
    m=re.search(r'maps/search/\?api=1&(?:amp;)?query=(-?\d+\.\d+),(-?\d+\.\d+)',get(s['url']))
    return (float(m.group(1)),float(m.group(2))) if m else None
def subway(s):
    m=re.search(r'"latitude":\s*(-?\d+\.\d+),\s*"longitude":\s*(-?\d+\.\d+)',get(s['url']))
    return (float(m.group(1)),float(m.group(2))) if m else None
def komeda(s):
    i=re.search(r'id=(\d+)',s['url'] or '')
    if not i: return None
    t=get('https://eu.komeda.co.jp/v1/hp/shop/'+i.group(1),{'Origin':'https://www.komeda.co.jp','Referer':'https://www.komeda.co.jp/'})
    try:
        d=json.loads(t); d=d.get('shop',d)
        la,lo=d.get('shop_latitude'),d.get('shop_longitude')
        return (float(la),float(lo)) if la and lo else None
    except Exception: return None
for slug,fn in (('sushiro',sushiro),('subway',subway),('komeda',komeda)):
    p=os.path.join(B,'stores',slug+'.json'); st=json.load(open(p))
    todo=[s for s in st if (s.get('address') or '').startswith(PREFS) and s.get('lat') is None and s.get('url')]
    with ThreadPoolExecutor(4) as ex: res=list(ex.map(fn,todo))
    ok=0
    for s,r in zip(todo,res):
        if r and 20<r[0]<46 and 122<r[1]<154: s['lat'],s['lng']=r; ok+=1
    json.dump(st,open(p,'w'),ensure_ascii=False,indent=0)
    mp=os.path.join(B,'stores',slug+'.meta.json'); meta=json.load(open(mp)) if os.path.exists(mp) else {}
    meta['coord']='wgs84'; meta['coord_note']='首都圏・関西の店だけ、各店の公式ページ／公式APIから座標を補った（_enrich_coords.py）。それ以外は座標なし'
    json.dump(meta,open(mp,'w'),ensure_ascii=False,indent=1)
    print(slug,'target',len(todo),'filled',ok,flush=True)
