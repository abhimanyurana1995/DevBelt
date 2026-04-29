window.DevTools = window.DevTools || {};
window.DevTools.url = {
  meta: { id: 'url', name: 'URL Parser', icon: '🔗' },
  render: function(container) {
    container.innerHTML = `
<div class="tool-panel">
  <h2>🔗 URL Parser</h2>
  <div class="input-group" style="margin-bottom:16px">
    <input type="text" id="url-input" placeholder="Paste a URL here..." />
    <button id="url-parse" class="primary">Parse</button>
    <button id="url-clear">Clear</button>
  </div>
  <div id="url-error" class="error-msg" style="margin-bottom:8px"></div>
  <div class="table-wrap" id="url-result" style="display:none">
    <table class="kv-table">
      <thead><tr><th>Part</th><th>Value</th></tr></thead>
      <tbody id="url-tbody"></tbody>
    </table>
  </div>
  <div id="url-params-wrap" style="margin-top:16px;display:none">
    <div style="font-size:11px;color:#777;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Query Parameters</div>
    <div class="table-wrap">
      <table class="kv-table">
        <thead><tr><th>Key</th><th>Value</th></tr></thead>
        <tbody id="url-params-tbody"></tbody>
      </table>
    </div>
  </div>
</div>`;

    var input = document.getElementById('url-input');
    var errorEl = document.getElementById('url-error');
    var resultEl = document.getElementById('url-result');
    var paramsWrap = document.getElementById('url-params-wrap');
    var tbody = document.getElementById('url-tbody');
    var paramsTbody = document.getElementById('url-params-tbody');

    function parseURL(str) {
      if (!str) return { ok: false, err: 'Please enter a URL' };
      try { return { ok: true, url: new URL(str) }; } catch(e) {}
      try { return { ok: true, url: new URL('https://' + str) }; } catch(e) {}
      return { ok: false, err: 'Invalid URL. Please check the format.' };
    }

    function showResult(urlObj) {
      var parts = [
        ['Protocol', urlObj.protocol],
        ['Host', urlObj.host],
        ['Hostname', urlObj.hostname],
        ['Port', urlObj.port || '(default)'],
        ['Pathname', urlObj.pathname],
        ['Search', urlObj.search || '(none)'],
        ['Hash', urlObj.hash || '(none)'],
        ['Origin', urlObj.origin]
      ];
      tbody.innerHTML = parts.map(function(p) {
        return '<tr><td>' + p[0] + '</td><td>' + p[1] + '</td></tr>';
      }).join('');
      resultEl.style.display = 'block';

      var entries = Array.from(urlObj.searchParams.entries());
      if (entries.length === 0) {
        paramsWrap.style.display = 'none';
      } else {
        paramsTbody.innerHTML = entries.map(function(e) {
          return '<tr><td>' + e[0] + '</td><td>' + e[1] + '</td></tr>';
        }).join('');
        paramsWrap.style.display = 'block';
      }
    }

    function doParse() {
      var val = input.value.trim();
      errorEl.textContent = '';
      resultEl.style.display = 'none';
      paramsWrap.style.display = 'none';
      var r = parseURL(val);
      if (!r.ok) { errorEl.textContent = r.err; return; }
      showResult(r.url);
    }

    document.getElementById('url-parse').onclick = doParse;
    document.getElementById('url-clear').onclick = function() {
      input.value = '';
      errorEl.textContent = '';
      resultEl.style.display = 'none';
      paramsWrap.style.display = 'none';
    };
    input.addEventListener('keydown', function(e) { if (e.key === 'Enter') doParse(); });
  },
  destroy: function(container) { container.innerHTML = ''; }
};
