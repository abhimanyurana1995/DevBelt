# Spec 002: Base64 Encoder / Decoder

**Status:** [ ] ready  
**File:** `src/tools/base64.js`  
**Depends on:** nothing

---

## Registration pattern

```js
window.DevTools = window.DevTools || {};
window.DevTools.base64 = {
  meta: { id: 'base64', name: 'Base64', icon: '64' },
  render: function(container) { /* see below */ },
  destroy: function(container) { container.innerHTML = ''; }
};
```

---

## render(container) — set this innerHTML, then wire events

```html
<div class="tool-panel">
  <h2>64 Base64 Encoder / Decoder</h2>
  <div class="tool-row">
    <div class="col">
      <label>Input</label>
      <textarea id="b64-input" placeholder="Text to encode, or Base64 to decode..."></textarea>
      <div class="btn-row">
        <button id="b64-encode" class="primary">Encode →</button>
        <button id="b64-decode">← Decode</button>
        <button id="b64-clear">Clear</button>
        <button id="b64-swap">⇅ Swap</button>
      </div>
      <div id="b64-error" class="error-msg"></div>
    </div>
    <div class="col">
      <label>Output <button id="b64-copy" class="sm">Copy</button></label>
      <textarea id="b64-output" readonly></textarea>
    </div>
  </div>
</div>
```

---

## Functions to implement inside render()

### encode(str)
- Use `btoa(unescape(encodeURIComponent(str)))` to handle Unicode
- Return `{ ok: true, result: encoded }`
- If btoa throws, return `{ ok: false, err: e.message }`

### decode(str)
- Trim whitespace from str first
- Use `decodeURIComponent(escape(atob(str)))` 
- Return `{ ok: true, result: decoded }`
- If atob throws, return `{ ok: false, err: 'Invalid Base64 string' }`

### Event wiring
- `#b64-encode` click → encode `#b64-input` value → put in `#b64-output`, clear error; on error show in `#b64-error`
- `#b64-decode` click → decode `#b64-input` value → put in `#b64-output`, clear error; on error show in `#b64-error`
- `#b64-clear` click → clear both textareas and error
- `#b64-swap` click → swap the values of `#b64-input` and `#b64-output`
- `#b64-copy` click → `navigator.clipboard.writeText(document.getElementById('b64-output').value)`

## Edge cases
- Empty input → show error "Input is empty"
- Invalid base64 on decode → show error message

## Do NOT
- Do not define encode/decode outside render()
- Do not use async/await
- Do not add file upload or any other input method
