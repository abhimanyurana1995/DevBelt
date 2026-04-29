window.DevTools = window.DevTools || {};

window.DevTools.json = {
  meta: { id: 'json', name: 'JSON', icon: '{}' },
  render: function(container) {
    container.innerHTML = `
<div class="tool-panel">
  <h2 class="tool-panel-title">{} JSON Formatter</h2>
  <div class="tool-row">
    <div class="col">
      <label for="json-input">Input</label>
      <textarea id="json-input" placeholder="Paste JSON here..."></textarea>
      <div class="btn-row">
        <button id="json-format" class="primary">Format</button>
        <button id="json-minify">Minify</button>
        <button id="json-clear">Clear</button>
      </div >
      <div id="json-error" class="error-msg"></div>
    </div>
    <div class="col">
        <label>Output <button id="json-copy" class="sm">Copy</button></label>
        <pre id="json-output"></pre>
    </div>
  </div>
</div>
`;

    const inputElement = document.getElementById('json-input');
    const outputElement = document.getElementById('json-output');
    const errorElement = document.getElementById('json-error');
    const formatButton = document.getElementById('json-format');
    const minifyButton = document.getElementById('json-minify');
    const clearButton = document.getElementById('json-clear');
    const copyButton = document.getElementById('json-copy');

    /**
     * Formats a valid JSON string using indentation (space: 2).
     * @param {string} str - The JSON string input.
     * @returns {{ok: boolean, result: string, error: string|null}}
     */
    function formatJSON(str) {
        try {
            const parsed = JSON.parse(str);
            const formatted = JSON.stringify(parsed, null, 2);
            return { ok: true, result: formatted, error: null };
        } catch (e) {
            return { ok: false, result: null, error: e.message };
        }
    }

    /**
     * Minifies a valid JSON string (no whitespace).
     * @param {string} str - The JSON string input.
     * @returns {{ok: boolean, result: string, error: string|null}}
     */
    function minifyJSON(str) {
        try {
            const parsed = JSON.parse(str);
            const minified = JSON.stringify(parsed);
            return { ok: true, result: minified, error: null };
        } catch (e) {
            return { ok: false, result: null, error: e.message };
        }
    }

    (function initializeTool() {
        // Clear previous states
        outputElement.textContent = '';
        errorElement.textContent = '';
        inputElement.value = '';

        const updateOutput = (result, error) => {
            if (error) {
                errorElement.textContent = `Invalid JSON: ${error}`;
                outputElement.textContent = '';
                return false;
            } else {
                errorElement.textContent = '';
                outputElement.textContent = result;
                return true;
            }
        };

        // Event Handlers
        formatButton.onclick = () => {
            const inputStr = inputElement.value.trim();
            if (!inputStr) {
                updateOutput(null, "Input is empty");
                return;
            }
            const result = formatJSON(inputStr);
            updateOutput(result.result, result.error);
        };

        minifyButton.onclick = () => {
            const inputStr = inputElement.value.trim();
            if (!inputStr) {
                updateOutput(null, "Input is empty");
                return;
            }
            const result = minifyJSON(inputStr);
            updateOutput(result.result, result.error);
        };

        clearButton.onclick = () => {
            inputElement.value = '';
            outputElement.textContent = '';
            errorElement.textContent = '';
        };

        copyButton.onclick = () => {
            const textToCopy = outputElement.textContent;
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy);
            }
        };

        // Initialize: Set up initial bindings
    })();
  },
  destroy: function(container) {
    container.innerHTML = '';
  }
};