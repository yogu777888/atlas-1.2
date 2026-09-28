"""
Builds the tag.bet wordmark as SVG outlines from Onest ExtraBold, with
hand-tuned spacing and the flip tile. Usage: python3 scripts/build-wordmark.py <variant>
Prints JSON {viewBox, letters, tile} for the chosen variant.
"""
import json, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

FONT = "src/assets/fonts/Onest-ExtraBold.ttf"
f = TTFont(FONT)
gs = f.getGlyphSet(); cmap = f.getBestCmap(); hmtx = f["hmtx"]
XH, ASC, DESC = 527, 720, -250  # x-height, top of b, bottom of g (font units)

# Optical kerning in font units (negative = tighter). Tuned by eye for the heavy weight.
PAIRS = {"ta": -38, "ag": -22, "be": -26, "et": -30}

VARIANTS = {
    # tile: w, h in font units; y = bottom of tile above baseline; gapL/gapR = space around it
    "now":    dict(w=340, h=340, y=0,   gapL=50, gapR=45, r=60, kern=False),
    "dot":    dict(w=250, h=250, y=0,   gapL=44, gapR=52, r=38),
    "mid":    dict(w=236, h=236, y=146, gapL=52, gapR=58, r=36),
    "tile":   dict(w=330, h=XH,  y=0,   gapL=58, gapR=64, r=54),
}

def glyph_path(ch, x):
    pen = SVGPathPen(gs)
    # flip Y: font units go up, SVG goes down; baseline at y=ASC
    gs[cmap[ord(ch)]].draw(TransformPen(pen, (1, 0, 0, -1, x, ASC)))
    return pen.getCommands()

def build(v):
    t = VARIANTS[v]
    x, letters = 0, []
    def put(word):
        nonlocal x
        for i, ch in enumerate(word):
            letters.append(glyph_path(ch, x))
            x += hmtx[cmap[ord(ch)]][0]
            if i + 1 < len(word) and t.get("kern", True):
                x += PAIRS.get(word[i] + word[i + 1], 0)
    put("tag")
    x += t["gapL"] - 20  # glyph sidebearing already adds ~20
    tile = dict(x=x, y=ASC - t["y"] - t["h"], w=t["w"], h=t["h"], r=t["r"])
    x += t["w"] + t["gapR"] - 40
    put("bet")
    width = x
    return dict(viewBox=f"0 0 {round(width)} {ASC - DESC}", d=" ".join(letters), tile=tile, height=ASC - DESC)

print(json.dumps(build(sys.argv[1] if len(sys.argv) > 1 else "dot")))
