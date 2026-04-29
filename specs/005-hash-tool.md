# Spec 005: Hash Generator (SHA-256)

**Status:** [ ] ready  
**File:** `src/tools/hash.js`  
**Depends on:** nothing

---

## Registration pattern

```js
window.DevTools = window.DevTools || {};
window.DevTools.hash = {
  meta: { id: 'hash', name: 'Hash', icon: '#' },
  render: function(container) { /* see below */ },
  destroy: function(container) { container.innerHTML = ''; }
};
```

---

## render(container) — set this innerHTML, then wire events

```html
<div class="tool-panel">
  <h2># Hash Generator</h2>
  <div class="tool-row">
    <div class="col">
      <label>Input Text</label>
      <textarea id="hash-input" placeholder="Enter text to hash..."></textarea>
      <div class="btn-row">
        <button id="hash-generate" class="primary">Generate SHA-256</button>
        <button id="hash-clear">Clear</button>
      </div>
      <div id="hash-error" class="error-msg"></div>
    </div>
    <div class="col">
      <label>SHA-256 Hash <button id="hash-copy" class="sm">Copy</button></label>
      <pre id="hash-output" style="flex:none;height:60px;word-break:break-all"></pre>
      <label style="margin-top:12px">Other Hashes</label>
      <div class="table-wrap" id="hash-table-wrap" style="display:none">
        <table class="kv-table">
          <thead><tr><th>Algorithm</th><th>Hash</th></tr></thead>
          <tbody id="hash-tbody"></tbody>
        </table>
      </div>
    </div>
  </div>
</div>
```

---

## Functions to implement inside render()

### bufferToHex(buffer)
- `buffer` is an ArrayBuffer
- `new Uint8Array(buffer)` → map each byte to `byte.toString(16).padStart(2, '0')` → join('')
- Return the hex string

### hashText(text, algorithm)
- `algorithm` is a string like 'SHA-256', 'SHA-1', 'SHA-512'
- `var data = new TextEncoder().encode(text)`
- `return crypto.subtle.digest(algorithm, data).then(function(buf) { return bufferToHex(buf); })`
- Returns a Promise<string>

### Event wiring — #hash-generate click:
```
1. var text = document.getElementById('hash-input').value
2. if text is empty → show error "Input is empty", return
3. clear error, set #hash-output text to "Computing..."
4. Call hashText(text, 'SHA-256')
   .then(function(hex) {
       document.getElementById('hash-output').textContent = hex;
       // Now also compute SHA-1 and SHA-512 for the table
       return Promise.all([
           hashText(text, 'SHA-1'),
           hashText(text, 'SHA-512')
       ]);
   })
   .then(function(results) {
       var tbody = document.getElementById('hash-tbody');
       tbody.innerHTML =
           '<tr><td>SHA-1</td><td style="word-break:break-all">' + results[0] + '</td></tr>' +
           '<tr><td>SHA-512</td><td style="word-break:break-all">' + results[1] + '</td></tr>';
       document.getElementById('hash-table-wrap').style.display = 'block';
   })
   .catch(function(e) {
       document.getElementById('hash-error').textContent = e.message;
   });
```

- `#hash-clear` click → clear textarea, pre, hide table, clear error
- `#hash-copy` click → `navigator.clipboard.writeText(document.getElementById('hash-output').textContent)`

## Do NOT
- Do not use MD5 (not available in Web Crypto)
- Do not use async/await — use .then() chains only (simpler for this file)
- Do not add file hashing
