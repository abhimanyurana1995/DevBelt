# Spec 004: Timestamp Converter

**Status:** [ ] ready  
**File:** `src/tools/timestamp.js`  
**Depends on:** nothing

---

## Registration pattern

```js
window.DevTools = window.DevTools || {};
window.DevTools.timestamp = {
  meta: { id: 'timestamp', name: 'Timestamp', icon: '⏱' },
  render: function(container) { /* see below */ },
  destroy: function(container) { container.innerHTML = ''; }
};
```

---

## render(container) — set this innerHTML, then wire events

```html
<div class="tool-panel">
  <h2>⏱ Timestamp Converter</h2>
  <div class="input-group" style="margin-bottom:16px">
    <input type="text" id="ts-input" placeholder="Unix timestamp or date string (e.g. 2024-01-15)" />
    <button id="ts-convert" class="primary">Convert</button>
    <button id="ts-now">Now</button>
    <button id="ts-clear">Clear</button>
  </div>
  <div id="ts-error" class="error-msg" style="margin-bottom:8px"></div>
  <div class="table-wrap" id="ts-result" style="display:none">
    <table class="kv-table">
      <thead><tr><th>Format</th><th>Value</th></tr></thead>
      <tbody id="ts-tbody"></tbody>
    </table>
  </div>
</div>
```

---

## Functions to implement inside render()

### parseInput(str)
1. str = str.trim()
2. If str matches `/^\d+$/` (all digits) → treat as Unix seconds: `new Date(parseInt(str) * 1000)`
3. If str matches `/^\d{13}$/` (13 digits) → treat as Unix milliseconds: `new Date(parseInt(str))`
4. Otherwise → `new Date(str)`
5. If `date.getTime()` is `NaN` → return `{ ok: false, err: 'Cannot parse date' }`
6. Return `{ ok: true, date: date }`

### relativeTime(date)
- diff = Date.now() - date.getTime() (milliseconds)
- if abs(diff) < 60000 → "just now"
- if abs(diff) < 3600000 → `Math.round(abs(diff)/60000)` + " minutes " + (diff>0 ? "ago" : "from now")
- if abs(diff) < 86400000 → `Math.round(abs(diff)/3600000)` + " hours " + (diff>0 ? "ago" : "from now")
- else → `Math.round(abs(diff)/86400000)` + " days " + (diff>0 ? "ago" : "from now")

### renderResults(date)
Build rows in `#ts-tbody` for these formats:
| Format | Value |
|--------|-------|
| Unix (seconds) | `Math.floor(date.getTime() / 1000)` |
| Unix (ms) | `date.getTime()` |
| ISO 8601 | `date.toISOString()` |
| UTC | `date.toUTCString()` |
| Local | `date.toLocaleString()` |
| Date only | `date.toLocaleDateString()` |
| Time only | `date.toLocaleTimeString()` |
| Relative | call `relativeTime(date)` |
| Day of week | `['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][date.getDay()]` |

Show `#ts-result`.

### Event wiring
- `#ts-convert` click → parseInput → on success renderResults, on error show `#ts-error`
- `#ts-now` click → set `#ts-input` value to `Math.floor(Date.now()/1000)`, then trigger convert
- `#ts-clear` click → clear input, hide result, clear error
- `#ts-input` keydown → if Enter key → trigger convert

## Do NOT
- Do not use moment.js or any library
- Do not add timezone selector
