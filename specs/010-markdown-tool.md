# Spec 010: Markdown Previewer

**Status:** [ ] ready  
**File:** `src/tools/markdown.js`  
**Depends on:** nothing

---

## Registration pattern

```js
window.DevTools = window.DevTools || {};
window.DevTools.markdown = {
  meta: { id: 'markdown', name: 'Markdown', icon: 'M↓' },
  render: function(container) { /* see below */ },
  destroy: function(container) { container.innerHTML = ''; }
};
```

---

## render(container) — set this innerHTML, then wire events

```html
<div class="tool-panel">
  <h2>M↓ Markdown Previewer</h2>
  <div class="tool-row">
    <div class="col">
      <label>Markdown <button id="md-clear" class="sm">Clear</button></label>
      <textarea id="md-input" placeholder="# Hello\n\nWrite **markdown** here..."></textarea>
    </div>
    <div class="col">
      <label>Preview <button id="md-copy-html" class="sm">Copy HTML</button></label>
      <div class="markdown-preview" id="md-preview"></div>
    </div>
  </div>
</div>
```

---

## The markdown parser — copy this exactly

Implement this function inside render():

```js
function parseMarkdown(raw) {
    var html = raw;
    // Escape HTML first (except we need to preserve code blocks)
    // Handle fenced code blocks first (before other replacements)
    var codeBlocks = [];
    html = html.replace(/```([\s\S]*?)```/g, function(_, code) {
        var idx = codeBlocks.length;
        codeBlocks.push('<pre><code>' + code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</code></pre>');
        return '\x00CODE' + idx + '\x00';
    });
    // Escape HTML in non-code content
    html = html.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    // Inline code
    html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    // Headers
    html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^##### (.+)$/gm,  '<h5>$1</h5>');
    html = html.replace(/^#### (.+)$/gm,   '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm,    '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm,     '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm,      '<h1>$1</h1>');
    // Bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g,          '<em>$1</em>');
    // Strikethrough
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
    // Links and images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%">');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,  '<a href="$2" target="_blank" rel="noopener">$1</a>');
    // Horizontal rule
    html = html.replace(/^---+$/gm, '<hr>');
    // Blockquote
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
    // Unordered lists (wrap consecutive li items)
    html = html.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>[\s\S]*?<\/li>)(\n(?!<li>)|$)/g, function(m) {
        return '<ul>' + m.replace(/\n$/, '') + '</ul>';
    });
    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    // Paragraphs: double newline → paragraph break
    html = html.replace(/\n\n+/g, '</p><p>');
    // Restore code blocks
    html = html.replace(/\x00CODE(\d+)\x00/g, function(_, idx) {
        return '</p>' + codeBlocks[parseInt(idx)] + '<p>';
    });
    return '<p>' + html + '</p>';
}
```

---

## Event wiring inside render()

- Set `#md-input` value to a starter example:
```
# Welcome to DevBelt Markdown

Write **bold**, *italic*, or `inline code`.

## Features

- Live preview
- Code blocks
- Links and more

\`\`\`
function hello() {
  return "world";
}
\`\`\`

[OpenCode](https://opencode.ai)
```
  (use a template literal or concatenated string for this)

- Call `update()` immediately after setting initial content to show preview on load

- Define `update()`:
  ```js
  function update() {
      document.getElementById('md-preview').innerHTML =
          parseMarkdown(document.getElementById('md-input').value);
  }
  ```

- `#md-input` input event → call `update()`
- `#md-clear` click → set `#md-input` value to '', call `update()`
- `#md-copy-html` click → `navigator.clipboard.writeText(document.getElementById('md-preview').innerHTML)`

## Do NOT
- Do not use marked.js or any markdown library
- Do not add export-to-PDF
- Do not add a toolbar with buttons
