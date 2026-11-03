"""Crop and encode a foilsmith map (PNG) as WebP, preserving every channel.

usage: foil-webp.py in.png out.webp [--channel R] --crop W|--join W --height H --width OUTW (--lossless | --quality Q) [--filter bilinear|lanczos]

--crop W   keep the centred W-px-wide column of the full-size map
--join W   (frame layers) keep the left W/2 and right W/2 columns, joined, so all four rounded corners
           survive; refuses if the columns that are dropped differ from each other (not a uniform middle)
Then each channel is resized on its own (no premultiplying) to OUTW x H and saved. Lossless saves use
exact=True (needs Pillow >= 9.1) so the RGB under alpha 0 survives: the FX map keeps depth and the
art window there, which ImageMagick 6 would zero.
"""
import argparse
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("dst")
g = ap.add_mutually_exclusive_group(required=True)
g.add_argument("--crop", type=int); g.add_argument("--join", type=int)
ap.add_argument("--width", type=int, required=True); ap.add_argument("--height", type=int, required=True)
q = ap.add_mutually_exclusive_group(required=True)
q.add_argument("--lossless", action="store_true"); q.add_argument("--quality", type=int)
ap.add_argument("--filter", default="lanczos")
ap.add_argument("--channel", choices=list("RGBA"), help="keep only this channel, saved as opaque grayscale")
a = ap.parse_args()

im = Image.open(a.src).convert("RGBA")
W, H = im.size
if a.crop:
    x = (W - a.crop) // 2
    im = im.crop((x, 0, x + a.crop, H))
else:
    half = a.join // 2
    mid = im.crop((half, 0, W - half, H))
    # every dropped column must equal the first one, else the frame is not uniform across the middle
    # (compared premultiplied: RGB under alpha 0 is irrelevant noise in a frame layer)
    mid = mid.convert("RGBa")
    first = mid.crop((0, 0, 1, H)).tobytes()
    for cx in range(mid.width):
        if mid.crop((cx, 0, cx + 1, H)).tobytes() != first:
            raise SystemExit(f"{a.src}: middle columns are not uniform (column {half + cx})")
    out = Image.new("RGBA", (half * 2, H))
    out.paste(im.crop((0, 0, half, H)), (0, 0))
    out.paste(im.crop((W - half, 0, W, H)), (half, 0))
    im = out
if a.channel:
    im = im.getchannel(a.channel).convert("RGBA")  # (grayscale written below)
flt = {"bilinear": Image.BILINEAR, "lanczos": Image.LANCZOS}[a.filter]
if a.channel:
    im = im.getchannel("R")
    if im.size != (a.width, a.height):
        im = im.resize((a.width, a.height), flt)
    if a.lossless:
        im.save(a.dst, lossless=True, exact=True, quality=100, method=4)
    else:
        im.save(a.dst, quality=a.quality, method=4)
    raise SystemExit(0)
if im.size != (a.width, a.height):
    im = Image.merge("RGBA", [c.resize((a.width, a.height), flt) for c in im.split()])
if a.lossless:
    im.save(a.dst, lossless=True, exact=True, quality=100, method=6)
else:
    im.save(a.dst, quality=a.quality, method=6)
