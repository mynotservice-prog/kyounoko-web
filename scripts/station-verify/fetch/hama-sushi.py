import sys,os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _zensho import fetch
fetch("hama-sushi", "https://maps.hama-sushi.co.jp", "はま寿司")
