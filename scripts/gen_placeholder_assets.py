"""Generate proper-quality brand assets for Islamic Daily Wisdom.

Outputs:
  assets/images/icon.png             1024x1024  full-bleed brand icon
  assets/images/adaptive-icon.png    1024x1024  foreground for Android adaptive (safe-zone padded)
  assets/images/splash.png           1284x2778  centered splash with logo + wordmark
  assets/images/notification-icon.png  96x96    monochrome silhouette for status bar
  assets/sounds/azan-default.mp3     short silent placeholder

Design language:
  - Islamic green background with subtle radial gradient (depth without distraction)
  - Gold elegant crescent (arched, not full circle) with 8-pointed star
  - Optional architectural arch motif on splash for cultural texture
  - Notification icon: pure white silhouette on transparent (Android requirement)

Run:
  python3 scripts/gen_placeholder_assets.py
"""
import math
import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / "assets" / "images"
SND = ROOT / "assets" / "sounds"
IMG.mkdir(parents=True, exist_ok=True)
SND.mkdir(parents=True, exist_ok=True)

GREEN = (15, 76, 58)
GREEN_LIGHT = (26, 110, 85)
GREEN_DARK = (8, 44, 34)
GREEN_DEEPER = (5, 30, 23)
GOLD = (212, 175, 55)
GOLD_LIGHT = (232, 198, 86)
GOLD_DEEP = (168, 136, 36)
CREAM = (248, 244, 233)
WHITE = (255, 255, 255)
TRANSPARENT = (0, 0, 0, 0)


def find_font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
    bold_candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
    ]
    regular_candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    pool = bold_candidates if bold else regular_candidates
    for path in pool:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def radial_gradient(size: int, inner: tuple, outer: tuple) -> Image.Image:
    """Vignette-style radial gradient — inner color at center, outer at edges."""
    base = Image.new("RGB", (size, size), outer)
    mask = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(mask)
    cx = cy = size // 2
    max_r = int(size * 0.7)
    for i in range(max_r, 0, -1):
        # alpha grows from 0 at edge to 255 at center
        alpha = int(255 * (1 - i / max_r) ** 1.4)
        md.ellipse([cx - i, cy - i, cx + i, cy + i], fill=alpha)
    inner_layer = Image.new("RGB", (size, size), inner)
    return Image.composite(inner_layer, base, mask)


def draw_crescent(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int,
                  color: tuple, mask_color: tuple, openness: float = 0.42):
    """Arched crescent (not symmetric ring). openness = how much of the disc is hidden."""
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)
    offset = int(r * openness)
    # Inner mask is shifted right with same radius to create elegant uniform arc
    draw.ellipse(
        [cx - r + offset, cy - r, cx + r + offset, cy + r],
        fill=mask_color,
    )


def eight_point_star(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int, color: tuple):
    """An 8-pointed Khatim Sulaymani style star (two overlapping squares rotated 45°)."""
    pts1 = [(cx + r * math.cos(math.radians(a)),
             cy + r * math.sin(math.radians(a))) for a in (-90, 0, 90, 180)]
    pts2 = [(cx + r * math.cos(math.radians(a)),
             cy + r * math.sin(math.radians(a))) for a in (-45, 45, 135, 225)]
    draw.polygon(pts1, fill=color)
    draw.polygon(pts2, fill=color)


def five_point_star(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int, color: tuple):
    pts = []
    for i in range(10):
        ang = -90 + i * 36
        rr = r if i % 2 == 0 else r * 0.42
        pts.append((cx + rr * math.cos(math.radians(ang)),
                    cy + rr * math.sin(math.radians(ang))))
    draw.polygon(pts, fill=color)


def make_icon(path: Path, size: int = 1024, padding: int = 0):
    """Full-bleed app icon: gradient bg + arched crescent + 8-pointed star."""
    bg = radial_gradient(size, GREEN_LIGHT, GREEN_DARK)
    layer = Image.new("RGBA", (size, size), TRANSPARENT)
    draw = ImageDraw.Draw(layer)

    inner = size - 2 * padding
    r = int(inner * 0.34)
    # Center on the crescent's visible mass (left half of the disc).
    cx = padding + inner // 2 - int(r * 0.10)
    cy = padding + inner // 2 + int(inner * 0.02)

    # Subtle outer ring (decorative frame)
    if padding == 0:
        ring_r = int(inner * 0.46)
        for w, alpha in [(8, 28), (4, 60)]:
            draw.ellipse(
                [cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r],
                outline=GOLD + (alpha,),
                width=w,
            )

    # Crescent — clean gold arch, no smudgy highlight
    crescent = Image.new("RGBA", (size, size), TRANSPARENT)
    cd = ImageDraw.Draw(crescent)
    draw_crescent(cd, cx, cy, r, GOLD + (255,), TRANSPARENT, openness=0.40)

    # 8-point star
    sx = cx + int(r * 0.92)
    sy = cy - int(r * 0.05)
    star_r = int(r * 0.20)
    sd_layer = Image.new("RGBA", (size, size), TRANSPARENT)
    sd = ImageDraw.Draw(sd_layer)
    eight_point_star(sd, sx, sy, star_r, GOLD + (255,))
    eight_point_star(sd, sx, sy, int(star_r * 0.55), GOLD_LIGHT + (255,))

    composed = Image.alpha_composite(bg.convert("RGBA"), layer)
    composed = Image.alpha_composite(composed, crescent)
    composed = Image.alpha_composite(composed, sd_layer)
    composed.convert("RGB").save(path, format="PNG", optimize=True)
    print(f"wrote {path.relative_to(ROOT)}  ({path.stat().st_size // 1024} KB)")


def make_adaptive_icon(path: Path, size: int = 1024):
    """Foreground only — sized to fit Android's 66% safe zone with margin."""
    img = Image.new("RGBA", (size, size), TRANSPARENT)
    draw = ImageDraw.Draw(img)
    # Safe zone is the inner 66% — keep logo within ~58% so it never clips
    r = int(size * 0.18)
    cx = size // 2 - int(r * 0.18)
    cy = size // 2 - int(size * 0.01)

    crescent = Image.new("RGBA", (size, size), TRANSPARENT)
    cd = ImageDraw.Draw(crescent)
    draw_crescent(cd, cx, cy, r, GOLD + (255,), TRANSPARENT, openness=0.40)

    sx = cx + int(r * 0.92)
    sy = cy - int(r * 0.05)
    star_r = int(r * 0.20)
    star_layer = Image.new("RGBA", (size, size), TRANSPARENT)
    sd = ImageDraw.Draw(star_layer)
    eight_point_star(sd, sx, sy, star_r, GOLD + (255,))
    eight_point_star(sd, sx, sy, int(star_r * 0.55), GOLD_LIGHT + (255,))

    img = Image.alpha_composite(img, crescent)
    img = Image.alpha_composite(img, star_layer)
    img.save(path, format="PNG", optimize=True)
    print(f"wrote {path.relative_to(ROOT)}  ({path.stat().st_size // 1024} KB)")


def make_splash(path: Path, w: int = 1284, h: int = 2778):
    bg = radial_gradient(max(w, h), GREEN_LIGHT, GREEN_DEEPER).resize((w, h))
    img = bg.convert("RGBA")
    draw = ImageDraw.Draw(img)

    cx = w // 2
    cy = h // 2 - int(h * 0.04)
    # Logo radius — was 0.13, bumped to 0.22 so the crescent fills meaningful
    # screen real estate after `resizeMode: contain` letterboxing.
    r = int(min(w, h) * 0.22)

    # Outer decorative ring (subtle, like a window frame)
    ring_r = int(r * 1.55)
    draw.ellipse([cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r],
                 outline=GOLD + (40,), width=5)
    inner_ring = int(r * 1.40)
    draw.ellipse([cx - inner_ring, cy - inner_ring, cx + inner_ring, cy + inner_ring],
                 outline=GOLD + (90,), width=3)

    # Crescent
    crescent = Image.new("RGBA", img.size, TRANSPARENT)
    cd = ImageDraw.Draw(crescent)
    draw_crescent(cd, cx, cy, r, GOLD + (255,), TRANSPARENT, openness=0.40)
    img = Image.alpha_composite(img, crescent)

    # Star
    sx = cx + int(r * 0.92)
    sy = cy - int(r * 0.05)
    star_r = int(r * 0.20)
    star = Image.new("RGBA", img.size, TRANSPARENT)
    sd = ImageDraw.Draw(star)
    eight_point_star(sd, sx, sy, star_r, GOLD + (255,))
    eight_point_star(sd, sx, sy, int(star_r * 0.55), GOLD_LIGHT + (255,))
    img = Image.alpha_composite(img, star)

    # Wordmark
    draw = ImageDraw.Draw(img)
    title_size = int(w * 0.072)
    sub_size = int(w * 0.030)
    title_font = find_font(title_size, bold=True)
    sub_font = find_font(sub_size, bold=False)
    title = "Islamic Daily Wisdom"
    sub = "Prayer Times · Quranic Reflection"

    tl, tt, tr_, tb = draw.textbbox((0, 0), title, font=title_font)
    sl, st_, sr_, sb = draw.textbbox((0, 0), sub, font=sub_font)
    title_w_, title_h_ = tr_ - tl, tb - tt
    sub_w_, sub_h_ = sr_ - sl, sb - st_

    title_y = cy + ring_r + int(h * 0.04)
    draw.text(((w - title_w_) // 2, title_y), title, font=title_font, fill=CREAM)
    draw.text(((w - sub_w_) // 2, title_y + title_h_ + int(h * 0.012)),
              sub, font=sub_font, fill=GOLD_LIGHT)

    # Bottom Arabic verse
    verse_size = int(w * 0.042)
    verse_font = find_font(verse_size, bold=False)
    verse = "إِنَّ مَعَ الْعُسْرِ يُسْرًا"
    vl, vt, vr_, vb = draw.textbbox((0, 0), verse, font=verse_font)
    draw.text(((w - (vr_ - vl)) // 2, h - int(h * 0.10)),
              verse, font=verse_font, fill=GOLD + (180,))

    img.convert("RGB").save(path, format="PNG", optimize=True)
    print(f"wrote {path.relative_to(ROOT)}  ({path.stat().st_size // 1024} KB)")


def make_notification_icon(path: Path, size: int = 96):
    """Pure white silhouette on transparent — Android tints it automatically."""
    img = Image.new("RGBA", (size, size), TRANSPARENT)
    draw = ImageDraw.Draw(img)
    cx = cy = size // 2
    r = int(size * 0.34)

    crescent = Image.new("RGBA", img.size, TRANSPARENT)
    cd = ImageDraw.Draw(crescent)
    draw_crescent(cd, cx, cy, r, WHITE + (255,), TRANSPARENT, openness=0.40)
    img = Image.alpha_composite(img, crescent)

    # Smaller 8-point star next to crescent (filled white)
    sx = cx + int(r * 1.05)
    sy = cy - int(r * 0.05)
    star_r = int(r * 0.20)
    star = Image.new("RGBA", img.size, TRANSPARENT)
    sd = ImageDraw.Draw(star)
    eight_point_star(sd, sx, sy, star_r, WHITE + (255,))
    img = Image.alpha_composite(img, star)

    img.save(path, format="PNG", optimize=True)
    print(f"wrote {path.relative_to(ROOT)}  ({path.stat().st_size // 1024} KB)")


def make_feature_graphic(path: Path, w: int = 1024, h: int = 500):
    """Play Store feature graphic. 1024x500 banner shown above app listing."""
    bg = radial_gradient(max(w, h), GREEN_LIGHT, GREEN_DEEPER).resize((w, h))
    img = bg.convert("RGBA")
    draw = ImageDraw.Draw(img)

    # Logo on left — keep it tighter so text gets more room
    cx = int(w * 0.18)
    cy = h // 2
    r = int(h * 0.26)
    crescent = Image.new("RGBA", img.size, TRANSPARENT)
    cd = ImageDraw.Draw(crescent)
    draw_crescent(cd, cx, cy, r, GOLD + (255,), TRANSPARENT, openness=0.40)
    img = Image.alpha_composite(img, crescent)

    sx = cx + int(r * 1.20)
    sy = cy - int(r * 0.02)
    star_r = int(r * 0.22)
    star = Image.new("RGBA", img.size, TRANSPARENT)
    sd = ImageDraw.Draw(star)
    eight_point_star(sd, sx, sy, star_r, GOLD + (255,))
    eight_point_star(sd, sx, sy, int(star_r * 0.55), GOLD_LIGHT + (255,))
    img = Image.alpha_composite(img, star)

    # Wordmark — pick title size that actually fits within (right_margin - text_x)
    draw = ImageDraw.Draw(img)
    text_x = int(w * 0.36)
    text_right = int(w * 0.97)
    available = text_right - text_x
    title = "Islamic Daily Wisdom"
    sub = "Daily Quranic verses · Prayer times · Azan"

    # Find biggest title font that fits within available width
    title_font = find_font(int(h * 0.14), bold=True)
    for size in range(int(h * 0.16), 30, -2):
        f = find_font(size, bold=True)
        bbox = draw.textbbox((0, 0), title, font=f)
        if bbox[2] - bbox[0] <= available:
            title_font = f
            break

    sub_font = find_font(int(h * 0.058), bold=False)
    for size in range(int(h * 0.07), 14, -1):
        f = find_font(size, bold=False)
        bbox = draw.textbbox((0, 0), sub, font=f)
        if bbox[2] - bbox[0] <= available:
            sub_font = f
            break

    tl, tt, tr_, tb = draw.textbbox((0, 0), title, font=title_font)
    sl, st_, sr_, sb = draw.textbbox((0, 0), sub, font=sub_font)
    title_h = tb - tt
    sub_h = sb - st_
    block_h = title_h + sub_h + int(h * 0.04)
    title_y = (h - block_h) // 2

    draw.text((text_x, title_y - tt), title, font=title_font, fill=CREAM)
    draw.text((text_x, title_y + title_h + int(h * 0.04) - st_), sub,
              font=sub_font, fill=GOLD_LIGHT)

    img.convert("RGB").save(path, format="PNG", optimize=True)
    print(f"wrote {path.relative_to(ROOT)}  ({path.stat().st_size // 1024} KB)")


def make_silent_mp3(path: Path, seconds: float = 1.0):
    """Minimal MPEG1 L3 silence (32 kbps mono 44.1 kHz)."""
    header = bytes([0xFF, 0xFB, 0x10, 0xC4])
    frame_size = 104
    payload = bytes(frame_size - 4)
    frame = header + payload
    frames_per_sec = 38
    n = int(seconds * frames_per_sec)
    with open(path, "wb") as f:
        id3 = b"ID3\x04\x00\x00\x00\x00\x00\x00"
        f.write(id3)
        for _ in range(n):
            f.write(frame)
    print(f"wrote {path.relative_to(ROOT)}  ({path.stat().st_size} bytes)")


if __name__ == "__main__":
    make_icon(IMG / "icon.png", 1024, 0)
    make_adaptive_icon(IMG / "adaptive-icon.png", 1024)
    make_splash(IMG / "splash.png", 1284, 2778)
    make_notification_icon(IMG / "notification-icon.png", 96)
    make_feature_graphic(IMG / "feature-graphic.png", 1024, 500)
    if not (SND / "azan-default.mp3").exists():
        make_silent_mp3(SND / "azan-default.mp3", 1.0)
    print("done.")
