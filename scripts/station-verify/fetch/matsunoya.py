import sys,os,re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _navitime import list_all, cats, row, save, PREF
from _geo_common import norm, log
items = list_all('matsuyafoods')
rows = [row('matsunoya', 'matsuyafoods', it, 'テイクアウト専門' if 'テイクアウト専門' in it['name'] else '') for it in items if '0203' in dict(cats(it))]
log(f'[matsunoya] API {len(items)} 件 → 松のや {len(rows)}')
save('matsunoya', 'matsuyafoods', rows, {'filter': 'category 0203 松のや（松屋併設店も松のや側のエントリとして入る）'})
