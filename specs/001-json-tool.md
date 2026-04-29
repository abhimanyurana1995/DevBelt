# Spec 001: JSON Formatter

**Status:** [ ] ready  
**File:** `src/tools/json.js`  
**Depends on:** nothing

---

## Registration pattern (use exactly this)

```js
window.DevTools = window.DevTools || {};
window.DevTools.json = {
  meta: { id: 'json', name: 'JSON', icon: '{}' },
  render: function(container) { /* see below */ },
  destroy: function(container) { container.innerHTML = ''; }
};
```

---

## render(container) — set this innerHTML, then wire events

```html
<div class="tool-panel">
  <h2>{} JSON Formatter</h2>
  <div class="tool-row">
    <div class="col">
      <label>Input</label>
      <textarea id="json-input" placeholder="Paste JSON here..."></textarea>
      <div class="btn-row">
        <button id="json-format" class="primary">Format</button>
        <button id="json-minify">Minify</button>
        <button id="json-clear">Clear</button>
      </div>
      <div id="json-error" class="error-msg"></div>
    </div>
    <div class="col">
      <label>Output <button id="json-copy" class="sm">Copy</button></label>
      <pre id="json-output"></pre>
    </div>
  </div>
</div>
```

---

## Functions to implement inside render()

### formatJSON(str)
1. Call `JSON.parse(str)` — if it throws, return `{ ok: false, err: e.message }`
2. Call `JSON.stringify(parsed, null, 2)`
3. Return `{ ok: true, result: formatted }`

### minifyJSON(str)
1. Call `JSON.parse(str)` — if it throws, return `{ ok: false, err: e.message }`
2. Call `JSON.stringify(parsed)`
3. Return `{ ok: true, result: minified }`

### Event wiring (after setting innerHTML)
- `#json-format` click → run `formatJSON` on `#json-input` value → put result in `#json-output`, clear `#json-error`; on error set `#json-error` text
- `#json-minify` click → same but minifyJSON
- `#json-clear` click → set both textarea and pre to empty string, clear error
- `#json-copy` click → `navigator.clipboard.writeText(document.getElementById('json-output').textContent)`

## Edge cases
- Empty input → show error "Input is empty"
- Invalid JSON → show `#json-error` with the parse error message
- Copy when output is empty → do nothing

## Do NOT
- Do not define formatJSON or minifyJSON outside of render()
- Do not add any other buttons or features
- Do not use async/await
