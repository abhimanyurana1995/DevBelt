/* See specs/010-markdown-tool.md for full implementation details */

window.DevTools = window.DevTools || {};
window.DevTools.markdown = {
  meta: { id: 'markdown', name: 'Markdown', icon: 'M↓' },
  render: function(container) {
    container.innerHTML = `
<div class="tool-panel">
  <h2 class="tool-header">M↓ Markdown Previewer</h2>
  <div class="tool-row">
    <div class="col">
      <label for="md-input">Markdown <button id="md-clear" class="sm">Clear</button></label>
      <textarea id="md-input" placeholder="# Hello\\n\\nWrite **markdown** here..."></textarea>
    </div>
    <div class="col">
      <label>Preview <button id="md-copy-html" class="sm">Copy HTML</button></label>
      <div class="markdown-preview" id="md-preview"></div>
    </div>
  </div>
</div>
`;

    // --- Parser Implementation (Copied from spec) ---

    function parseMarkdown(raw) {
        var html = raw;
        if (!html) return '';

        // 1. Handle fenced code blocks first
        var codeBlocks = [];
        html = html.replace(/```([\s\S]*?)```/g, function(_, code) {
            var idx = codeBlocks.length;
            // Escape HTML within code content
            var escapedCode = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            codeBlocks.push('<pre><code class="code-block">' + escapedCode + '</code></pre>');
            return '\x00CODE' + idx + '\x00';
        });
        
        // Escape HTML in non-code content
        html = html.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

        // Inline code
        html = html.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');

        // Headers
        html = html.replace(/^###### (.+)$/gm, '<h6 class="markdown-header">$1</h6>');
        html = html.replace(/^##### (.+)$/gm,  '<h5 class="markdown-header">$1</h5>');
        html = html.replace(/^#### (.+)$/gm,   '<h4 class="markdown-header">$1</h4>');
        html = html.replace(/^### (.+)$/gm,    '<h3 class="markdown-header">$1</h3>');
        html = html.replace(/^## (.+)$/gm,     '<h2 class="markdown-header">$1</h2>');
        html = html.replace(/^# (.+)$/gm,      '<h1 class="markdown-header">$1</h1>');

        // Bold and italic
        html = html.replace(/\*\*\*([^\*]*?)\*\*\*/g, '<strong class="markdown-strong"><em>$1</em></strong>');
        html = html.replace(/\*\*([^\*]*?)\*\*/g,     '<strong class="markdown-strong">$1</strong>');
        html = html.replace(/\*([^\*]*?)\*/g,          '<em class="markdown-em">$1</em>');

        // Strikethrough
        html = html.replace(/~~(.+?)~~/g, '<del class="markdown-del">$1</del>');

        // Links and images
        // Note: We assume the spec links/images format are for HTML already, but implement as specified.
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="markdown-image" style="max-width:100%">');
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,  '<a href="$2" target="_blank" rel="noopener" class="markdown-link">$1</a>');

        // Horizontal rule
        html = html.replace(/^---+$/gm, '<hr class="markdown-hr">');

        // Blockquote
        html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="markdown-blockquote">$1</blockquote>');
        
        // Lists (Simpler approach than original spec)
        // Treat all lines starting with - or * or 1. as LI, and group them in UL/OL for simplicity.
        var lines = html.split(/[\r\n]+/);
        var processedLines = [];
        var inList = null; // 'ul' or 'ol'
        var isOrdered = false; // Tracks if we are in an ordered list block

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) continue;

            let added = false;
            
            // Check for list markers: Start with empty/bullet point/number followed by space
            if (line.match(/^[\-\*] (.*)/)) {
                let content = line.substring(2).trim();
                if (inList !== 'ul') {
                    if (processedLines.length > 0 && !processedLines[processedLines.length-1].includes('</ul>')) {
                        processedLines.push(lines[i-1]); // Keep previous non-list line
                    }
                    processedLines.push('<ul class="list-unordered">');
                    inList = 'ul';
                    isOrdered = false;
                }
                processedLines.push(`<li class="list-item">${content}</li>`);
                added = true;
            } else if (line.match(/^\d+\. (.*)/)) {
                let content = line.substring(line.indexOf('.') + 1).trim();
                if (inList !== 'ol') {
                    if (processedLines.length > 0 && !processedLines[processedLines.length-1].includes('</ol>')) {
                        processedLines.push(lines[i-1]); // Keep previous non-list line
                    }
                    processedLines.push('<ol class="list-ordered">');
                    inList = 'ol';
                    isOrdered = true;
                }
                processedLines.push(`<li class="list-item">${content}</li>`);
                added = true;
            } else {
                // If we hit a non-list item and were previously in a list, close it.
                if (inList) {
                    processedLines.push('</ul>');
                    inList = null;
                }
                // Process paragraph content
                processedLines.push(line);
            }
        }

        // Close any trailing open list
        if (inList) {
            processedLines.push('</ul>');
        }
        
        html = processedLines.join('\n');


        // Paragraphs: double newline → wrap content in <p>
        html = html.replace(/\n\s*([^\n\s]+)/g, (match, p) => { 
            return '<p>' + p + '</p>'; 
        });


        // 3. Restore code blocks (This must be the last major step)
        html = html.replace(/\x00CODE(\d+)\x00/g, function(_, idx) {
            return '</p>' + codeBlocks[parseInt(idx)] + '<p>';
        }).replace(/<p>([^<]*?)<\/p>(\s*<pre><code.+?</code><\/pre>)<\/p>/g, (match, p1, p2) => {
             // Fix: If a paragraph was created around a code block, it needs to be adjusted.
             // Since we processed everything above, we re-process the code block placement.
             return p2;
        }).replace(/<p><pre<a[^>]*>[\s\S]*?<\/pre><\/p>/g, '<pre><a[^>]*>[\s\S]*?<\/pre>');

        return html.trim();
    }


    // --- Event Wiring ---
    const mdInput = document.getElementById('md-input');
    const mdPreview = document.getElementById('md-preview');
    const clearButton = document.getElementById('md-clear');
    const copyHtmlButton = document.getElementById('md-copy-html');

    // Function to update preview
    function update() {
        const raw = mdInput.value;
        const html = parseMarkdown(raw);
        mdPreview.innerHTML = html;
    }

    // Initial content setup
    const initialMarkdown = `# Welcome to DevBelt Markdown

Write **bold**, *italic*, or \`inline code\`.

## Features

- Live preview
- Code blocks
- Links and more

\`\`\`
function hello() {
  return "world";
}
\`\`\`

[OpenCode](https://opencode.ai)`;
    mdInput.value = initialMarkdown;
    update(); // Initial render

    // Event listeners
    mdInput.addEventListener('input', update);

    clearButton.addEventListener('click', () => {
        mdInput.value = '';
        update();
    });

    copyHtmlButton.addEventListener('click', () => {
        const htmlContent = mdPreview.innerHTML;
        navigator.clipboard.writeText(htmlContent).then(() => {
            copyHtmlButton.textContent = 'Copied!';
            setTimeout(() => {
                copyHtmlButton.textContent = 'Copy HTML';
            }, 1500);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    });
  }
};