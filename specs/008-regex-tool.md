# Spec 008: Regex Tester

**Status:** [ ] ready  
**File:** `src/tools/regex.js`  
**Depends on:** nothing

---

## Registration pattern

```js
window.DevTools = window.DevTools || {};
window.DevTools.regex = {
  meta: { id: 'regex', name: 'Regex', icon: '.*' },
  render: function(container) { /* see below */ },
  destroy: function(container) { container.innerHTML = ''; }
};
```

---

## render(container) — set this innerHTML, then wire events

```html
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
</div>
```

---

## Functions to implement inside render()

### escapeHtml(str)
`str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')`

### buildFlags()
Read checkboxes: `#rx-g`, `#rx-i`, `#rx-m`
Return a string of checked flags e.g. `'gi'`

### runTest()
1. Get pattern from `#rx-pattern`, text from `#rx-text`
2. Clear `#rx-error`
3. If pattern is empty → clear `#rx-highlighted` and `#rx-matches`, set `#rx-count` text to '', return
4. Try `new RegExp(pattern, buildFlags())` — if it throws → show error in `#rx-error`, return
5. Find all matches: use `text.matchAll(regex)` or a manual loop with `exec()` to get all matches and their indices
   ```js
   var matches = [];
   var m;
   var re = new RegExp(pattern, buildFlags());
   // if global flag is set, use exec loop:
   if (re.global) {
       while ((m = re.exec(text)) !== null) {
           matches.push(m);
           if (m[0].length === 0) re.lastIndex++; // avoid infinite loop on empty match
       }
   } else {
       m = re.exec(text);
       if (m) matches.push(m);
   }
   ```
6. Build highlighted output:
   - Walk through text, build HTML: non-matched text → escapeHtml, matched text → `<span class="match-highlight">` + escapeHtml + `</span>`
   - To do this: build result from index 0, for each match use `match.index` and `match.index + match[0].length`
   - Set `#rx-highlighted` innerHTML to result
7. Build match list in `#rx-matches`:
   - If no matches → innerHTML = `<div style="color:#555;font-size:12px;padding:4px">No matches</div>`
   - Else: for each match, build a `.match-item` div:
     `'<div class="match-item"><span style="color:#00d4ff">[' + i + ']</span> <span style="color:#ffcc00">"' + escapeHtml(match[0]) + '"</span> at index ' + match.index + (match.length > 1 ? ' — groups: ' + match.slice(1).join(', ') : '') + '</div>'`
8. Set `#rx-count` text to `matches.length + ' match' + (matches.length !== 1 ? 'es' : '')`

### Event wiring — live update on input:
- `#rx-pattern` input event → call runTest()
- `#rx-text` input event → call runTest()
- `#rx-g`, `#rx-i`, `#rx-m` change event → call runTest()
- `#rx-clear` click → clear pattern input, text textarea, error, highlighted, matches, count

## Do NOT
- Do not add a "Test" button — it must update live on every input event
- Do not use async/await
