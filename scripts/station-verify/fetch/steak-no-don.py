"""ステーキのどん: アークミールの公式店舗一覧 https://www.steak-don.jp/shop_list.html?pref=0。座標なし（住所から出す）"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
O = 'https://www.steak-don.jp'
h = re.sub(r'<!--.*?-->', '', get(O + '/shop_list.html?pref=0'), flags=re.S)
rows = {}
for r in re.findall(r'<tr>\s*<td class="shoplist_name">.*?</tr>', h, re.S):
    a = re.search(r'href="(shop_detail\.html\?snum=\d+)">(.*?)</a>', r, re.S)
    tds = re.findall(r'<td(?:\s[^>]*)?>(.*?)</td>', r, re.S)
    addr = clean(tds[2].split('<br')[0])
    if addr.startswith('富里市'): addr = '千葉県' + addr   # 公式の表記に県が無い1店
    rows[a.group(1)] = {'name': clean(a.group(2)), 'address': addr, 'lat': None, 'lng': None, 'url': O + '/' + a.group(1), 'note': ''}
save('steak-no-don', list(rows.values()), {'coverage': 'all-official', 'coord': 'none', 'source': O + '/shop_list.html?pref=0'})
