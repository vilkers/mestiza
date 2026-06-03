"""
Mestiza — coin background remover
----------------------------------
Applies a circular crop to the coin image, removing the black background
and sparkle/glare effects that fall outside the coin's edge.
Exports a transparent PNG ready for the site.

Requirements: pip install Pillow
Usage:        python remove_bg_coin.py <input.png> [output.png]
"""

import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

def remove_bg(input_path: str, output_path: str | None = None) -> str:
    src = Path(input_path)
    dst = Path(output_path) if output_path else src.with_stem(src.stem + "_clean")

    img = Image.open(src).convert("RGBA")
    w, h = img.size

    # The coin fills most of the frame — use 96% of the shortest side as diameter
    diameter = int(min(w, h) * 0.96)
    cx, cy = w // 2, h // 2
    radius = diameter // 2

    # Build a smooth circular mask (anti-aliased via 4x oversample)
    scale = 4
    mask_big = Image.new("L", (w * scale, h * scale), 0)
    draw = ImageDraw.Draw(mask_big)
    draw.ellipse(
        [
            (cx - radius) * scale,
            (cy - radius) * scale,
            (cx + radius) * scale,
            (cy + radius) * scale,
        ],
        fill=255,
    )
    mask = mask_big.resize((w, h), Image.LANCZOS)

    # Slight feather on the edge so it doesn't look cut out
    mask = mask.filter(ImageFilter.GaussianBlur(radius=2))

    result = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    result.paste(img, mask=mask)

    # Crop to a tight square around the coin
    margin = (min(w, h) - diameter) // 2 + 4
    result = result.crop((
        cx - radius - margin,
        cy - radius - margin,
        cx + radius + margin,
        cy + radius + margin,
    ))

    result.save(dst, "PNG")
    print(f"Saved: {dst}  ({result.size[0]}×{result.size[1]}px)")
    return str(dst)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python remove_bg_coin.py <input.png> [output.png]")
        sys.exit(1)
    remove_bg(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
