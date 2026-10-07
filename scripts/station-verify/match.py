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
    a=re.sub(r'(?<=\d)[‐‑–—―ー−](?=\d)','-',a)  # 数字に挟まれたものだけ（カタカナの長音を巻き込まない）
    return a
def show_addr(a):
    a=unicodedata.normalize('NFKC',a or '')
    a=re.sub(r'〒\s*(\d{3}-?\d{4})?','',a)
    a=re.sub(r'^(東京都|北海道|(?:京都|大阪)府|.{2,3}県)\s*\1',r'\1',a)
    a=re.sub(r'(?<=\d)[‐‑–—―ー−](?=\d)','-',a)
    return re.sub(r'\s+',' ',a).strip()
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
EXCL=re.compile(r'休店中|MOSH |むさしの森Diner|ポケットキッチン|大学$|大学 |ドーム内|コンコース|東京ドーム店|都営神保町駅店|グランドオープン|NEW OPEN|オープン[!！]|エキュート|ecute|グランスタ東京|エキナカ|ラチ内|弁当専門|施設内|【休業】|休業中|長期休業|テイクアウト専門|テイクアウト・デリバリー専門|デリバリー専門|持ち帰り専門|病院|医療センター|防衛省|庁舎内|社員|関係者|一般.{0,6}(不可|利用できません)|オープン予定|開店予定|OPEN予定|\d+月\d+日\s*(オープン|OPEN|開店)|\d+/\d+\s*(オープン|OPEN|開店)|近日|(?<!一時)閉店|仮設|競馬場|球場内|スタジアム内|改札内|冷凍自動販売機|大学.{0,12}(キャンパス|号館|構内|生協|学内)|キャンパス店|(?<!学芸)(?<!都立)(?<!駒沢)大学(店|病院|内)')
def clean_store_name(n):
    n=unicodedata.normalize('NFKC',n or '')
    n=re.sub(r'\s*[※*].*$','',n)                                  # 「※10月19日より一時閉店…」などの告知
    n=re.sub(r'\s*[（(](?=[^）)]*(\d+/\d+|\d+月\d+日)).*$','',n)   # 「(10/15(木)のみ 営業時間変更)」など日付つきの告知
    n=re.sub(r'【[^】]*】','',n)
    return re.sub(r'\s+',' ',n).strip()
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
        cm=str(m.get('coord','wgs84'))
        if s.get('lat') is not None and (cm in ('unreliable','tokyo-datum') or cm.startswith('tokyo')):
            # NAVITIME系とサイゼリヤの公式座標は日本測地系。世界測地系に直す（国土地理院の住所検索との差は中央値10〜20m）
            la0,lo0=float(s['lat']),float(s['lng'])
            s['lat']=la0-0.00010695*la0+0.000017464*lo0+0.0046017
            s['lng']=lo0-0.000046038*la0-0.000083043*lo0+0.010040
            cm='wgs84'
        if cm=='approximate': cm='wgs84'
        s['_rel']= (s.get('lat') is not None) and cm.startswith('wgs84')
        a=norm_addr(s.get('address',''))
        s['_addr']=a
        s['_show']=show_addr(s.get('address',''))
    # 対象都府県の全店の住所を、国土地理院の住所検索で座標にする（公式座標の誤りを見つけるためにも使う）
    need={s['_addr'] for s in stores if s['_addr'] and s['_addr'].startswith(PREFS)}
    todo=[a for a in need if geo_key(a) not in geo]
    print('geocode needed',len(need),'todo',len(todo),flush=True)
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(6) as ex:
        for i,_ in enumerate(ex.map(geocode,todo)):
            if i%1000==0: save_geo(); print(' geocoded',i,flush=True)
    save_geo()
    # 店ごとに位置を1つ決める
    #  公式座標と住所の位置が300m以内で合えば公式座標。食い違えば、住所が「号」まで当たっているときだけ住所の位置を採り、
    #  そうでなければ位置不明として載せない（公式座標の誤りで別の駅の店が載った例: かっぱ寿司 秋葉原万世橋店）。
    stat={'api':0,'gsi':0,'gsi-imprecise':0,'mismatch-gsi':0,'mismatch-unknown':0,'api-only':0}
    review=[]
    for s in stores:
        a=s['_addr']; s['_pos']=None; s['_src']=None; s['_precise']=True
        if not a.startswith(PREFS) and s.get('lat') is None: continue
        g=geo.get(geo_key(a)) if a.startswith(PREFS) else None
        if g and not same_city(a,g.get('title','')): g=None
        gprec=bool(g) and (('号' in g.get('title','')) or len(re.findall(r'\d+',re.split(r'[市区町村]',geo_key(a))[-1]))<=2)
        api=(float(s['lat']),float(s['lng'])) if s['_rel'] else None
        if api and g:
            df=dist(api[0],api[1],g['lat'],g['lng'])
            if df<=300 or (not gprec and df<=600): s['_pos']=api; s['_src']='api'; stat['api']+=1
            elif '号' in g.get('title','') and df>1000:
                # 住所は号まで当たっているのに公式座標が1km以上離れている＝公式座標の誤り（別の店の値が入っている等）
                s['_pos']=(g['lat'],g['lng']); s['_src']='gsi'; stat['mismatch-gsi']+=1; s['_mis']=int(df); review.append((s['chain'],s['name'],a,int(df),'公式座標が住所と1km以上食い違い→住所の位置を採用'))
            else:
                # 大きな敷地（ソラマチ・イオンなど）や、住所が街区止まりのとき。店の位置としては公式座標の方が細かい
                s['_pos']=api; s['_src']='api'; stat['mismatch-unknown']+=1; s['_mis']=int(df)
        elif api: s['_pos']=api; s['_src']='api'; stat['api-only']+=1
        elif g:
            s['_pos']=(g['lat'],g['lng']); s['_src']='gsi'; s['_precise']=gprec; stat['gsi' if gprec else 'gsi-imprecise']+=1
    # 住所が街区止まりで公式座標も無い店は、同じ番地にある別チェーンの店の公式座標を借りる
    twin={}
    for s in stores:
        if s['_src']=='api' and s['_addr']: twin.setdefault(geo_key(s['_addr']),s['_pos'])
    for s in stores:
        if s['_src']=='gsi' and not s['_precise']:
            t=twin.get(geo_key(s['_addr']))
            if t: s['_pos']=t; s['_src']='twin'; s['_precise']=True; stat['twin']=stat.get('twin',0)+1
    print('position',stat,flush=True)
    json.dump(review,open(os.path.join(B,'review_coord_mismatch.json'),'w'),ensure_ascii=False,indent=0)
    for st in stations:
        la,lo=st['lat'],st['lng'];res=[]
        for s in stores:
            if not s['_pos']: continue
            pa,po=s['_pos']
            if abs(la-pa)>0.012 or abs(lo-po)>0.015: continue
            d=dist(la,lo,pa,po)
            if d>1000: continue
            a=s['_addr']; src=s['_src']
            txt=(s.get('name') or '')+' '+(s.get('note') or '')+' '+(s.get('address') or '')
            res.append({'chain':s['chain'],'name':clean_store_name(s['name']) or s['name'],'rawname':s['name'],'address':a,'show':s['_show'],'precise':s['_precise'],'m':int(d),'src':src,'url':s.get('url'),'note':s.get('note') or '',
                        'excluded':bool(EXCL.search(txt)),'border':d>800,'uncertain':(not s['_precise']) and 500<d<=1000,'mis':s.get('_mis')})
        out[st['slug']]=sorted(res,key=lambda x:(x['chain'],x['m']))
    save_geo()
    json.dump(out,open(os.path.join(B,'matched.json'),'w'),ensure_ascii=False,indent=0)
    for k,v in out.items():
        ok=[x for x in v if not x['excluded'] and not x['border']]
        print(k,len(ok),'stores',len({x['chain'] for x in ok}),'chains','| excluded',sum(x['excluded'] for x in v),'border',sum(x['border'] for x in v))
if __name__=='__main__': main()
