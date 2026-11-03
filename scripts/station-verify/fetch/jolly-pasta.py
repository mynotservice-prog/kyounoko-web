"""ジョリーパスタ: ゼンショー系共通店舗検索 https://maps.jolly-pasta.co.jp/jp/api/search（都道府県別・住所と座標つき）。"""
import sys,os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _zensho import fetch
from _geo_common import write
rows = fetch("jolly-pasta", "https://maps.jolly-pasta.co.jp", "ジョリーパスタ")
keep = [r for r in rows if r['name'].startswith('ジョリーパスタ')]   # 同じ検索に載る別業態（ジョリーオックス）を除く
write("jolly-pasta", keep, 'national', 'wgs84', {'source': "https://maps.jolly-pasta.co.jp/jp/index.html", 'national_header_count': len(rows), 'other_brands_excluded': sorted(r['name'] for r in rows if r not in keep)})
