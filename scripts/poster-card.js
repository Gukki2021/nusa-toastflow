/* ToastFlow speaker poster — client-side (Canvas) twin of scripts/poster.py.
   Renders a 3:4 share card (Toastmasters Loyal Blue, branded banner header,
   speaker name, Eventbrite QR + when/where) that a speaker can Share or Download
   after reserving. Uses only same-origin assets, so the canvas stays untainted. */
(function (global) {
  'use strict';
  var W = 1080, H = 1440, PAD = 72;
  var BG = '#004165', YELLOW = '#F2DF74', MAROON = '#772432', WHITE = '#ffffff',
      CARD = '#FBF9F2', INK = '#1C2440', MUTED = '#6D7382', LINE = '#E6E0D4';

  // Lazy-load the assets only when a poster is first generated — keeps the ~2 MB
  // banner off the homepage's initial load.
  var banner = new Image(), qr = new Image(), assetsRequested = false;
  function imgReady(im) {
    return (im.complete && im.naturalWidth) ? Promise.resolve()
      : new Promise(function (res) { im.onload = res; im.onerror = res; });
  }
  function ensureAssets() {
    if (!assetsRequested) {
      assetsRequested = true;
      banner.src = 'assets/chapter-meeting-banner.png';
      qr.src = 'assets/eventbrite-qr.png';
    }
    return Promise.all([imgReady(banner), imgReady(qr)]);
  }

  function wrap(ctx, text, maxW) {
    var words = String(text || '').split(' '), lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var t = (cur + ' ' + words[i]).trim();
      if (ctx.measureText(t).width <= maxW) cur = t;
      else { if (cur) lines.push(cur); cur = words[i]; }
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [''];
  }
  function block(ctx, x, y, text, size, leading) {
    var ls = wrap(ctx, text, ctx._maxW);
    for (var i = 0; i < ls.length; i++) { ctx.fillText(ls[i], x, y); y += Math.round(size * leading); }
    return y;
  }
  function roundPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // opts: {speaker_name, pathway, tagline, speaker_label, date_text, venue}
  function render(opts) {
    opts = opts || {};
    return ensureAssets().then(function () {
      var c = document.createElement('canvas'); c.width = W; c.height = H;
      var ctx = c.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      var hasBanner = banner.naturalWidth > 0;

      // top CTA on the blue
      var y = PAD;
      ctx.fillStyle = YELLOW; ctx.font = '700 30px Arial';
      ctx.fillText("YOU'RE INVITED", PAD, y); y += 52;
      ctx.fillStyle = WHITE; ctx.font = '700 34px Arial';
      ctx.fillText(opts.tagline || 'NUS Alumni Toastmasters Chapter Meeting', PAD, y);
      y += 82;
      var cardTop = y;

      // ---- build the cream card on an offscreen canvas, sized to its content ----
      var cardW = W - 2 * PAD, pad = 44, innerW = cardW - 2 * pad;
      var cc = document.createElement('canvas'); cc.width = cardW; cc.height = 2200;
      var cx = cc.getContext('2d');
      cx.textBaseline = 'top'; cx._maxW = innerW;
      cx.fillStyle = CARD; cx.fillRect(0, 0, cardW, 2200);
      var x = pad, cy = pad;

      if (hasBanner) {
        var bw = innerW, bh = Math.round(bw * banner.naturalHeight / banner.naturalWidth);
        cx.save(); roundPath(cx, x, cy, bw, bh, 24); cx.clip();
        cx.drawImage(banner, x, cy, bw, bh); cx.restore();
        cy += bh + 48;
      }

      // speaker: fixed label + name (no speech title)
      cx.fillStyle = MAROON; cx.font = '700 46px Arial';
      cx.fillText(opts.speaker_label || 'Featured Speaker', x, cy); cy += 72;
      cx.fillStyle = INK; cx.font = '900 60px "Arial Black", Arial';
      cy = block(cx, x, cy, opts.speaker_name || 'Speaker', 60, 1.14); cy += 14;
      if (opts.pathway) { cx.fillStyle = MUTED; cx.font = '400 28px Arial'; cy = block(cx, x, cy, opts.pathway, 28, 1.22); }
      cy += 34;

      cx.strokeStyle = LINE; cx.lineWidth = 2;
      cx.beginPath(); cx.moveTo(x, cy); cx.lineTo(x + innerW, cy); cx.stroke(); cy += 44;

      // QR + when/where
      var qpx = 240;
      if (qr.naturalWidth > 0) cx.drawImage(qr, x, cy, qpx, qpx);
      var tx = x + qpx + 44, ty = cy + 6; cx._maxW = innerW - qpx - 44;
      cx.fillStyle = MAROON; cx.font = '400 28px Arial'; cx.fillText('WHEN', tx, ty); ty += 42;
      cx.fillStyle = INK; cx.font = '700 36px Arial';
      ty = block(cx, tx, ty, opts.date_text || '', 36, 1.22); ty += 22;
      cx.fillStyle = MAROON; cx.font = '400 28px Arial'; cx.fillText('WHERE', tx, ty); ty += 42;
      cx.fillStyle = INK; cx.font = '700 28px Arial';       // smaller so a long venue never overlaps
      ty = block(cx, tx, ty, opts.venue || '', 28, 1.24);
      cx._maxW = innerW;
      // "scan" line sits below BOTH columns
      cy = Math.max(ty, cy + qpx) + 22;
      cx.fillStyle = MUTED; cx.font = '400 28px Arial';
      cx.fillText('Scan to register on Eventbrite', x, cy);
      cy += 40;
      cy += pad - 8;

      if (cardTop < (H - cy) / 2) cardTop = Math.round((H - cy) / 2);

      // composite the card (rounded) onto the poster
      ctx.save(); roundPath(ctx, PAD, cardTop, cardW, cy, 40); ctx.clip();
      ctx.drawImage(cc, 0, 0, cardW, cy, PAD, cardTop, cardW, cy); ctx.restore();
      return c;
    });
  }

  function fname(opts) {
    return 'NUSA-' + String((opts && opts.speaker_name) || 'speaker').replace(/[^a-z0-9]+/gi, '-') + '.png';
  }
  function toBlob(canvas) {
    return new Promise(function (res) { canvas.toBlob(res, 'image/png'); });
  }
  function download(opts) {
    return render(opts).then(function (c) {
      return toBlob(c).then(function (b) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(b); a.download = fname(opts); a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
      });
    });
  }
  function share(opts) {
    return render(opts).then(function (c) {
      return toBlob(c).then(function (b) {
        var file = new File([b], fname(opts), { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          return navigator.share({ files: [file], title: 'NUS Alumni Toastmasters', text: opts.tagline || '' });
        }
        // no file-share support → download it and copy the register link
        var a = document.createElement('a'); a.href = URL.createObjectURL(b);
        a.download = fname(opts); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
        return 'downloaded';
      });
    });
  }

  global.ToastFlowPoster = { render: render, download: download, share: share };
})(window);
