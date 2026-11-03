import sys,os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _zensho import fetch
fetch("sukiya", "https://maps.sukiya.jp", "すき家")
