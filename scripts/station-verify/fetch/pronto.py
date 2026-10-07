"""プロント: can-ly ディレクトリ型 /v2/directories/62/shops/search（Origin・Referer必須）。
Di PUNTO・È PRONTO・和カフェTsumugi・IL BAR・エビノスパゲッティ・Brioche Dorée・その他 は除く"""
import sys, os, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import *
KEEP = {'PRONTO': '', 'PRONTO（夜はバーメニュー）': '夜はバーメニュー', 'プロントカフェ（ガソリンスタンド併設店舗）': 'PRONTO CAFFE（ガソリンスタンド併設）'}
def keep(s):
    b = (s.get('brand') or {}).get('name')
    return b in KEEP and not re.match(r'\s*(IL BAR|È PRONTO|和カフェ|ワインの酒場)', s['nameKanji'])
def note(s):
    n = KEEP[(s.get('brand') or {}).get('name')]
    if not re.match(r'\s*PRONTO', s['nameKanji']): n = (n + '／' if n else '') + '店名がPRONTOで始まらない併設・コラボ店'
    return n
src = 'https://shop.pronto.co.jp/'
save('pronto', canly_rows('pronto', canly_directory(62, src), src, keep, note))
