window.DevTools = window.DevTools || {};

window.DevTools.base64 = {
  meta: { id: 'base64', name: 'Base64', icon: '64' },
  render: function(container) {
    container.innerHTML = `
<div class="tool-panel">
  <h2 class="tool-panel-title">64 Base64 Encoder / Decoder</h2>
  <div class="tool-row">
    <div class="col">
      <label for="b64-input">Input</label>
      <textarea id="b64-input" placeholder="Text to encode, or Base64 to decode..."></textarea>
      <div class="btn-row">
        <button id="b64-encode" class="primary">Encode →</button>
        <button id="b64-decode">← Decode</button>
        <button id="b64-clear">Clear</button>
        <button id="b64-swap">⇅ Swap</button>
      </div >
      <div id="b64-error" class="error-msg"></div >
    </div>
    <div class="col">
        <label>Output <button id="b64-copy" class="sm">Copy</button></label>
        <textarea id="b64-output" readonly></textarea>
    </div>
  </div>
</div>
`;

    const inputElement = document.getElementById('b64-input');
    const outputElement = document.getElementById('b64-output');
    const errorElement = document.getElementById('b64-error');
    const encodeButton = document.getElementById('b64-encode');
    const decodeButton = document.getElementById('b64-decode');
    const clearButton = document.getElementById('b64-clear');
    const swapButton = document.getElementById('b64-swap');
    const copyButton = document.getElementById('b64-copy');

    /**
     * Encodes a UTF-8 string to Base64.
     * Handles Unicode correctly required by the spec.
     * @param {string} str - The string to encode.
     * @returns {{ok: boolean, result: string, error: string|null}}
     */
    function encode(str) {
        try {
            // Required pattern for handling Unicode in btoa()
            const encoded = btoa(unescape(encodeURIComponent(str)));
            return { ok: true, result: encoded, error: null };
        } catch (e) {
            return { ok: false, result: null, error: `Encoding failed: ${e.message}` };
        }
    }

    /**
     * Decodes a Base64 string back to UTF-8.
     * Handles various decoding errors.
     * @param {string} str - The Base64 string to decode.
     * @returns {{ok: boolean, result: string, error: string|null}}
     */
    function decode(str) {
        const trimmedStr = str.trim();
        if (!trimmedStr) {
            return { ok: false, result: null, error: "Input cannot be empty." };
        }
        try {
            // required pattern for restoring Unicode after atob()
            const decoded = decodeURIComponent(escape(atob(trimmedStr)));
            return { ok: true, result: decoded, error: null };
        } catch (e) {
            return { ok: false, result: null, error: 'Invalid Base64 string provided.' };
        }
    }

    (function initializeTool() {
        // Initial state cleanup
        outputElement.value = '';
        errorElement.textContent = '';
        inputElement.value = '';

        const updateOutput = (result, error) => {
            if (error) {
                errorElement.textContent = error;
                return false;
            } else {
                errorElement.textContent = '';
                return true;
            }
        };

        // Event Handlers
        encodeButton.onclick = () => {
            const inputStr = inputElement.value.trim();
            if (!inputStr) {
                updateOutput(null, "Input is empty.");
                return;
            }
            const result = encode(inputStr);
            if (updateOutput(result.result, result.error)) {
                outputElement.value = result.result;
            }
        };

        decodeButton.onclick = () => {
            const inputStr = inputElement.value.trim();
            if (!inputStr) {
                updateOutput(null, "Input is empty.");
                return;
            }
            const result = decode(inputStr);
            if (updateOutput(result.result, result.error)) {
                outputElement.value = result.result;
            }
        };

        clearButton.onclick = () => {
            inputElement.value = '';
            outputElement.value = '';
            errorElement.textContent = '';
        };

        swapButton.onclick = () => {
            const inputValue = inputElement.value;
            const outputValue = outputElement.value;
            inputElement.value = outputValue;
            outputElement.value = inputValue;
            errorElement.textContent = '';
        };

        copyButton.onclick = () => {
            const textToCopy = outputElement.value;
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy);
            }
        };
    })();
  },
  destroy: function(container) {
    container.innerHTML = '';
  }
};