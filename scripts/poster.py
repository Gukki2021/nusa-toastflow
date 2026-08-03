#!/usr/bin/env python3
"""
ToastFlow speaker poster generator — a 3:4 (mobile) share card a member can send
to friends so they scan the QR and register on Eventbrite to come hear the speech.

    python scripts/poster.py                     # renders a sample with placeholder data
    python scripts/poster.py inputs.json out.png # renders from a JSON of inputs

Inputs (all optional except speaker_name):
    speaker_name    "Wee Meng Ler, ATMB, CL"
    speaker_label   "Featured Speaker"                    (fixed heading above the name)
    pathway         "Presentation Mastery · Level 1"      (small line under the name)
    tagline         "Come hear me speak — scan to register free."
    date_text       "Fri 14 Aug 2026 · 7:00 – 9:50 PM"    (include the end time)
    venue           "SMU School of Economics, Singapore"
    eventbrite_url  "https://nus-alumni-toastmasters-club-chapter-meeting.eventbrite.com"
    banner_path     "assets/chapter-meeting-banner.png"   (branded header; leads the card when present)
    meeting_title   "Chapter Meeting 2026"                (only used if no banner)

Design notes: 1080x1440 canvas, Toastmasters Loyal Blue background. When a
branded banner is supplied it leads a cream card holding the speaker's name,
the Eventbrite QR and when/where; the banner already carries the club identity.
"""
import sys, os, json, textwrap
from PIL import Image, ImageDraw, ImageFont
import qrcode

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = "/System/Library/Fonts/Supplemental"

# palette — Toastmasters brand colours
BG     = (0, 65, 101)     # Loyal Blue (poster background)
YELLOW = (242, 223, 116)  # Happy Yellow (kicker accent)
MAROON = (119, 36, 50)    # True Maroon (section accents)
CREAM  = (233, 241, 199)
WHITE  = (255, 255, 255)
CARD   = (251, 249, 242)
INK    = (28, 36, 64)
MUTED  = (109, 115, 130)

W, H = 1080, 1440
PAD = 72


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


def wrap(draw, text, fnt, max_w):
    """Greedy word-wrap to a pixel width; returns a list of lines."""
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=fnt) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def draw_block(draw, x, y, text, fnt, fill, max_w, leading=1.22):
    for line in wrap(draw, text, fnt, max_w):
        draw.text((x, y), line, font=fnt, fill=fill)
        y += int(fnt.size * leading)
    return y


def rounded(img, box, radius, fill):
    ImageDraw.Draw(img).rounded_rectangle(box, radius=radius, fill=fill)


def make_qr(url, px):
    qr = qrcode.QRCode(border=1, box_size=10,
                       error_correction=qrcode.constants.ERROR_CORRECT_M)
    qr.add_data(url)
    qr.make(fit=True)
    im = qr.make_image(fill_color=(28, 36, 64), back_color="white").convert("RGB")
    return im.resize((px, px), Image.NEAREST)


def make_poster(inp, out_path):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    f_kicker = font("Arial Bold.ttf", 30)
    f_title  = font("Arial Black.ttf", 92)
    f_sub    = font("Arial Bold.ttf", 34)
    f_hook   = font("Arial Bold.ttf", 46)
    f_speak  = font("Arial Black.ttf", 60)
    f_body   = font("Arial Bold.ttf", 36)
    f_small  = font("Arial.ttf", 28)

    banner = inp.get("banner_path")
    banner_led = bool(banner and os.path.exists(os.path.join(HERE, banner)))

    y = PAD
    tagline = inp.get("tagline", "Come hear me speak — scan to register free.")
    if banner_led:
        # the branded banner carries the club identity, so lead with a CTA only
        d.text((PAD, y), "YOU'RE INVITED", font=f_kicker, fill=YELLOW); y += 52
        d.text((PAD, y), tagline, font=f_sub, fill=WHITE); y += 82
    else:
        d.text((PAD, y), "NUS ALUMNI TOASTMASTERS CLUB", font=f_kicker, fill=CREAM)
        y += 52
        title = inp.get("meeting_title", "Chapter Meeting 2026").upper()
        y = draw_block(d, PAD, y, title, f_title, CREAM, W - 2 * PAD, leading=0.98)
        y += 34
        d.text((PAD, y), tagline, font=f_sub, fill=WHITE)
        y += 78

    # ---- white card on its own layer, sized to fit its content ----
    card_top = y
    card_w = W - 2 * PAD
    pad = 44
    inner_w = card_w - 2 * pad
    card = Image.new("RGB", (card_w, 2200), CARD)
    cd = ImageDraw.Draw(card)
    cx = pad
    cy = pad

    # branded banner as the header (aspect preserved)
    if banner_led:
        band = Image.open(os.path.join(HERE, banner)).convert("RGB")
        bw = inner_w
        bh = int(bw * band.height / band.width)
        band = band.resize((bw, bh))
        mask = Image.new("L", (bw, bh), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, bw, bh), radius=24, fill=255)
        card.paste(band, (cx, cy), mask)
        cy += bh + 48

    # speaker — a fixed label + the person's name (no speech title)
    cd.text((cx, cy), inp.get("speaker_label", "Featured Speaker"), font=f_hook, fill=MAROON)
    cy += 72
    cy = draw_block(cd, cx, cy, inp.get("speaker_name", "Speaker Name"),
                    f_speak, INK, inner_w, leading=1.14)
    cy += 14
    if inp.get("pathway"):
        cy = draw_block(cd, cx, cy, inp["pathway"], f_small, MUTED, inner_w)
    cy += 34

    # divider
    cd.line((cx, cy, cx + inner_w, cy), fill=(230, 224, 212), width=2)
    cy += 44

    # QR (left) + when/where (right)
    qr_px = 240
    url = inp.get("eventbrite_url",
                  "https://nus-alumni-toastmasters-club-chapter-meeting.eventbrite.com")
    card.paste(make_qr(url, qr_px), (cx, cy))
    tx = cx + qr_px + 44
    tw = inner_w - qr_px - 44
    ty = cy + 6
    cd.text((tx, ty), "WHEN", font=f_small, fill=MAROON); ty += 44
    ty = draw_block(cd, tx, ty, inp.get("date_text", "Fri 14 Aug 2026 · 7:00 – 9:50 PM"),
                    f_body, INK, tw, leading=1.24); ty += 26
    cd.text((tx, ty), "WHERE", font=f_small, fill=MAROON); ty += 44
    ty = draw_block(cd, tx, ty, inp.get("venue", "SMU School of Economics, Singapore"),
                    f_body, INK, tw, leading=1.24)
    cd.text((cx, cy + qr_px + 16), "Scan to register on Eventbrite",
            font=f_small, fill=MUTED)
    cy = max(ty, cy + qr_px + 16 + 36) + 40

    if not banner_led:
        # footer: club logos + motto (only when there's no branded banner up top)
        cd.line((cx, cy, cx + inner_w, cy), fill=(230, 224, 212), width=2)
        cy += 26
        logo_h = 64
        lx = cx
        for name in ("tm-logo.png", "nus-logo.png"):
            p = os.path.join(HERE, "assets", name)
            if os.path.exists(p):
                lg = Image.open(p).convert("RGBA")
                lw = int(lg.width * (logo_h / lg.height))
                lg = lg.resize((lw, logo_h))
                card.paste(lg, (lx, cy), lg)
                lx += lw + 28
        cd.text((cx + inner_w, cy + logo_h - 30), "“To Live and To Grow”",
                font=f_small, fill=MUTED, anchor="rs")
        cy += logo_h + pad
    else:
        # banner already carries the motto/logos — just close the card
        cy += pad - 8

    # crop the card to its content height, round the corners, composite onto the poster
    card = card.crop((0, 0, card_w, cy))
    mask = Image.new("L", card.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, card_w, cy), radius=40, fill=255)
    # when a banner leads, vertically balance the card in the remaining space
    if banner_led:
        card_top = max(card_top, (H - cy) // 2)
    img.paste(card, (PAD, card_top), mask)

    img.save(out_path, "PNG")
    print("wrote", out_path, img.size)
    return out_path


SAMPLE = {
    "speaker_name": "Wee Meng Ler, ATMB, CL",
    "speech_title": "Finding My Voice",
    "pathway": "Presentation Mastery · Level 1: Ice Breaker",
    "meeting_title": "Chapter Meeting 2026",
    "date_text": "Fri 14 Aug 2026 · 7:00 – 9:50 PM",
    "venue": "SMU School of Economics, Singapore",
    "eventbrite_url": "https://nus-alumni-toastmasters-club-chapter-meeting.eventbrite.com",
    "banner_path": None,
}

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        inp = json.load(open(sys.argv[1], encoding="utf-8"))
        make_poster(inp, sys.argv[2])
    else:
        make_poster(SAMPLE, os.path.join(HERE, "scripts", "poster-sample.png"))
