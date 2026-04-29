window.DevTools = window.DevTools || {};
window.DevTools.color = {
  meta: { id: 'color', name: 'Color', icon: '🎨' },
  render: function(container) {
    container.innerHTML = `
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
</div>`;

    var inputEl = document.getElementById('color-input');
    var errorEl = document.getElementById('color-error');
    var resultEl = document.getElementById('color-result');

    function hslToRgb(h, s, l) {
      var c = (1 - Math.abs(2*l - 1)) * s;
      var x = c * (1 - Math.abs((h/60) % 2 - 1));
      var m = l - c/2;
      var r1,g1,b1;
      if (h<60)      { r1=c; g1=x; b1=0; }
      else if (h<120){ r1=x; g1=c; b1=0; }
      else if (h<180){ r1=0; g1=c; b1=x; }
      else if (h<240){ r1=0; g1=x; b1=c; }
      else if (h<300){ r1=x; g1=0; b1=c; }
      else           { r1=c; g1=0; b1=x; }
      return { r: Math.round((r1+m)*255), g: Math.round((g1+m)*255), b: Math.round((b1+m)*255) };
    }

    function rgbToHex(r,g,b) {
      return '#' + [r,g,b].map(function(v){ return v.toString(16).padStart(2,'0'); }).join('');
    }

    function rgbToHsl(r,g,b) {
      r/=255; g/=255; b/=255;
      var max=Math.max(r,g,b), min=Math.min(r,g,b), h,s,l=(max+min)/2;
      if (max===min) { h=0; s=0; }
      else {
        var d=max-min;
        s = l>0.5 ? d/(2-max-min) : d/(max+min);
        switch(max) {
          case r: h=(g-b)/d+(g<b?6:0); break;
          case g: h=(b-r)/d+2; break;
          default: h=(r-g)/d+4;
        }
        h = Math.round(h*60);
      }
      return { h: h, s: Math.round(s*1000)/10, l: Math.round(l*1000)/10 };
    }

    function parseColor(str) {
      if (!str) return { ok: false, err: 'Please enter a color value.' };
      str = str.trim();
      var hex = str.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
      if (hex) {
        var h = hex[1].length===3 ? hex[1].split('').map(function(c){return c+c;}).join('') : hex[1];
        return { ok:true, r:parseInt(h.slice(0,2),16), g:parseInt(h.slice(2,4),16), b:parseInt(h.slice(4,6),16) };
      }
      var rgb = str.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
      if (rgb) return { ok:true, r:parseInt(rgb[1]), g:parseInt(rgb[2]), b:parseInt(rgb[3]) };
      var hsl = str.match(/^hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/i);
      if (hsl) {
        var c = hslToRgb(parseFloat(hsl[1]), parseFloat(hsl[2])/100, parseFloat(hsl[3])/100);
        return { ok:true, r:c.r, g:c.g, b:c.b };
      }
      return { ok:false, err:'Unrecognised format. Use #hex, rgb(), or hsl()' };
    }

    function showResult(r,g,b) {
      var hex = rgbToHex(r,g,b);
      var hsl = rgbToHsl(r,g,b);
      document.getElementById('color-swatch').style.backgroundColor = hex;
      var rows = [
        ['HEX', hex],
        ['RGB', 'rgb('+r+', '+g+', '+b+')'],
        ['HSL', 'hsl('+hsl.h+', '+hsl.s+'%, '+hsl.l+'%)'],
        ['Red', r], ['Green', g], ['Blue', b]
      ];
      document.getElementById('color-tbody').innerHTML = rows.map(function(row) {
        return '<tr><td>'+row[0]+'</td><td>'+row[1]+'</td><td><button class="sm copy-btn" data-val="'+row[1]+'">Copy</button></td></tr>';
      }).join('');
      resultEl.style.display = 'block';
      resultEl.querySelectorAll('.copy-btn').forEach(function(btn) {
        btn.onclick = function() { navigator.clipboard.writeText(btn.dataset.val); };
      });
    }

    function doConvert() {
      var r = parseColor(inputEl.value);
      errorEl.textContent = '';
      if (!r.ok) { errorEl.textContent = r.err; resultEl.style.display='none'; return; }
      showResult(r.r, r.g, r.b);
    }

    document.getElementById('color-convert').onclick = doConvert;
    document.getElementById('color-clear').onclick = function() {
      inputEl.value = ''; errorEl.textContent = ''; resultEl.style.display = 'none';
    };
    inputEl.addEventListener('keydown', function(e) { if (e.key === 'Enter') doConvert(); });
  },
  destroy: function(container) { container.innerHTML = ''; }
};
