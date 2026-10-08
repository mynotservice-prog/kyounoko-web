#!/usr/bin/env python3
"""matched.json → lib/station-verified-stores.ts（引数: 出力先 と 対象駅slugのファイル）"""
import json,sys,os,re,unicodedata
B=os.path.dirname(os.path.abspath(__file__))
out_path,list_path,date=sys.argv[1],sys.argv[2],sys.argv[3]
slugs=[l.strip() for l in open(list_path) if l.strip()]
m=json.load(open(os.path.join(B,'matched.json')))
def q(s): return json.dumps(s,ensure_ascii=False)
sys.path.insert(0,B)
from match import geo_key
def show_addr(a):
    # 照合用に空白を落とした住所を、番地と建物名の間だけ空けて読みやすくする
    k=geo_key(a); rest=a[len(k):] if a.startswith(k) else ''
    return k+(' '+rest if rest else '') if rest else a
def clean_name(n): return re.sub(r'\s+',' ',unicodedata.normalize('NFKC',n)).strip()

# --- 店ごとの設備（data/chain-coverage/ = 公式店舗検索の設備属性を全店ぶん数えた調査） ---
# 店舗ページのURL（無いチェーンは店名）で突き合わせる。載せるのは公式が「あり」と表示している項目だけ。
# 項目が無い＝「無い」ではない（公式がその項目を持っていない・未入力のことがある）。
COV_DIR=os.environ.get('SV_COVERAGE_DIR') or os.path.join(B,'..','..','data','chain-coverage')
COV_ALIAS={'musashino-mori-coffee':'musashinomori-coffee','shabu-yo':'shabuyou','tully-coffee':'tullyscoffee',
  'kushikatsu-tanaka':'kushikatsutanaka','ringer-hut':'ringerhut','mister-donut':'misdo',
  'yakiniku-king':'yakinikuking','goemon':'yomenya-goemon'}
# 公式の表記が長い・末尾に「あり」が付くものを、意味を変えずに短くする
LABEL_FIX={'座敷(大・小) あり／小上がり(畳席) あり':'座敷・小上がり','プレイプレイス（旧プレイランド）':'プレイプレイス',
  '専用駐車場／共用駐車場':'駐車場','1F店舗（スロープ有り）':'1F店舗（スロープあり）','駐車場有':'駐車場','パーキング':'駐車場'}
FAC_ORDER=['diaperTable','kidsChair','kidsMenu','kidsSpace','nursingRoom','zashiki','boxSeat','privateRoom','stepFree','multiToilet','parking']
def short_label(l):
    l=LABEL_FIX.get(l,l)
    return re.sub(r'\s*あり$','',l)
def nurl(u): return re.sub(r'/+$','',(u or '').replace('http://','https://'))
def nname(n): return re.sub(r'\s+','',unicodedata.normalize('NFKC',n or ''))
_cov={}
def coverage(chain):
    if chain in _cov: return _cov[chain]
    f=os.path.join(COV_DIR,COV_ALIAS.get(chain,chain)+'.json'); c=None
    if os.path.exists(f):
        d=json.load(open(f)); names={}
        for st in d['stores']: names.setdefault(nname(st['name']),[]).append(st)
        urls={}
        for st in d['stores']:
            if st.get('url'): urls.setdefault(nurl(st['url']),[]).append(st)
        c={'at':d['countedAt'],'labels':{k:short_label(v['label']) for k,v in d['facilities'].items()},
           # 店舗一覧ページのURLを全店で共有しているチェーンがあるので、URLが1店だけのものに限る
           'url':{u:v[0] for u,v in urls.items() if len(v)==1},
           # 同じ店名が2つあるチェーンでは、店名での突き合わせをしない
           'name':{k:v[0] for k,v in names.items() if len(v)==1}}
    _cov[chain]=c; return c
def store_fac(x):
    c=coverage(x['chain'])
    if not c: return None
    st=c['url'].get(nurl(x.get('url'))) if x.get('url') else None
    if st is None: st=c['name'].get(nname(x['name'])) or c['name'].get(nname(x.get('rawname')))
    if st is None: return None
    keys=[k for k in FAC_ORDER if k in st.get('facilities',[]) and k in c['labels']]
    return [c['labels'][k] for k in keys]
head='''/**
 * 駅ごとの「公式店舗検索で実在を確認したチェーン店」。
 *
 * 【なぜあるか】駅ページのチェーン一覧は、駅の規模に応じた一律付与（23区外の主要駅は56チェーン、
 * 23区の駅は定番28チェーン＋明示リスト）で、その駅に店があるかを確かめていなかった。
 * 2026-10-07 に10駅を公式店舗検索で照合すると、実在を確認できたのは表示の40%だった
 * （日吉は56チェーン中14、柏の葉キャンパスは10）。ここに駅を登録すると、その駅のチェーン一覧は
 * ここに載っているチェーンだけになり、店名と住所を表示する。
 *
 * 【作り方】scripts/station-verify/ で、56チェーンの全国の店舗一覧を各チェーンの公式サイト・
 * 公式APIから取得し（fetch/）、公式の住所を国土地理院の住所検索で座標にして、駅中心から
 * 直線800m以内の店を拾う（match.py）。300m以内を「駅前」、800m以内を「徒歩圏」とする。
 * 公式APIの座標は、世界測地系で信頼できるチェーンだけそのまま使う。
 * 閉店・開店前・テイクアウト専門・大学や病院の構内など一般の来店に向かない店は載せない。
 * 手で編集しない。再生成する: scripts/station-verify/README.md
 */
export type VerifiedStore = {
  /** lib/station-restaurants.ts の Chain.slug */
  chain: string;
  /** 公式の店名表記 */
  name: string;
  /** 公式の住所表記（建物名・階を含む） */
  address: string;
  distance: '駅前' | '徒歩圏';
  /** 公式の店舗ページ（チェーンによっては店舗一覧ページ） */
  url?: string;
  /**
   * その店の公式ページ・公式店舗検索が「あり」と表示している設備（公式の表記）。
   * undefined＝この店の設備を突き合わせられていない。[]＝公式の項目はあるが、この店に該当なし。
   * 載っていない設備は「無い」ではない（公式が項目を持っていないことがある）。STORE_FACILITY_SOURCES を参照。
   */
  fac?: string[];
};

export type StationVerifiedStores = {
  /** 公式の店舗一覧を取得して照合した日 */
  verifiedAt: string;
  /** 1チェーンにつき駅に近い順で最大5店まで */
  stores: VerifiedStore[];
  /** 6店以上あるチェーンの、stores に載せていない残りの店数 */
  more?: Record<string, number>;
};

export const STATION_VERIFIED_STORES: Record<string, StationVerifiedStores> = {
'''
L=[head];stat=[];nfac=0;used=set()
for s in slugs:
    allrows=[x for x in m.get(s,[]) if not x['excluded'] and not x['border']]
    rows=[];more={};cnt={}
    for x in sorted(allrows,key=lambda x:(x['chain'],x['m'])):
        cnt[x['chain']]=cnt.get(x['chain'],0)+1
        if cnt[x['chain']]<=5: rows.append(x)
        else: more[x['chain']]=more.get(x['chain'],0)+1
    L.append(f"  {q(s)}: {{\n    verifiedAt: {q(date)},\n    stores: [")
    for x in rows:
        d='駅前' if x['m']<=300 else '徒歩圏'
        u=f", url: {q(x['url'])}" if x.get('url') else ''
        fc=store_fac(x); nfac+=fc is not None; used.add(x['chain'])
        if fc is not None: u+=f", fac: {json.dumps(fc,ensure_ascii=False)}"
        L.append(f"      {{ chain: {q(x['chain'])}, name: {q(clean_name(x['name']))}, address: {q(x.get('show') or x['address'])}, distance: {q(d)}{u} }},")
    L.append('    ],'+(f"\n    more: {json.dumps(more,ensure_ascii=False)}," if more else '')+'\n  },')
    rows=allrows
    stat.append((s,len(rows),len({x['chain'] for x in rows})))
L.append('};\n')
L.append('''/**
 * 店ごとの設備（VerifiedStore.fac）の出どころ。チェーンごとに、公式の店舗検索が持っている項目と数えた日。
 * ここに無いチェーンは、公式の店舗検索に設備の項目が無い（または未調査）ので、店ごとの設備を出さない。
 * 元データ: data/chain-coverage/<chain>.json
 */
export const STORE_FACILITY_SOURCES: Record<string, { checkedAt: string; items: string[] }> = {''')
for ch in sorted(used):
    c=coverage(ch)
    if c: L.append(f"  {q(ch)}: {{ checkedAt: {q(c['at'])}, items: {json.dumps([c['labels'][k] for k in FAC_ORDER if k in c['labels']],ensure_ascii=False)} }},")
L.append('};\n')
_dates=sorted({coverage(ch)['at'] for ch in used if coverage(ch)})
L.append('/** 店ごとの設備を数えた日の範囲（表示用） */')
L.append('export const STORE_FACILITY_CHECKED_RANGE = '+q(_dates[0] if _dates[0]==_dates[-1] else _dates[0]+'〜'+_dates[-1])+';')
L.append('''
export function getVerifiedStores(stationSlug: string): StationVerifiedStores | undefined {
  return STATION_VERIFIED_STORES[stationSlug];
}
''')
open(out_path,'w',encoding='utf-8').write('\n'.join(L))
json.dump(stat,open(os.path.join(B,'gen_stat.json'),'w'))
print('stores with facility data:',nfac)
print(len(slugs),'stations',sum(x[1] for x in stat),'stores; zero-chain stations:',[x[0] for x in stat if x[2]==0])
