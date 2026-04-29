# Spec 006: JWT Decoder

**Status:** [ ] ready  
**File:** `src/tools/jwt.js`  
**Depends on:** nothing

---

## Registration pattern

```js
window.DevTools = window.DevTools || {};
window.DevTools.jwt = {
  meta: { id: 'jwt', name: 'JWT Decoder', icon: '🔑' },
  render: function(container) { /* see below */ },
  destroy: function(container) { container.innerHTML = ''; }
};
```

---

## render(container) — set this innerHTML, then wire events

```html
<div class="tool-panel">
  <h2>🔑 JWT Decoder</h2>
  <div class="input-group" style="margin-bottom:12px">
    <input type="text" id="jwt-input" placeholder="Paste JWT token here (eyJ...)" />
    <button id="jwt-decode" class="primary">Decode</button>
    <button id="jwt-clear">Clear</button>
  </div>
  <div id="jwt-error" class="error-msg" style="margin-bottom:8px"></div>
  <div id="jwt-result" style="display:none">
    <div class="jwt-section">
      <h3>Status</h3>
      <span id="jwt-status"></span>
    </div>
    <div class="jwt-section">
      <h3>Header</h3>
      <pre id="jwt-header"></pre>
    </div>
    <div class="jwt-scroll">
      <div class="jwt-section">
        <h3>Payload</h3>
        <pre id="jwt-payload"></pre>
      </div>
      <div class="jwt-section">
        <h3>Signature (raw, not verified)</h3>
        <pre id="jwt-sig" style="word-break:break-all;white-space:pre-wrap"></pre>
      </div>
    </div>
  </div>
</div>
```

---

## Functions to implement inside render()

### base64UrlDecode(str)
1. Replace `-` with `+` and `_` with `/` in str
2. Add `=` padding: `str += '==='.slice(0, (4 - str.length % 4) % 4)`
3. `return atob(str)`

### decodeJWT(token)
1. Split token by `.` → must have exactly 3 parts, else return `{ ok: false, err: 'Not a valid JWT (expected 3 parts separated by .)' }`
2. Try `JSON.parse(base64UrlDecode(parts[0]))` → header object; on error return `{ ok: false, err: 'Cannot decode header' }`
3. Try `JSON.parse(base64UrlDecode(parts[1]))` → payload object; on error return `{ ok: false, err: 'Cannot decode payload' }`
4. Return `{ ok: true, header, payload, sig: parts[2] }`

### getStatus(payload)
- If payload has no `exp` field → return `{ label: 'No Expiry', cls: 'badge-noexp' }`
- `var now = Math.floor(Date.now() / 1000)`
- If `payload.exp > now` → return `{ label: 'Valid — expires ' + new Date(payload.exp * 1000).toLocaleString(), cls: 'badge-valid' }`
- Else → return `{ label: 'Expired — ' + new Date(payload.exp * 1000).toLocaleString(), cls: 'badge-expired' }`

### formatPayload(payload)
- `JSON.stringify(payload, null, 2)`
- Then replace lines containing `"exp"`, `"iat"`, `"nbf"` with an appended comment showing the human-readable date:
  - e.g., `"exp": 1700000000` → `"exp": 1700000000,   // 2023-11-14 ...`
- To do this: after stringify, use replace with regex:
  `/"(exp|iat|nbf)":\s*(\d+)/g` → `'"$1": $2  // ' + new Date(parseInt('$2') * 1000).toLocaleString()`
- Use a replace function (not a string): 
  ```js
  .replace(/"(exp|iat|nbf)":\s*(\d+)/g, function(match, key, val) {
      return '"' + key + '": ' + val + '  // ' + new Date(parseInt(val) * 1000).toLocaleString();
  })
  ```

### Event wiring
- `#jwt-decode` click:
  1. Get `#jwt-input` value, trim it
  2. If empty → show error "Paste a JWT token", return
  3. Call decodeJWT → if !ok show error, return
  4. Show `#jwt-result`
  5. Set `#jwt-header` text to `JSON.stringify(result.header, null, 2)`
  6. Set `#jwt-payload` text to `formatPayload(result.payload)`
  7. Set `#jwt-sig` text to result.sig
  8. Get status → set `#jwt-status` innerHTML to `<span class="badge CLASSNAME">LABEL</span>`
- `#jwt-clear` click → clear input, hide result, clear error

## Do NOT
- Do not verify the signature (no crypto needed)
- Do not use async/await
