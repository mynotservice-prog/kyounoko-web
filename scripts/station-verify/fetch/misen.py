"""味仙: 公式 www.misen.ne.jp/store/（今池本店・JR名古屋駅店の2店）。ほかの味仙の店は別経営でこの公式に載らない"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _lib import get, clean, strip_zip, add_pref, save
SRC = 'https://www.misen.ne.jp/store/'
rows = [{'name': '味仙 ' + clean(n), 'address': add_pref(strip_zip(clean(a))), 'lat': None, 'lng': None, 'url': SRC}
        for n, a in re.findall(r'<h2>(.*?)</h2>.*?所在地</th>\s*<td[^>]*>(.*?)</td>', get(SRC), re.S)]
save('misen', rows, {'coord': 'none', 'source': SRC, 'scope': '公式サイトに載る2店のみ。味仙の名の他店（別経営）は含まない', 'fetched': '2026-11-02'})
