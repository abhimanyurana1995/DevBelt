window.DevTools = window.DevTools || {};
window.DevTools.regex = {
  meta: { id: 'regex', name: 'Regex', icon: '.*' },
  render: function(container) {
    container.innerHTML = `
<div class="tool-panel">
  <h2>.* Regex Tester</h2>
  <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center">
    <span style="color:#777;font-size:12px">/</span>
    <input type="text" id="rx-pattern" placeholder="pattern" style="flex:1" />
    <span style="color:#777;font-size:12px">/</span>
    <label style="display:inline-flex;gap:4px;align-items:center;font-size:12px"><input type="checkbox" id="rx-g" checked> g</label>
    <label style="display:inline-flex;gap:4px;align-items:center;font-size:12px"><input type="checkbox" id="rx-i"> i</label>
    <label style="display:inline-flex;gap:4px;align-items:center;font-size:12px"><input type="checkbox" id="rx-m"> m</label>
    <button id="rx-clear" class="sm">Clear</button>
  </div>
  <div id="rx-error" class="error-msg" style="margin-bottom:6px"></div>
  <div class="tool-row">
    <div class="col">
      <label>Test String</label>
      <textarea id="rx-text" placeholder="Enter text to test..."></textarea>
      <div id="rx-count" style="font-size:12px;color:#777;margin-top:4px"></div>
    </div>
    <div class="col">
      <label>Highlighted Matches</label>
      <div class="highlighted-text" id="rx-highlighted"></div>
      <label style="margin-top:8px">Matches</label>
      <div class="match-list" id="rx-matches"></div>
    </div>
  </div>
</div>`;

    function escapeHtml(str) {
      return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    function buildFlags() {
      return (document.getElementById('rx-g').checked ? 'g' : '') +
             (document.getElementById('rx-i').checked ? 'i' : '') +
             (document.getElementById('rx-m').checked ? 'm' : '');
    }

    function runTest() {
      var pattern = document.getElementById('rx-pattern').value;
      var text = document.getElementById('rx-text').value;
      var errorEl = document.getElementById('rx-error');
      var highlightEl = document.getElementById('rx-highlighted');
      var matchesEl = document.getElementById('rx-matches');
      var countEl = document.getElementById('rx-count');
      errorEl.textContent = ''; highlightEl.innerHTML = ''; matchesEl.innerHTML = ''; countEl.textContent = '';
      if (!pattern) { highlightEl.textContent = text; return; }
      try {
        var re = new RegExp(pattern, buildFlags());
        var matches = [], m;
        if (re.global) {
          while ((m = re.exec(text)) !== null) {
            matches.push(m);
            if (m[0].length === 0) re.lastIndex++;
          }
        } else {
          m = re.exec(text);
          if (m) matches.push(m);
        }
        // Build highlighted output
        var html = '', last = 0;
        matches.forEach(function(match) {
          html += escapeHtml(text.slice(last, match.index));
          html += '<span class="match-highlight">' + escapeHtml(match[0]) + '</span>';
          last = match.index + match[0].length;
        });
        html += escapeHtml(text.slice(last));
        highlightEl.innerHTML = html;
        // Build match list
        if (matches.length === 0) {
          matchesEl.innerHTML = '<div style="color:#555;font-size:12px;padding:4px">No matches</div>';
        } else {
          matchesEl.innerHTML = matches.map(function(match, i) {
            var groups = match.length > 1 ? ' — groups: ' + match.slice(1).map(function(g){ return escapeHtml(g||''); }).join(', ') : '';
            return '<div class="match-item"><span style="color:#00d4ff">['+i+']</span> <span style="color:#ffcc00">"'+escapeHtml(match[0])+'"</span> at '+match.index+groups+'</div>';
          }).join('');
        }
        countEl.textContent = matches.length + ' match' + (matches.length!==1?'es':'');
      } catch(e) {
        errorEl.textContent = 'Invalid regex: ' + e.message;
      }
    }

    document.getElementById('rx-pattern').addEventListener('input', runTest);
    document.getElementById('rx-text').addEventListener('input', runTest);
    ['rx-g','rx-i','rx-m'].forEach(function(id) {
      document.getElementById(id).addEventListener('change', runTest);
    });
    document.getElementById('rx-clear').onclick = function() {
      document.getElementById('rx-pattern').value = '';
      document.getElementById('rx-text').value = '';
      document.getElementById('rx-g').checked = true;
      document.getElementById('rx-i').checked = false;
      document.getElementById('rx-m').checked = false;
      runTest();
    };
  },
  destroy: function(container) { container.innerHTML = ''; }
};
