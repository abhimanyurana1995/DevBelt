# Architecture — DevBelt

A browser-based developer utility belt. 10 tools, zero dependencies, works from file://.

## Stack
- Pure HTML/CSS/JS — no build step, no npm, no bundler
- Each tool is a self-contained JS file
- Tools register themselves on `window.DevTools`
- `main.js` reads `window.DevTools` and builds the nav + tab router

## File structure

```
src/
├── index.html          ← shell (Claude wrote — do not modify)
├── style.css           ← all styles (Claude wrote — do not modify)
├── main.js             ← router (Claude wrote — do not modify)
└── tools/
    ├── json.js         ← Gemma implements (spec 001)
    ├── base64.js       ← Gemma implements (spec 002)
    ├── url.js          ← Gemma implements (spec 003)
    ├── timestamp.js    ← Gemma implements (spec 004)
    ├── hash.js         ← Gemma implements (spec 005)
    ├── jwt.js          ← Gemma implements (spec 006)
    ├── color.js        ← Gemma implements (spec 007)
    ├── regex.js        ← Gemma implements (spec 008)
    ├── diff.js         ← Gemma implements (spec 009)
    └── markdown.js     ← Gemma implements (spec 010)
```

## How every tool file must look

```js
window.DevTools = window.DevTools || {};
window.DevTools.TOOLID = {
  meta: { id: 'TOOLID', name: 'Display Name', icon: 'emoji' },
  render: function(container) {
      container.innerHTML = '...';
      // wire up events here
  },
  destroy: function(container) {
      container.innerHTML = '';
  }
};
```

Rules:
- All logic goes INSIDE render() as local functions
- No functions defined outside the window.DevTools object
- No imports, no require(), no ES modules
- Element IDs are prefixed per tool (json-, b64-, url-, ts-, hash-, jwt-, color-, rx-, diff-, md-)
- Files must stay under 100 lines

## How to open the app
Open `src/index.html` in a browser. No server needed.
