"""フォルクス: アークミールの公式店舗一覧 https://www.volks-steak.jp/shop_list.html?pref=0。座標なし（住所から出す）"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, save
O = 'https://www.volks-steak.jp'
h = re.sub(r'<!--.*?-->', '', get(O + '/shop_list.html?pref=0'), flags=re.S)
rows = {}
for r in re.findall(r'<tr>\s*<td class="shoplist_name">.*?</tr>', h, re.S):
    a = re.search(r'href="(shop_detail\.html\?snum=\d+)">(.*?)</a>', r, re.S)
    tds = re.findall(r'<td(?:\s[^>]*)?>(.*?)</td>', r, re.S)
    addr = clean(tds[2].split('<br')[0])
    rows[a.group(1)] = {'name': clean(a.group(2)), 'address': addr, 'lat': None, 'lng': None, 'url': O + '/' + a.group(1), 'note': ''}
save('volks', list(rows.values()), {'coverage': 'all-official', 'coord': 'none', 'source': O + '/shop_list.html?pref=0'})
