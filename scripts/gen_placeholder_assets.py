"""Generate placeholder assets for the Islamic Daily Wisdom app.

Outputs:
  assets/images/icon.png             1024x1024  green bg, gold crescent + 'IW'
  assets/images/adaptive-icon.png    1024x1024  green bg, gold crescent + 'IW' (centered, padded)
  assets/images/splash.png           1284x2778  green bg, gold crescent + app name
  assets/images/notification-icon.png  96x96    monochrome white silhouette
  assets/sounds/azan-default.mp3     ~3s short tone (placeholder)

Run:
  python3 scripts/gen_placeholder_assets.py
"""
import math
import os
import struct
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / "assets" / "images"
SND = ROOT / "assets" / "sounds"
IMG.mkdir(parents=True, exist_ok=True)
SND.mkdir(parents=True, exist_ok=True)

GREEN = (15, 76, 58)
GREEN_DARK = (8, 44, 34)
GOLD = (212, 175, 55)
GOLD_LIGHT = (232, 198, 86)
CREAM = (248, 244, 233)
WHITE = (255, 255, 255)
TRANSPARENT = (0, 0, 0, 0)


def find_font(size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def draw_crescent(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int, color, bg_color):
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)
    offset = int(r * 0.32)
    draw.ellipse(
        [cx - r + offset, cy - r + offset // 2, cx + r + offset, cy + r - offset // 2],
        fill=bg_color,
    )


def make_icon(path: Path, size: int = 1024, padding: int = 0):
    img = Image.new("RGB", (size, size), GREEN)
    draw = ImageDraw.Draw(img)
    inner = size - 2 * padding
    cx = padding + inner // 2
    cy = padding + inner // 2
    r = int(inner * 0.36)
    draw_crescent(draw, cx, cy, r, GOLD, GREEN)
    star_r = int(r * 0.18)
    sx, sy = cx + int(r * 1.15), cy - int(r * 0.05)
    draw.ellipse([sx - star_r, sy - star_r, sx + star_r, sy + star_r], fill=GOLD)
    img.save(path, format="PNG")
    print(f"wrote {path.relative_to(ROOT)}")


def make_splash(path: Path, w: int = 1284, h: int = 2778):
    img = Image.new("RGB", (w, h), GREEN)
    draw = ImageDraw.Draw(img)
    cx, cy = w // 2, h // 2 - h // 8
    r = int(min(w, h) * 0.18)
    draw_crescent(draw, cx, cy, r, GOLD, GREEN)
    star_r = int(r * 0.18)
    sx, sy = cx + int(r * 1.05), cy - int(r * 0.05)
    draw.ellipse([sx - star_r, sy - star_r, sx + star_r, sy + star_r], fill=GOLD)

    title_font = find_font(int(w * 0.075))
    sub_font = find_font(int(w * 0.035))
    title = "Islamic Daily Wisdom"
    sub = "Prayer Timer · Quranic Quotes"
    tl, tt, tr, tb = draw.textbbox((0, 0), title, font=title_font)
    sl, st_, sr, sb = draw.textbbox((0, 0), sub, font=sub_font)
    title_w, title_h = tr - tl, tb - tt
    sub_w, sub_h = sr - sl, sb - st_
    title_y = cy + r + int(h * 0.06)
    draw.text(((w - title_w) // 2, title_y), title, font=title_font, fill=CREAM)
    draw.text(
        ((w - sub_w) // 2, title_y + title_h + int(h * 0.015)),
        sub,
        font=sub_font,
        fill=GOLD_LIGHT,
    )
    img.save(path, format="PNG")
    print(f"wrote {path.relative_to(ROOT)}")


def make_notification_icon(path: Path, size: int = 96):
    img = Image.new("RGBA", (size, size), TRANSPARENT)
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    r = int(size * 0.36)
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=WHITE)
    offset = int(r * 0.32)
    draw.ellipse(
        [cx - r + offset, cy - r + offset // 2, cx + r + offset, cy + r - offset // 2],
        fill=TRANSPARENT,
    )
    star_r = int(r * 0.16)
    sx, sy = cx + int(r * 1.0), cy - int(r * 0.05)
    draw.ellipse([sx - star_r, sy - star_r, sx + star_r, sy + star_r], fill=WHITE)
    img.save(path, format="PNG")
    print(f"wrote {path.relative_to(ROOT)}")


def make_silent_mp3(path: Path, seconds: float = 1.0):
    """Write a minimal valid MP3 file with silent MPEG1 Layer III frames.

    Uses constant 32 kbps mono 44.1 kHz so each frame is 104 bytes (header included)
    with completely zeroed payload — every decoder treats it as silence.
    """
    # MPEG1 Layer III, bitrate 32 kbps, sample rate 44100, mono, no padding.
    header = bytes(
        [
            0xFF,  # frame sync
            0xFB,  # MPEG1 L3, no CRC
            0x10,  # 32kbps, 44.1kHz, no padding, private 0
            0xC4,  # mono (channel mode 11), other bits 0
        ]
    )
    frame_size = 104  # 32 kbps @ 44.1 kHz mono => 104 bytes/frame
    payload = bytes(frame_size - 4)
    frame = header + payload
    frames_per_sec = 38  # ≈ 44100/1152 ≈ 38.28
    n = int(seconds * frames_per_sec)
    with open(path, "wb") as f:
        # Optional ID3v2 header so players show a clean tag area.
        id3 = b"ID3\x04\x00\x00\x00\x00\x00\x00"
        f.write(id3)
        for _ in range(n):
            f.write(frame)
    print(f"wrote {path.relative_to(ROOT)} ({path.stat().st_size} bytes)")


if __name__ == "__main__":
    make_icon(IMG / "icon.png", 1024, 0)
    make_icon(IMG / "adaptive-icon.png", 1024, 80)
    make_splash(IMG / "splash.png", 1284, 2778)
    make_notification_icon(IMG / "notification-icon.png", 96)
    make_silent_mp3(SND / "azan-default.mp3", 1.0)
    print("done.")
