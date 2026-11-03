"""築地銀だこ: can-ly ディレクトリ型 https://stores.gindaco.com/ （directory 7・ブランド 262）。店名が「銀だこ」で始まる酒場系は除く。
一覧にイートインの有無が無いので、各店の詳細ページの「イートイン」のチェックを読み、外れている店は note に残す"""
import sys, os, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import *
SRC = 'https://stores.gindaco.com/'
shops = [x for x in canly_directory(7, SRC) if (x.get('brand') or {}).get('id') == 262 and not re.search('酒場', x['nameKanji'])]
def note(x):
    if x.get('openStatus') == 'IS_CLOSED': return '閉店（公式の状態 IS_CLOSED）'
    p = get(f"{SRC}detail/{x['storeCode']}/", f"gindaco_{x['storeCode']}.html").decode('utf-8', 'replace')
    m = re.search(r'"label":"イートイン","checked":(true|false)', p)
    if not m: return 'イートインの表示なし（公式の詳細ページ）'
    return '' if m.group(1) == 'true' else 'テイクアウト専門（公式のサービス欄でイートインが未チェック）'
rows = canly_rows('gindaco', shops, SRC, note=note)
save('gindaco', rows, {'coverage': 'national', 'coord': 'wgs84', 'source': SRC})
