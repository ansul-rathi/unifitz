"""Unifitz app icon family (member / teacher / admin) from the web BrandMark "U".

Usage:  python3 scripts/make_app_icons.py preview <outdir>
        python3 scripts/make_app_icons.py install <app_dir> <member|teacher|admin>

Draws vector-ish shapes with PIL at 4x and downsamples for anti-aliasing.
Outputs: iOS AppIcon set (opaque), Android legacy mipmaps + adaptive layers
(background / foreground / monochrome, 108dp with safe-zone sizing).
"""
import json
import math
import os
import sys

from PIL import Image, ImageDraw, ImageFilter

SS = 4  # supersampling
ORANGE_TOP, ORANGE_BOT = (249, 115, 22), (194, 65, 12)
PEACH = (255, 231, 211)
WHITE = (255, 255, 255)
GOLD = (251, 191, 36)
NAVY_TOP, NAVY_BOT = (11, 18, 32), (30, 41, 59)
TEAL_TOP, TEAL_BOT = (20, 184, 166), (15, 94, 89)


# ── primitives ──────────────────────────────────────────────────────────────
def gradient(size, top, bot):
    w, h = size
    col = Image.new('RGB', (1, h))
    for y in range(h):
        t = y / max(1, h - 1)
        col.putpixel((0, y), tuple(round(a + (b - a) * t) for a, b in zip(top, bot)))
    return col.resize((w, h))


def u_mark(d, cx, top, half, r_bottom, w, color):
    """Brand 'U': two round-capped stems + bottom semicircle (centerline coords)."""
    y_turn = top + (r_bottom * 1.54)  # stem length ≈ web proportions
    for x in (cx - half, cx + half):
        d.rectangle([x - w / 2, top, x + w / 2, y_turn], fill=color)
        d.ellipse([x - w / 2, top - w / 2, x + w / 2, top + w / 2], fill=color)
    R = half + w / 2
    d.arc([cx - R, y_turn - R, cx + R, y_turn + R], 0, 180, fill=color, width=round(w))
    return y_turn + half + w / 2  # lowest point of the U


def bezier(p0, p1, p2, n=60):
    return [((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
             (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]) for t in (i / n for i in range(n + 1))]


# ── glyphs (drawn on a transparent 1024*SS layer, later auto-fitted) ────────
def glyph_member(mono=False):
    S = 1024 * SS
    im = Image.new('RGBA', (S, S))
    d = ImageDraw.Draw(im)
    k = SS
    bottom = u_mark(d, 512 * k, 240 * k, 192 * k, 192 * k, 112 * k, WHITE)
    r = 52 * k
    cy = bottom + 70 * k + r
    d.ellipse([512 * k - r, cy - r, 512 * k + r, cy + r], fill=WHITE if mono else PEACH)
    return im


def glyph_teacher(mono=False):
    """'U' as a lanyard with a coach's whistle hanging at the bottom."""
    S = 1024 * SS
    im = Image.new('RGBA', (S, S))
    d = ImageDraw.Draw(im)
    k = SS
    bottom = u_mark(d, 512 * k, 200 * k, 180 * k, 180 * k, 92 * k, WHITE)
    body = WHITE if mono else ORANGE_TOP
    # ring + short link from the lanyard
    link_top = bottom - 10 * k
    ring_c = (512 * k, link_top + 52 * k)
    d.ellipse([ring_c[0] - 30 * k, ring_c[1] - 30 * k, ring_c[0] + 30 * k, ring_c[1] + 30 * k], outline=body, width=round(18 * k))
    # whistle: round chamber + mouthpiece to the right
    cr = 128 * k
    cx, cy = 470 * k, ring_c[1] + 30 * k + cr - 6 * k
    d.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], fill=body)
    d.rounded_rectangle([cx, cy - cr, cx + 270 * k, cy - cr + 112 * k], radius=34 * k, fill=body)
    hole = [cx - 46 * k, cy - 26 * k, cx + 46 * k, cy + 66 * k]
    d.ellipse(hole, fill=(0, 0, 0, 0) if mono else PEACH)  # sound hole
    return im


def glyph_admin(mono=False):
    """Orange shield with the brand 'U' + dot."""
    S = 1024 * SS
    im = Image.new('RGBA', (S, S))
    d = ImageDraw.Draw(im)
    k = SS
    L, R, T, MID_T, SIDE_B, P = 210, 814, 215, 150, 540, 880
    pts = bezier((L, T), (512, MID_T - 70), (R, T))
    pts += [(R, SIDE_B)] + bezier((R, SIDE_B), (R - 20, 760), (512, P))[1:]
    pts += bezier((512, P), (L + 20, 760), (L, SIDE_B))[1:]
    pts = [(x * k, y * k) for x, y in pts]
    if mono:
        d.polygon(pts, fill=WHITE)
        cut = Image.new('L', im.size, 0)
        cd = ImageDraw.Draw(cut)
        bottom = u_mark(cd, 512 * k, 330 * k, 120 * k, 120 * k, 76 * k, 255)
        r = 34 * k
        cy = bottom + 46 * k + r
        cd.ellipse([512 * k - r, cy - r, 512 * k + r, cy + r], fill=255)
        alpha = im.getchannel('A')
        alpha.paste(0, mask=cut)
        im.putalpha(alpha)
        return im
    fill = gradient(im.size, ORANGE_TOP, ORANGE_BOT).convert('RGBA')
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).polygon(pts, fill=255)
    im.paste(fill, mask=mask)
    d.line(pts + [pts[0]], fill=GOLD, width=round(16 * k), joint='curve')
    bottom = u_mark(d, 512 * k, 330 * k, 120 * k, 120 * k, 76 * k, WHITE)
    r = 34 * k
    cy = bottom + 46 * k + r
    d.ellipse([512 * k - r, cy - r, 512 * k + r, cy + r], fill=PEACH)
    return im


APPS = {
    # (glyph, bg top, bg bottom, size on full icons, size on Android adaptive layer)
    'member': (glyph_member, ORANGE_TOP, ORANGE_BOT, 0.60, 0.50),
    'teacher': (glyph_teacher, TEAL_TOP, TEAL_BOT, 0.66, 0.56),
    'admin': (glyph_admin, NAVY_TOP, NAVY_BOT, 0.72, 0.60),
}


def fit(glyph, size, frac):
    """Crop glyph to its content and centre it, scaled to frac of size."""
    g = glyph.crop(glyph.getbbox())
    s = frac * size / max(g.size)
    g = g.resize((max(1, round(g.width * s)), max(1, round(g.height * s))), Image.LANCZOS)
    out = Image.new('RGBA', (size, size))
    out.paste(g, ((size - g.width) // 2, (size - g.height) // 2), g)
    return out


def full_icon(kind, size=1024, rounded=False):
    gfn, top, bot, frac, _ = APPS[kind]
    big = 1024 * SS
    bg = gradient((big, big), top, bot).convert('RGBA')
    glow = fit(gfn(), big, frac)
    if kind == 'admin':  # soft orange halo behind the shield
        halo = Image.new('RGBA', bg.size, (*ORANGE_TOP, 0))
        halo.putalpha(glow.getchannel('A').filter(ImageFilter.GaussianBlur(40 * SS)).point(lambda v: v * 0.45))
        bg = Image.alpha_composite(bg, halo)
    bg = Image.alpha_composite(bg, glow)
    if rounded:
        m = Image.new('L', bg.size, 0)
        ImageDraw.Draw(m).rounded_rectangle([0, 0, big - 1, big - 1], radius=round(big * 0.22), fill=255)
        bg.putalpha(m)
    return bg.resize((size, size), Image.LANCZOS)


def adaptive_layers(kind, px):
    """Android adaptive icon layers at px (108dp). Content within the 66% safe zone."""
    gfn, top, bot, _, frac = APPS[kind]
    big = 1024 * SS
    bgl = gradient((px, px), top, bot)
    fg = fit(gfn(), big, frac).resize((px, px), Image.LANCZOS)
    mono = fit(gfn(mono=True), big, frac).resize((px, px), Image.LANCZOS)
    return bgl, fg, mono


DENS = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}

ADAPTIVE_XML = '''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
    <monochrome android:drawable="@mipmap/ic_launcher_monochrome" />
</adaptive-icon>
'''


def install(app_dir, kind):
    master = full_icon(kind, 1024)
    # iOS: opaque squares for every size in Contents.json
    ios = os.path.join(app_dir, 'ios/Runner/Assets.xcassets/AppIcon.appiconset')
    for img in json.load(open(os.path.join(ios, 'Contents.json')))['images']:
        px = round(float(img['size'].split('x')[0]) * int(img['scale'][0]))
        master.resize((px, px), Image.LANCZOS).convert('RGB').save(os.path.join(ios, img['filename']))
    # Android legacy + adaptive
    res = os.path.join(app_dir, 'android/app/src/main/res')
    rounded = full_icon(kind, 1024, rounded=True)
    for name, f in DENS.items():
        d = os.path.join(res, f'mipmap-{name}')
        os.makedirs(d, exist_ok=True)
        rounded.resize((round(48 * f), round(48 * f)), Image.LANCZOS).save(os.path.join(d, 'ic_launcher.png'))
        bg, fg, mono = adaptive_layers(kind, round(108 * f))
        bg.save(os.path.join(d, 'ic_launcher_background.png'))
        fg.save(os.path.join(d, 'ic_launcher_foreground.png'))
        mono.save(os.path.join(d, 'ic_launcher_monochrome.png'))
    os.makedirs(os.path.join(res, 'mipmap-anydpi-v26'), exist_ok=True)
    open(os.path.join(res, 'mipmap-anydpi-v26/ic_launcher.xml'), 'w').write(ADAPTIVE_XML)


def preview(out):
    os.makedirs(out, exist_ok=True)
    tiles = []
    for kind in APPS:
        full_icon(kind, 1024).save(os.path.join(out, f'{kind}.png'))
        bg, fg, mono = adaptive_layers(kind, 432)
        circ = Image.new('L', (432, 432), 0)
        ImageDraw.Draw(circ).ellipse([0, 0, 431, 431], fill=255)
        launcher = Image.alpha_composite(bg.convert('RGBA'), fg)
        launcher.putalpha(circ)
        tiles.append((full_icon(kind, 360, rounded=True), launcher.resize((300, 300), Image.LANCZOS)))
    sheet = Image.new('RGB', (3 * 400, 760), (245, 245, 245))
    for i, (sq, ci) in enumerate(tiles):
        sheet.paste(sq, (i * 400 + 20, 20), sq)
        sheet.paste(ci, (i * 400 + 50, 420), ci)
    sheet.save(os.path.join(out, 'sheet.png'))


if __name__ == '__main__':
    if sys.argv[1] == 'preview':
        preview(sys.argv[2])
    else:
        install(sys.argv[2], sys.argv[3])
