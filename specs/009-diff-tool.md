# Spec 009: Text Diff Viewer

**Status:** [ ] ready  
**File:** `src/tools/diff.js`  
**Depends on:** nothing

---

## Registration pattern

```js
window.DevTools = window.DevTools || {};
window.DevTools.diff = {
  meta: { id: 'diff', name: 'Diff', icon: '±' },
  render: function(container) { /* see below */ },
  destroy: function(container) { container.innerHTML = ''; }
};
```

---

## render(container) — set this innerHTML, then wire events

```html
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
</div>
```

---

## The diff algorithm — copy this exactly

Implement this function at the top of your render() function:

```js
function computeDiff(textA, textB) {
    var linesA = textA === '' ? [] : textA.split('\n');
    var linesB = textB === '' ? [] : textB.split('\n');
    var m = linesA.length, n = linesB.length;
    // Build LCS table
    var dp = [];
    for (var i = 0; i <= m; i++) {
        dp[i] = new Array(n + 1).fill(0);
    }
    for (var i = 1; i <= m; i++) {
        for (var j = 1; j <= n; j++) {
            dp[i][j] = linesA[i-1] === linesB[j-1]
                ? dp[i-1][j-1] + 1
                : Math.max(dp[i-1][j], dp[i][j-1]);
        }
    }
    // Backtrack to get diff
    var result = [];
    var i = m, j = n;
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && linesA[i-1] === linesB[j-1]) {
            result.unshift({ type: 'same', line: linesA[i-1] });
            i--; j--;
        } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
            result.unshift({ type: 'added', line: linesB[j-1] });
            j--;
        } else {
            result.unshift({ type: 'removed', line: linesA[i-1] });
            i--;
        }
    }
    return result;
}
```

---

## Functions to implement inside render()

### escapeHtml(str)
`str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')`

### renderDiff(result)
Build HTML string for `#diff-output`:
- For each item in result:
  - type === 'added'   → `<div class="diff-line diff-added">+ ` + escapeHtml(item.line) + `</div>`
  - type === 'removed' → `<div class="diff-line diff-removed">- ` + escapeHtml(item.line) + `</div>`
  - type === 'same'    → `<div class="diff-line diff-same">  ` + escapeHtml(item.line) + `</div>`
- Set `#diff-output` innerHTML to the full string

### updateSummary(result)
- added = result.filter items where type === 'added'
- removed = result.filter items where type === 'removed'
- Set `#diff-summary` textContent to:
  `'+' + added.length + ' added, -' + removed.length + ' removed'`

### Event wiring
- `#diff-run` click:
  1. Get textA from `#diff-a`, textB from `#diff-b`
  2. Run computeDiff(textA, textB)
  3. Call renderDiff(result)
  4. Call updateSummary(result)
- `#diff-clear` click → clear both textareas, clear `#diff-output`, clear `#diff-summary`

## Edge cases
- Both empty → run diff (will show nothing)
- One empty, one not → all lines shown as added or removed

## Do NOT
- Do not make it live/auto-update — only update on Compare button click
- Do not implement character-level diffing, only line-level
