import runpy, sys, os
# Canlı Sözlük müziği: sistem/sablonlar/canli-sozluk/muzik.py
sys.argv[0] = p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "sistem", "sablonlar", "canli-sozluk", "muzik.py")
runpy.run_path(p, run_name="__main__")
