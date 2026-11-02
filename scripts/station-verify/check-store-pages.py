"""matched.json の全店の公式ページを1店ずつ開き、休業・閉店の告知を拾う（store-pages.json）。
一覧のAPIに出ない休業が2026-11-02の31駅で6店見つかったので、駅を足すときは必ず回す。
見つけた店は store-status.json に足す。"""
import json,os,re,html,sys,time,urllib.request,urllib.parse,ssl,collections
B=os.path.dirname(os.path.abspath(__file__))
from concurrent.futures import ThreadPoolExecutor
m=json.load(open(os.path.join(B,'matched.json')))
urls=collections.defaultdict(list)
for s,v in m.items():
    for x in v:
        if x['excluded'] or not x.get('url') or x.get('uncertain'): continue
        urls[x['url']].append((s,x['chain'],x['name'],x['m']))
by=collections.defaultdict(list)
for u in urls: by[urllib.parse.urlparse(u).netloc].append(u)
print(len(urls),{k:len(v) for k,v in by.items()},flush=True)
RX=re.compile(r'休業|閉店|改装|一時閉|臨時休|テイクアウト専門|お持ち帰り専門|持ち帰り専門|リニューアル|移転')
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36'
ctx=ssl._create_unverified_context()
out={}
def one(host):
    for u in by[host]:
        rec={'status':None,'hits':[],'title':''}
        for attempt in range(2):
            try:
                r=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':UA}),timeout=25,context=ctx)
                raw=r.read(); t=raw.decode(r.headers.get_content_charset() or 'utf-8','ignore'); rec['status']=r.status
                ti=re.search(r'<title>(.*?)</title>',t,re.S); rec['title']=html.unescape(ti.group(1)).strip()[:90] if ti else ''
                t=re.sub(r'<script.*?</script>|<style.*?</style>|<!--.*?-->','',t,flags=re.S);t=re.sub(r'<[^>]+>',' ',t);t=re.sub(r'\s+',' ',html.unescape(t))
                last=-200
                for k in RX.finditer(t):
                    if k.start()-last<100: continue
                    rec['hits'].append(t[max(0,k.start()-45):k.end()+70]); last=k.start()
                rec['len']=len(t)
                break
            except urllib.error.HTTPError as e:
                rec['status']=e.code; break
            except Exception as e:
                rec['status']='ERR '+str(e)[:60]; time.sleep(2)
        out[u]=dict(rec,stores=urls[u])
        time.sleep(1.0)
with ThreadPoolExecutor(len(by)) as ex: list(ex.map(one,by))
json.dump(out,open(os.path.join(B,'store-pages.json'),'w'),ensure_ascii=False,indent=0)
print('done',len(out))
