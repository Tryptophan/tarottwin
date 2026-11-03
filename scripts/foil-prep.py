"""Prepare the card art for foilsmith and write the shipped art images.

usage: foil-prep.py CARDS_DIR WORK_SRC_DIR OUT_FOIL_DIR OUT_W [ids...]

For every original (CARDS_DIR/<id>.webp):
 1. find the outer edge of the black illustration frame line (from each side, the first line whose
    dark-pixel fraction over the central 70% of the span passes 0.4; cream margin and scan edge are skipped)
    and cut everything outside it (the black line stays as the art's own edge);
 2. majors, aces and court cards (minors 1 and 11..14) have their title in a light band at the bottom,
    inside the frame. Cut the art at the dark separator line above that band (the last row of the line
    stays): that drops the band and the outer bottom frame line. The separator is the row with the most
    near-full-width dark pixels in the 5..12% bottom strip;
 3. bring everything to one common aspect: the median of the cropped MAJORS. Cards that are too tall (minors
    without a band) lose rows top and bottom, evenly; too wide ones lose up to MAXTRIM columns and absorb
    the rest with a slight resize.
Writes OUT_FOIL_DIR/<id>/art.webp (OUT_W wide, lossy q85) and WORK_SRC_DIR/<id>.png, the art height-fitted on
foilsmith's fixed 630x880 card and centred on black, plus WORK_SRC_DIR/prep.json (artAspect, cropW, boxes).
"""
import json, os, sys
import numpy as np
from PIL import Image

CARD_W, CARD_H, MAXTRIM = 630, 880, 10
cards, work, outdir, out_w = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
ids = sys.argv[5:] or sorted(f[:-5] for f in os.listdir(cards) if f.endswith(".webp"))

def first(profile, limit, thr=0.4):
    for i in range(limit):
        if profile[i] > thr:
            return i
    raise SystemExit("no frame line found")

def has_band(id):
    if id.startswith("major"):
        return True
    n = int(id.split("-")[1])
    return n == 1 or n >= 11

def detect(id):
    im = Image.open(os.path.join(cards, id + ".webp")).convert("RGB")
    g = np.asarray(im.convert("L"), dtype=float)
    H, W = g.shape
    dark = g < 110
    col = dark[int(H * .15):int(H * .85), :].mean(axis=0)
    row = dark[:, int(W * .15):int(W * .85)].mean(axis=1)
    L, R = first(col, int(W * .2)), first(col[::-1], int(W * .2))
    T, B = first(row, int(H * .15)), first(row[::-1], int(H * .15))
    box = [L, T, W - R, H - B]
    if has_band(id):
        sub = g[box[1]:box[3], box[0]:box[2]]
        h, w = sub.shape
        prof = (sub[:, int(w * .04):int(w * .96)] < 120).mean(axis=1)
        lo, hi = h - int(h * .12), h - int(h * .05)
        k = lo + int(np.argmax(prof[lo:hi]))
        if prof[k] < .5:
            raise SystemExit(f"{id}: no band separator found")
        while k + 1 < h and prof[k + 1] > .5:
            k += 1
        box[3] = box[1] + k + 1
    return im, box

all_ids = sorted(f[:-5] for f in os.listdir(cards) if f.endswith(".webp"))
data = {id: detect(id) for id in all_ids}
# the common aspect: median of the cropped majors (over ALL cards, so a subset run matches a full run)
asp = sorted((b[2] - b[0]) / (b[3] - b[1]) for id, (_, b) in data.items() if id.startswith("major"))
art_aspect = float(np.median(asp))
crop_w = round(CARD_H * art_aspect)
out_h = round(out_w / art_aspect)

stats = {}
os.makedirs(work, exist_ok=True)
for id in ids:
    im, (l, t, r, b) = data[id]
    w, h = r - l, b - t
    want_w = round(h * art_aspect)
    if w > want_w:      # too wide: trim a few columns, the rest is a slight squeeze
        d = min(w - want_w, MAXTRIM); l += d // 2; r -= d - d // 2
    elif w < want_w:    # too tall: trim rows evenly
        d = h - round(w / art_aspect); t += d // 2; b -= d - d // 2
    crop = im.crop((l, t, r, b))
    stats[id] = {"box": [l, t, r, b], "stretch": round(((r - l) / (b - t)) / art_aspect, 4)}
    os.makedirs(os.path.join(outdir, id), exist_ok=True)
    crop.resize((out_w, out_h), Image.LANCZOS).save(os.path.join(outdir, id, "art.webp"), quality=85, method=6)
    card = Image.new("RGB", (CARD_W, CARD_H), (0, 0, 0))
    card.paste(crop.resize((crop_w, CARD_H), Image.LANCZOS), ((CARD_W - crop_w) // 2, 0))
    card.save(os.path.join(work, id + ".png"))
json.dump({"artAspect": art_aspect, "cropW": crop_w, "outW": out_w, "outH": out_h, "cards": stats},
          open(os.path.join(work, "prep.json"), "w"), indent=1)
print(json.dumps({"artAspect": art_aspect, "cropW": crop_w, "outH": out_h, "maxStretch": max(abs(s["stretch"] - 1) for s in stats.values())}))
