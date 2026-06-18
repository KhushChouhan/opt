from PIL import Image

src = Image.open("public/images/logo.png").convert("RGBA")
px = src.load()
w, h = src.size

# Warm ivory target for navy elements
IV_R, IV_G, IV_B = 0xED, 0xE3, 0xC8

for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if a < 8:
            continue
        # Navy = bluish (blue channel clearly dominates red). Gold has r > b.
        if b > r + 10:
            lum = 0.299 * r + 0.587 * g + 0.114 * b  # 0..255, navy is dark
            # Map dark navy -> bright ivory, lighter navy -> slightly dimmer,
            # so subtle internal shading is preserved (invert luminance lightly).
            t = 1.0 - min(lum, 120) / 120.0 * 0.18  # 0.82..1.0 scale
            nr = int(IV_R * t)
            ng = int(IV_G * t)
            nb = int(IV_B * t)
            px[x, y] = (nr, ng, nb, a)

src.save("public/images/logo-dark.png")
print("saved public/images/logo-dark.png", src.size)
