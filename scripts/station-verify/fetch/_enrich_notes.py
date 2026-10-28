#!/usr/bin/env python3
"""一覧に出ない休業情報を、各店の公式APIから note に補う。
マクドナルド: 一覧APIには無く、店ごとの api/poi/<key> の「営業時間 特記事項」に「一時休業 2026年9月28日～2026年10月29日」と出る。
対象は首都圏・関西の都府県の店だけ。stores/mcdonalds.json を上書きする。"""
import json,os,re,time,urllib.request
from concurrent.futures import ThreadPoolExecutor
B=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PREFS=('東京都','神奈川県','埼玉県','千葉県','大阪府','京都府','兵庫県','奈良県','滋賀県')
UA={'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36'}
def get(u):
    for i in range(3):
        try: return urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=30).read().decode('utf-8','ignore')
        except Exception: time.sleep(1.5)
    return ''
def mcd(s):
    k=re.search(r'/map/(\d+)',s.get('url') or '')
    if not k: return None
    try: d=json.loads(get('https://map.mcdonalds.co.jp/api/poi/'+k.group(1)))
    except Exception: return None
    t=' '.join(str(v) for kk,v in d.items() if '特記' in kk or '休業' in kk)
    return ' / '.join(re.findall(r'一時休業[^|<]*',t)).strip() or ''
p=os.path.join(B,'stores','mcdonalds.json'); st=json.load(open(p))
todo=[s for s in st if (s.get('address') or '').startswith(PREFS)]
with ThreadPoolExecutor(5) as ex: res=list(ex.map(mcd,todo))
n=0
for s,r in zip(todo,res):
    if r:
        s['note']=(re.sub(r'一時休業[^/]*(/|$)','',s.get('note') or '').strip()+' '+r).strip(); n+=1
json.dump(st,open(p,'w'),ensure_ascii=False,indent=0)
print('mcdonalds checked',len(todo),'failed',sum(r is None for r in res),'一時休業の記載',n)
for s in st:
    if '一時休業' in (s.get('note') or ''): print('  ',s['name'],s['note'][:60])
