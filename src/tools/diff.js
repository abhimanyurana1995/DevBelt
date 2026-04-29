window.DevTools = window.DevTools || {};
window.DevTools.diff = {
  meta: { id: 'diff', name: 'Diff', icon: '±' },
  render: function(container) {
    container.innerHTML = `
<div class="tool-panel">
  <h2>± Text Diff</h2>
  <div class="tool-row" style="height:calc(100vh - 200px)">
    <div class="col">
      <label>Original</label>
      <textarea id="diff-a" placeholder="Original text..."></textarea>
    </div>
    <div class="col">
      <label>Modified</label>
      <textarea id="diff-b" placeholder="Modified text..."></textarea>
    </div>
  </div>
  <div style="margin:10px 0;display:flex;gap:8px;align-items:center">
    <button id="diff-run" class="primary">Compare</button>
    <button id="diff-clear">Clear</button>
    <span id="diff-summary" style="font-size:12px;color:#777"></span>
  </div>
  <div class="diff-output" id="diff-output" style="height:220px"></div>
</div>`;

    function escapeHtml(str) {
      return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    function computeDiff(textA, textB) {
      var linesA = textA === '' ? [] : textA.split('\n');
      var linesB = textB === '' ? [] : textB.split('\n');
      var m = linesA.length, n = linesB.length;
      var dp = [];
      for (var i = 0; i <= m; i++) dp[i] = new Array(n+1).fill(0);
      for (var i = 1; i <= m; i++) {
        for (var j = 1; j <= n; j++) {
          dp[i][j] = linesA[i-1]===linesB[j-1] ? dp[i-1][j-1]+1 : Math.max(dp[i-1][j],dp[i][j-1]);
        }
      }
      var result = [], i = m, j = n;
      while (i > 0 || j > 0) {
        if (i>0 && j>0 && linesA[i-1]===linesB[j-1]) {
          result.unshift({ type:'same', line:linesA[i-1] }); i--; j--;
        } else if (j>0 && (i===0 || dp[i][j-1]>=dp[i-1][j])) {
          result.unshift({ type:'added', line:linesB[j-1] }); j--;
        } else {
          result.unshift({ type:'removed', line:linesA[i-1] }); i--;
        }
      }
      return result;
    }

    document.getElementById('diff-run').onclick = function() {
      var textA = document.getElementById('diff-a').value;
      var textB = document.getElementById('diff-b').value;
      var result = computeDiff(textA, textB);
      var html = result.map(function(item) {
        var cls = item.type==='added' ? 'diff-added' : item.type==='removed' ? 'diff-removed' : 'diff-same';
        var prefix = item.type==='added' ? '+ ' : item.type==='removed' ? '- ' : '  ';
        return '<div class="diff-line '+cls+'">'+prefix+escapeHtml(item.line)+'</div>';
      }).join('');
      document.getElementById('diff-output').innerHTML = html;
      var added = result.filter(function(x){ return x.type==='added'; }).length;
      var removed = result.filter(function(x){ return x.type==='removed'; }).length;
      document.getElementById('diff-summary').textContent = '+'+added+' added, -'+removed+' removed';
    };

    document.getElementById('diff-clear').onclick = function() {
      document.getElementById('diff-a').value = '';
      document.getElementById('diff-b').value = '';
      document.getElementById('diff-output').innerHTML = '';
      document.getElementById('diff-summary').textContent = '';
    };
  },
  destroy: function(container) { container.innerHTML = ''; }
};
