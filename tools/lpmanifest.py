# Erzeugt js/lpmanifest.js: alle gemalten Bilder, die beim Start vorgeladen werden (ohne die vielen Spieler-Skins)
import os, json
R = 'assets/lowpoly'
M = {'items': [], 'bg': [], 'menu': [], 'spr': [], 'rings': []}
for d in sorted(os.listdir(R)):
    p = os.path.join(R, d)
    if not os.path.isdir(p) or d in ('spieler', 'figuren', 'welt'): continue
    for root, _, files in os.walk(p):
        for f in sorted(files):
            rel = os.path.relpath(os.path.join(root, f), R)
            name, ext = os.path.splitext(rel)
            if d == 'items' and ext == '.png': M['items'].append(os.path.basename(name))
            elif d == 'bg' and ext == '.jpg': M['bg'].append(os.path.basename(name))
            elif d == 'menu' and ext == '.jpg': M['menu'].append(os.path.basename(name))
            elif f == 'rand.webp': M['rings'].append(d)
            elif ext == '.png' and f != 'map.png': M['spr'].append(name)
for k in ('lion', 'bear', 'dog'):
    for f in sorted(os.listdir(os.path.join(R, 'spieler', k, 'basis'))):
        if f.endswith('.png'): M['spr'].append('spieler/%s/basis/%s' % (k, f[:-4]))
open('js/lpmanifest.js', 'w').write("'use strict';\n// Vom Skript tools/lpmanifest.py erzeugt – nicht von Hand ändern\nconst LP_MANIFEST = " + json.dumps(M, separators=(',', ':')) + ";\n")
print({k: len(v) for k, v in M.items()})
