import sys,os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _skylark import fetch
fetch("gusto", "0101")
