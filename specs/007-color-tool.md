# Spec 007: Color Converter

**Status:** [ ] ready  
**File:** `src/tools/color.js`  
**Depends on:** nothing

---

## Registration pattern

```js
window.DevTools = window.DevTools || {};
window.DevTools.color = {
  meta: { id: 'color', name: 'Color', icon: '🎨' },
  render: function(container) { /* see below */ },
  destroy: function(container) { container.innerHTML = ''; }
};
```

---

## render(container) — set this innerHTML, then wire events

```html
<div class="tool-panel">
  <h2>🎨 Color Converter</h2>
  <div class="input-group" style="margin-bottom:16px">
    <input type="text" id="color-input" placeholder="#ff6b35  or  rgb(255,107,53)  or  hsl(16,100%,60%)" />
    <button id="color-convert" class="primary">Convert</button>
    <button id="color-clear">Clear</button>
  </div>
  <div id="color-error" class="error-msg" style="margin-bottom:12px"></div>
  <div id="color-result" style="display:none">
    <div class="color-swatch" id="color-swatch"></div>
    <div class="table-wrap">
      <table class="kv-table">
        <thead><tr><th>Format</th><th>Value</th><th></th></tr></thead>
        <tbody id="color-tbody"></tbody>
      </table>
    </div>
  </div>
</div>
```

---

## Functions to implement inside render()

### parseColor(str)
Detect and parse format:
1. HEX: matches `/^#([0-9a-f]{3}|[0-9a-f]{6})$/i`
   - If 3-char: expand `#abc` → `#aabbcc`
   - Parse r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
   - Return `{ ok:true, r, g, b }`
2. RGB: matches `/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i`
   - Parse groups as r, g, b integers
   - Return `{ ok:true, r, g, b }`
3. HSL: matches `/^hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/i`
   - Parse h (0-360), s (0-100), l (0-100)
   - Convert to RGB using `hslToRgb(h, s/100, l/100)`
   - Return `{ ok:true, r, g, b }`
4. Otherwise → return `{ ok:false, err:'Unrecognised format. Use #hex, rgb(), or hsl()' }`

### hslToRgb(h, s, l)
h is 0-360, s and l are 0-1. Returns {r,g,b} each 0-255.
```
c = (1 - Math.abs(2*l - 1)) * s
x = c * (1 - Math.abs((h/60) % 2 - 1))
m = l - c/2
if 0<=h<60:   r1=c, g1=x, b1=0
if 60<=h<120: r1=x, g1=c, b1=0
if 120<=h<180:r1=0, g1=c, b1=x
if 180<=h<240:r1=0, g1=x, b1=c
if 240<=h<300:r1=x, g1=0, b1=c
if 300<=h<360:r1=c, g1=0, b1=x
r = Math.round((r1+m)*255)
g = Math.round((g1+m)*255)
b = Math.round((b1+m)*255)
```

### rgbToHex(r,g,b)
`'#' + [r,g,b].map(function(v){ return v.toString(16).padStart(2,'0'); }).join('')`

### rgbToHsl(r,g,b)
r,g,b 0-255 → returns {h,s,l} where h 0-360, s and l 0-100 (rounded to 1 decimal).
```
r/=255; g/=255; b/=255
max=Math.max(r,g,b); min=Math.min(r,g,b)
l=(max+min)/2
if max===min: s=0, h=0
else:
  d=max-min
  s = l>0.5 ? d/(2-max-min) : d/(max+min)
  switch(max):
    r: h=(g-b)/d + (g<b?6:0)
    g: h=(b-r)/d + 2
    b: h=(r-g)/d + 4
  h = Math.round(h*60)
s=Math.round(s*1000)/10
l=Math.round(l*1000)/10
```

### buildRow(label, value)
Returns HTML string:
`'<tr><td>' + label + '</td><td>' + value + '</td><td><button class="sm copy-btn" data-val="' + value + '">Copy</button></td></tr>'`

### showResult(r,g,b)
1. hex = rgbToHex(r,g,b)
2. hsl = rgbToHsl(r,g,b)
3. Set `#color-swatch` backgroundColor to hex
4. Set `#color-tbody` innerHTML using buildRow for:
   - HEX: hex
   - RGB: `rgb(r, g, b)`
   - HSL: `hsl(h, s%, l%)`
   - Red channel: r
   - Green channel: g
   - Blue channel: b
5. Show `#color-result`
6. Wire `.copy-btn` buttons: `querySelectorAll('.copy-btn').forEach(btn => btn.onclick = () => navigator.clipboard.writeText(btn.dataset.val))`

### Event wiring
- `#color-convert` click → parseColor(`#color-input`.value.trim()) → if ok showResult(r,g,b), else show error
- `#color-clear` click → clear input, hide result, clear error
- `#color-input` keydown → if Enter → trigger convert

## Do NOT
- Do not add a color picker input element
- Do not support RGBA or HSLA
