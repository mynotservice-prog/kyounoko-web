import sys,os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _zensho import fetch
fetch("cocos", "https://maps.cocos-jpn.co.jp", "ココス")
