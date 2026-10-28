"""大戸屋: can-ly 企業型 /v2/companies/522/shops/search（全店・座標つき）"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import *
save('ootoya', canly_rows('ootoya', canly_company(522, 'https://store.ootoya.com/'), 'https://store.ootoya.com/'))
