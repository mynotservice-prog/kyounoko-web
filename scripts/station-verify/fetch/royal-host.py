"""ロイヤルホスト: can-ly 企業型 /v2/companies/872/shops/search"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import *
save('royal-host', canly_rows('royal-host', canly_company(872, 'https://locations.royalhost.jp/'), 'https://locations.royalhost.jp/'))
