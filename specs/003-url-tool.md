# Spec 003: URL Parser

**Status:** [ ] ready  
**File:** `src/tools/url.js`  
**Depends on:** nothing

---

## Registration pattern

```js
window.DevTools = window.DevTools || {};
window.DevTools.url = {
  meta: { id: 'url', name: 'URL Parser', icon: '🔗' },
  render: function(container) { /* see below */ },
  destroy: function(container) { container.innerHTML = ''; }
};
```

---

## render(container) — set this innerHTML, then wire events

```html
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
  <div id="url-params-wrap" style="margin-top:16px; display:none">
    <div style="font-size:11px;color:#777;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Query Parameters</div>
    <div class="table-wrap">
      <table class="kv-table">
        <thead><tr><th>Key</th><th>Value</th></tr></thead>
        <tbody id="url-params-tbody"></tbody>
      </table>
    </div>
  </div>
</div>
```

---

## Functions to implement inside render()

### parseURL(urlStr)
1. Try `new URL(urlStr)` — if it throws, return `{ ok: false, err: 'Invalid URL' }`
2. Return `{ ok: true, url: urlObject }`

### renderParts(urlObj)
Build rows for `#url-tbody` with these parts in order:
| Part | Value |
|------|-------|
| Protocol | `urlObj.protocol` |
| Host | `urlObj.host` |
| Hostname | `urlObj.hostname` |
| Port | `urlObj.port || '(default)'` |
| Pathname | `urlObj.pathname` |
| Search | `urlObj.search || '(none)'` |
| Hash | `urlObj.hash || '(none)'` |
| Origin | `urlObj.origin` |

Set each row as `<tr><td>name</td><td>value</td></tr>`

### renderParams(urlObj)
- If `urlObj.searchParams` has no entries → hide `#url-params-wrap`
- Otherwise: show `#url-params-wrap`, build `<tr>` rows for each `[key, value]` from `urlObj.searchParams.entries()`

### Event wiring
- `#url-parse` click → run parseURL on `#url-input` value → on success: show `#url-result`, call renderParts and renderParams; on error: show in `#url-error`, hide result tables
- `#url-clear` click → clear input, hide result and params, clear error
- `#url-input` keydown → if key is 'Enter', trigger `#url-parse` click

## Edge cases
- Empty input → show error "Please enter a URL"
- URL without scheme (e.g. "example.com") → try prepending "https://" before parsing; if still fails, show error

## Do NOT
- Do not use fetch
- Do not add encode/decode mode (keep it simple — parse only)
