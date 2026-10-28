"""カフェ・ベローチェ: C-United 公式店舗検索の検索API（bounds 指定）。brand=1（カフェ・ベローチェ）だけに絞る。
日本全体を1回で取り、打ち切りが無いことを4分割の合算と突き合わせて確かめる。"""
import re, sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import datetime
from _lib import get, save, num, clean
TODAY = datetime.date.today()
API = 'https://c-united.co.jp/store/request_search/?bounds='
H = {'X-Requested-With': 'XMLHttpRequest', 'Referer': 'https://c-united.co.jp/store/'}
def q(s, n, w, e): return json.loads(get(f'{API}{s},{n},{w},{e}', headers=H))
whole = q(24, 46, 122, 154)
parts = q(24, 35.6, 122, 154) + q(35.6, 35.75, 122, 154) + q(35.75, 46, 122, 139.7) + q(35.75, 46, 139.7, 154)
ids_w = {s['id'] for s in whole}; ids_p = {s['id'] for s in parts}
print('全体', len(ids_w), '4分割の合算', len(ids_p), '差', len(ids_w ^ ids_p))
allst = {s['id']: s for s in whole + parts}
def ymd(s, k):
    y, m, d = s.get(k + '_year'), s.get(k + '_month'), s.get(k + '_day')
    return (int(y), int(m), int(d or 1)) if y and m else None
stores = []
for s in allst.values():
    if s.get('brand') != 1: continue
    addr = (s.get('pref') or '') + (s.get('address') or '') + ((' ' + s['address2']) if s.get('address2') else '')
    notes = []
    o, c = ymd(s, 'open_start'), ymd(s, 'open_end')
    if o and datetime.date(*o) > TODAY: notes.append('開店予定 %d/%d/%d' % o)
    if c: notes.append(('閉店予定 ' if datetime.date(*c) >= TODAY else '閉店日 ') + '%d/%d/%d' % c)
    if s.get('about_business'): notes.append(clean(s['about_business']))
    if s.get('other') and re.search(r'閉店|休業|オープン|改装|移転', s['other']): notes.append(clean(s['other']))
    stores.append({'name': s['name'].strip(), 'address': addr.strip(), 'lat': num(s.get('latitude')), 'lng': num(s.get('longitude')), 'url': f"https://c-united.co.jp/store/detail/{s['code']}/", 'note': ' / '.join(notes)[:300]})
save('veloce', stores, {'source': API + '24,46,122,154', 'coord': 'wgs84? (APIの latitude/longitude。Googleマップ表示用の値)', 'all_brands_total': len(allst)})
