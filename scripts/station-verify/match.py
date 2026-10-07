#!/usr/bin/env python3
"""全国店舗台帳(stores/*.json) × 駅(stations.json) → 駅から800m以内の実在店。
距離は原則「公式住所を国土地理院の住所検索で座標化した点」と駅中心の直線。
公式APIの座標が世界測地系で信頼できるチェーン(meta coord=wgs84)はAPI座標を使う。"""
import json,glob,os,re,math,sys,time,urllib.request,urllib.parse,unicodedata
B=os.path.dirname(os.path.abspath(__file__))
GEO=os.path.join(B,'cache','geo.json')
geo=json.load(open(GEO)) if os.path.exists(GEO) else {}
PREFS=('東京都','神奈川県','埼玉県','千葉県','大阪府','京都府','兵庫県','奈良県','滋賀県')
def dist(a,b,c,d):
    R=6371000;p1,p2=math.radians(a),math.radians(c)
    x=math.sin((p2-p1)/2)**2+math.cos(p1)*math.cos(p2)*math.sin(math.radians(d-b)/2)**2
    return 2*R*math.asin(math.sqrt(x))
KAN={'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10}
def norm_addr(a):
    a=unicodedata.normalize('NFKC',a or '').replace(' ','').replace('　','')
    a=re.sub(r'〒\s*(\d{3}-?\d{4})?','',a)
    a=re.sub(r'^(東京都|北海道|(?:京都|大阪)府|.{2,3}県)\1',r'\1',a)
    a=re.sub(r'[‐‑–—―ー−]','-',a) if re.search(r'\d[‐‑–—―ー−]\d',a) else a
    return a
def geo_key(a):
    a=norm_addr(a)
    # 番地まで: 最初の「数字-数字(-数字)」「N丁目N番N号」までを残し、建物名を落とす
    m=re.search(r'^(.*?\d+(?:丁目|番地?|号|-|の)\d*(?:(?:番地?|号|-|の)\d+)*)',a)
    return m.group(1) if m else a
def geocode(a):
    k=geo_key(a)
    if k in geo: return geo[k]
    try:
        u='https://msearch.gsi.go.jp/address-search/AddressSearch?q='+urllib.parse.quote(k)
        r=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=30))
        if r:
            g=r[0]; geo[k]={'lat':g['geometry']['coordinates'][1],'lng':g['geometry']['coordinates'][0],'title':g['properties'].get('title','')}
        else: geo[k]=None
    except Exception as e:
        return None
    return geo[k]
def same_city(a,title):
    t=unicodedata.normalize('NFKC',title or '')
    m=re.match(r'^(東京都|北海道|(?:京都|大阪)府|.{2,3}県)(.+?[市区町村])',a)
    if not m: return True
    return t.startswith(m.group(1)+m.group(2))
def save_geo():
    data=json.dumps(dict(geo),ensure_ascii=False)
    open(GEO,'w').write(data)
EXCL=re.compile(r'施設内|【休業】|休業中|長期休業|テイクアウト専門|テイクアウト・デリバリー専門|デリバリー専門|持ち帰り専門|病院|医療センター|防衛省|庁舎内|社員|関係者|一般.{0,6}(不可|利用できません)|オープン予定|開店予定|OPEN予定|\d+月\d+日\s*(オープン|OPEN|開店)|\d+/\d+\s*(オープン|OPEN|開店)|近日|(?<!一時)閉店|仮設|競馬場|球場内|スタジアム内|改札内|冷凍自動販売機|大学.{0,12}(キャンパス|号館|構内|生協|学内)|キャンパス店|(?<!学芸)(?<!都立)(?<!駒沢)大学(店|病院|内)')
def load():
    stores=[];meta={}
    for f in sorted(glob.glob(os.path.join(B,'stores','*.json'))):
        if f.endswith('.meta.json'):
            meta[os.path.basename(f)[:-10]]=json.load(open(f)); continue
        for s in json.load(open(f)): stores.append(s)
    return stores,meta
def main():
    stations=json.load(open(os.path.join(B,'stations.json')))
    only=set(sys.argv[1:])
    if only: stations=[s for s in stations if s['slug'] in only]
    stores,meta=load()
    out={};n=0
    # 座標の無い店・座標が信頼できない店は、対象都府県なら先に住所で座標化
    for s in stores:
        m=meta.get(s['chain'],{})
        if s.get('lat') is None or s.get('lng') is None: s['lat']=s['lng']=None
        s['_rel']= (s.get('lat') is not None) and str(m.get('coord','wgs84')).startswith('wgs84')
        a=norm_addr(s.get('address',''))
        s['_addr']=a
    # 先に、住所の座標化が必要な店をまとめて並列で処理する（国土地理院の住所検索）
    need=set()
    for s in stores:
        a=s['_addr']
        if not a: continue
        if s.get('lat') is None:
            if a.startswith(PREFS): need.add(a)
        elif not s['_rel']:
            la0,lo0=float(s['lat']),float(s['lng'])
            if any(abs(st['lat']-la0)<0.03 and abs(st['lng']-lo0)<0.035 and dist(st['lat'],st['lng'],la0,lo0)<=2500 for st in stations): need.add(a)
    todo=[a for a in need if geo_key(a) not in geo]
    print('geocode needed',len(need),'todo',len(todo),flush=True)
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(6) as ex:
        for i,_ in enumerate(ex.map(geocode,todo)):
            if i%500==0: save_geo(); print(' geocoded',i,flush=True)
    save_geo()
    for st in stations:
        la,lo=st['lat'],st['lng'];res=[]
        for s in stores:
            a=s['_addr']
            if s.get('lat') is not None:
                if abs(la-float(s['lat']))>0.03 or abs(lo-float(s['lng']))>0.035: continue
                d0=dist(la,lo,float(s['lat']),float(s['lng']))
                if d0>2500: continue
            else:
                if not a.startswith(PREFS): continue
                d0=None
                g0=geo.get(geo_key(a))
                if g0 and (abs(la-g0['lat'])>0.03 or abs(lo-g0['lng'])>0.035): continue
            if s['_rel'] and d0 is not None:
                d=d0;src='api'
            else:
                g=geocode(a) if a else None; n+=1
                if n%200==0: save_geo()
                if g and not same_city(a,g.get('title','')): g=None
                if g and d0 is not None and dist(g['lat'],g['lng'],float(s['lat']),float(s['lng']))>1500: g=None
                if g: d=dist(la,lo,g['lat'],g['lng']);src='gsi'
                elif d0 is not None: d=d0;src='api-unreliable'
                else: continue
            if d>850: continue
            txt=(s.get('name') or '')+' '+(s.get('note') or '')
            res.append({'chain':s['chain'],'name':s['name'],'address':a,'m':int(d),'src':src,'url':s.get('url'),'note':s.get('note') or '',
                        'excluded':bool(EXCL.search(txt)),'border':d>800})
        out[st['slug']]=sorted(res,key=lambda x:(x['chain'],x['m']))
    save_geo()
    json.dump(out,open(os.path.join(B,'matched.json'),'w'),ensure_ascii=False,indent=0)
    for k,v in out.items():
        ok=[x for x in v if not x['excluded'] and not x['border']]
        print(k,len(ok),'stores',len({x['chain'] for x in ok}),'chains','| excluded',sum(x['excluded'] for x in v),'border',sum(x['border'] for x in v))
if __name__=='__main__': main()
