"""串カツ田中: can-ly ディレクトリ型 /v2/directories/49/shops/search（Origin・Referer必須）"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import *
src = 'https://restaurant.kushi-tanaka.com/'
def note(s):
    b = (s.get('brand') or {}).get('name')
    return '' if b == '串カツ田中' else f'業態: {b}'
save('kushikatsu-tanaka', canly_rows('kushikatsu-tanaka', canly_directory(49, src), src, lambda s: '串カツ田中' in ((s.get('brand') or {}).get('name') or ''), note))
