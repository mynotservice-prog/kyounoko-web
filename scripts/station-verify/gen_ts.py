#!/usr/bin/env python3
"""matched.json → lib/station-verified-stores.ts（引数: 出力先 と 対象駅slugのファイル）"""
import json,sys,os,re,unicodedata
B=os.path.dirname(os.path.abspath(__file__))
out_path,list_path,date=sys.argv[1],sys.argv[2],sys.argv[3]
slugs=[l.strip() for l in open(list_path) if l.strip()]
m=json.load(open(os.path.join(B,'matched.json')))
def q(s): return json.dumps(s,ensure_ascii=False)
def clean_name(n): return re.sub(r'\s+',' ',unicodedata.normalize('NFKC',n)).strip()
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
L=[head];stat=[]
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
        L.append(f"      {{ chain: {q(x['chain'])}, name: {q(clean_name(x['name']))}, address: {q(x['address'])}, distance: {q(d)}{u} }},")
    L.append('    ],'+(f"\n    more: {json.dumps(more,ensure_ascii=False)}," if more else '')+'\n  },')
    rows=allrows
    stat.append((s,len(rows),len({x['chain'] for x in rows})))
L.append('''};

export function getVerifiedStores(stationSlug: string): StationVerifiedStores | undefined {
  return STATION_VERIFIED_STORES[stationSlug];
}
''')
open(out_path,'w',encoding='utf-8').write('\n'.join(L))
json.dump(stat,open(os.path.join(B,'gen_stat.json'),'w'))
print(len(slugs),'stations',sum(x[1] for x in stat),'stores; zero-chain stations:',[x[0] for x in stat if x[2]==0])
