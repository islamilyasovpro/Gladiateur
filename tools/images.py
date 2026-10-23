"""Prépare les illustrations : assets/raw/<nom>.(png|jpg|webp) -> assets/<nom>.webp
redimensionnées (1600 px max, 900 px pour les vignettes ev-*) et compressées.
Usage : python3 tools/images.py   (nécessite Pillow : pip install pillow)"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
raw, out = root / 'assets' / 'raw', root / 'assets'
for src in sorted(raw.glob('*')):
    if src.suffix.lower() not in ('.png', '.jpg', '.jpeg', '.webp'):
        continue
    name = src.stem.lower()
    im = Image.open(src).convert('RGB')
    im.thumbnail((900, 900) if name.startswith('ev-') else (1600, 1600), Image.LANCZOS)
    dst = out / f'{name}.webp'
    im.save(dst, 'WEBP', quality=78, method=6)
    print(f'{dst.relative_to(root)}  {im.size[0]}x{im.size[1]}  {dst.stat().st_size // 1024} Ko')
