#!/usr/bin/env python3
"""data/spot-hours/research-*.json（公式サイトの調査台帳）→ lib/spot-hours-data.ts

使い方（リポジトリのルートで。Node 24）:
  node --no-warnings --import ./scripts/_ts-resolve.mjs scripts/spot-hours/dump-names.mjs "$PWD" data/spot-hours/names.json
  python3 scripts/spot-hours/build.py lib/spot-hours-data.ts <公式を読んだ日 YYYY-MM-DD>

- research-*.json: 1施設1件。closedQuote / hoursQuote は公式の文言、sourceUrl は記載のあるページ。
- manual-fix.json: 台帳の上書き（営業期間・年末年始の範囲、注記になっていた文言の差し替え）。
- names.json: 上書き後の表示名 → lib/spots.ts の元の name（dump-names.mjs が作る）。
"""
import json,glob,re,sys,os,unicodedata
S=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','data','spot-hours')
out,checked=sys.argv[1],sys.argv[2]
rows=[]
# 表示名（上書き後）→ lib/spots.ts の元の name。「今日の流れ」は元の name で引くので、キーは元の name にそろえる。
# 上書きで別の施設に差し替わっている枠は、元の name に当てない（表示名のまま持つ＝スポットページだけで使う）。
RAW=json.load(open(S+'/names.json'))
names=set(RAW)|set(RAW.values())
REPLACED={'ファンタジーキッズリゾート 武蔵村山','新河岸東公園','あらかわ遊園','上柚木公園'}
alias={}
def keyname(n):
    r=RAW.get(n,n)
    if r==n or n in REPLACED: return n
    alias[n]=r; return r
for f in sorted(glob.glob(S+'/research-*.json')): rows+=json.load(open(f))
fix=json.load(open(S+'/manual-fix.json')) if os.path.exists(S+'/manual-fix.json') else {}
def nk(s): return unicodedata.normalize('NFKC',s or '')
def clip(s,n):
    s=re.sub(r'\s+',' ',(s or '')).strip()
    return s if len(s)<=n else s[:n-1].rstrip('、。 （(')+'…'
def md(m,d): return f'{int(m):02d}-{int(d):02d}'
D=r'(\d{1,2})\s*[月/]\s*(\d{1,2})\s*日?'
def year_end(t):
    t=nk(t)
    m=re.search(D+r'(?:\([^)]*\))?\s*(?:~|〜|から|-|－|―)\s*(?:翌年)?\s*'+D,t)
    if m and int(m.group(1))==12 and int(m.group(3))==1: return [{'from':md(m.group(1),m.group(2)),'to':md(m.group(3),m.group(4))}]
    m=re.search(r'12月(\d{1,2})日から12月31日、1月1日から1月(\d{1,2})日',t)
    if m: return [{'from':md(12,m.group(1)),'to':md(1,m.group(2))}]
    if re.fullmatch(r'\s*(1月1日|元日|元日\(休業\)|元旦)\s*',t): return [{'from':'01-01','to':'01-01'}]
    m=re.search(r'12/31・1/1',t)
    if m: return [{'from':'12-31','to':'01-01'}]
    return None
SEASONAL=re.compile(r'じゃぶじゃぶ|ジャブジャブ|水景|水遊び|噴水|プール|ちゃぷちゃぷ|徒渉池|せせらぎ')
def season(x):
    if not SEASONAL.search(x['name']): return None
    t=nk((x.get('hoursQuote') or '')+' '+(x.get('extra') or ''))
    Y=r'(?:(?:20\d\d|令和\d+)年)?\s*'
    m=re.search(Y+r'([6-7])月(\d{1,2})日(?:\([^)]*\))?\s*(?:~|〜|から|-)\s*'+Y+r'([8-9]|10)月(\d{1,2})日',t)
    return {'from':md(m.group(1),m.group(2)),'to':md(m.group(3),m.group(4))} if m else None
def q(s): return json.dumps(s,ensure_ascii=False)
L=[];stat={};unparsed_ye=[];seas=[];noseason=[]
for x in sorted(rows,key=lambda x:x['name']):
    x={**x,**fix.get(x['name'],{})}
    st=x['status']
    # 定休の記載が無く営業時間だけ読めた施設は「曜日では決まらない」扱いにする
    if st=='ok' and not (x.get('closedWeekdays') or []) and not (x.get('closedQuote') or '').strip() and not (x.get('yearEnd') or '').strip(): st='irregular'
    stat[st]=stat.get(st,0)+1
    if x['name'] not in names: print('!! unknown name',x['name']); continue
    if st=='not-found' or x.get('skip'): continue
    src=x.get('sourceUrl') or x.get('officialUrl')
    if not src: print('!! no source',x['name']); continue
    f=[f"status: {q(st)}"]
    cw=x.get('closedWeekdays') or []
    if st=='ok' and cw:
        f.append(f"closedWeekdays: {json.dumps(cw)}")
        if x.get('holidayOpen'): f.append('holidayOpen: true')
        if x.get('shiftTo') in ('next-day','next-weekday') and x.get('holidayOpen'): f.append(f"shiftTo: {q(x['shiftTo'])}")
    ye=x.get('closedRanges') or (year_end(x.get('yearEnd') or '') if (x.get('yearEnd') or '').strip() and st!='always-open' else None)
    if (x.get('yearEnd') or '').strip() and not ye and st=='ok': unparsed_ye.append((x['name'],x['yearEnd'][:60]))
    if ye: f.append('closedRanges: '+json.dumps(ye))
    se=x.get('openSeason') or season(x)
    if se: f.append('openSeason: '+json.dumps(se)); seas.append((x['name'],se))
    elif SEASONAL.search(x['name']): noseason.append(x['name'])
    def tidy(t,hours=False):
        # 公式の文言から、見出し語と注記を落として短くする（意味は変えない）
        t=re.sub(r'\s+',' ',(t or '')).strip()
        t=re.sub(r'^[（(【]?(?:公園|園の休園日)?[）)】]?\s*(?:開園時間|開館時間|営業時間|利用時間|休館日|休園日|定休日|休業日|(?:開園日|営業日)(?=\s*(?:常時|年中|毎日))|休 館 日|休 園 日|Days Closed)\s*[：:】]?\s*','',t)
        t=re.split(r'\s[※＊*]',t)[0].strip()
        if hours: t=t.split('。')[0]
        return t
    ct=clip(tidy(x.get('closedQuote')),90); ht=clip(tidy(x.get('hoursQuote'),True),70)
    if ht and (ht==ct or ht.startswith('常時')): ht=''
    if ht and not re.search(r'\d',nk(ht)): ht=''  # 時刻を含まない文は営業時間として出さない
    if st=='always-open' and not ct: ct=''
    if ct: f.append(f"closedText: {q(ct)}")
    if ht: f.append(f"hoursText: {q(ht)}")
    nt=clip(re.sub(r'【要確認】','',x.get('extra') or ''),160) if x.get('showNote') else ''
    if nt: f.append(f"note: {q(nt)}")
    f.append(f"source: {q(src)}"); f.append(f"checkedAt: {q(checked)}")
    L.append(f"  {q(keyname(x['name']))}: {{ "+', '.join(f)+' },')
head='''/**
 * スポットの定休日・営業時間。**自動生成（手で編集しない）**。
 *
 * 運営元の公式サイト（施設公式・自治体公式・運営会社公式）を1件ずつ読んで写したもの。
 * closedText / hoursText は公式の文言（長いものは途中で切って「…」）。
 * 載っていないスポットは、公式で読めなかったか、まだ調べていない（開いているとも休みとも言わない）。
 * 型と判定は lib/spot-hours.ts。キーは lib/spots.ts の name と完全一致（上書き後の表示名ではない）。
 */
import type { SpotHours } from './spot-hours';

export const SPOT_HOURS_DATA: Record<string, SpotHours> = {
'''
tail='''};

/** 上書き（lib/spot-overrides）で変えた表示名 → 上のキー（lib/spots.ts の元の name）。スポットページから引くときに使う */
export const SPOT_HOURS_ALIASES: Record<string, string> = {
'''+''.join(f"  {q(a)}: {q(b)},\n" for a,b in sorted(alias.items()))+'};\n'
open(out,'w').write(head+'\n'.join(sorted(L))+'\n'+tail)
print(len(rows),'rows',stat,'written',len(L))
print('year-end not parsed:',unparsed_ye)
print('season:',seas)
print('seasonal name without season:',noseason)
