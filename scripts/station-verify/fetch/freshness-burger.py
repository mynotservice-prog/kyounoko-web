"""フレッシュネスバーガー: can-ly 企業型 /v2/companies/630/shops/search"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svlib import *
save('freshness-burger', canly_rows('freshness-burger', canly_company(630, 'https://search.freshnessburger.co.jp/'), 'https://search.freshnessburger.co.jp/'))
