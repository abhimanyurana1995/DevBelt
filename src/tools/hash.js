window.DevTools = window.DevTools || {};

/**
 * Converts an ArrayBuffer to a hexadecimal string.
 * @param {ArrayBuffer} buffer - The raw binary data.
 * @returns {string} The hexadecimal representation of the buffer.
 */
function bufferToHex(buffer) {
    const uint8Array = new Uint8Array(buffer);
    let hexString = '';
    for (const byte of uint8Array) {
        hexString += byte.toString(16).padStart(2, '0');
    }
    return hexString;
}

window.DevTools.hash = {
  meta: { id: 'hash', name: 'Hash', icon: '#' },
  render: function(container) {
    container.innerHTML = `
<div class="tool-panel">
  <h2 class="tool-panel-title"># Hash Generator</h2>
  <div class="tool-row">
    <div class="col">
      <label for="hash-input">Input Text</label>
      <textarea id="hash-input" placeholder="Enter text to hash..."></textarea>
      <div class="btn-row">
        <button id="hash-generate" class="primary">Generate SHA-256</button>
        <button id="hash-clear">Clear</button>
      </div >
      <div id="hash-error" class="error-msg"></div>
    </div>
    <div class="col">
        <label>SHA-256 Hash <button id="hash-copy" class="sm">Copy</button></label>
        <pre id="hash-output" style="flex:none;height:60px;word-break:break-all"></pre>
        <label style="margin-top:12px">Other Hashes</label>
        <div class="table-wrap" id="hash-table-wrap" style="display:none">
          <table class="kv-table">
            <thead><tr><th>Algorithm</th><th>Hash</th></tr></thead>
            <tbody id="hash-tbody"></tbody>
          </table>
        </div>
    </div>
  </div>
</div>
`;

    /**
     * Generates a hash digest for the given text and algorithm.
     * @param {string} text - The input text.
     * @param {string} algorithm - The cryptographic algorithm (e.g., 'SHA-256').
     * @returns {Promise<string>} A Promise that resolves with the hexadecimal hash string.
     */
    async function hashText(text, algorithm) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest(algorithm, data);
        return bufferToHex(hashBuffer);
    }

    (function initializeTool() {
        const inputElement = document.getElementById('hash-input');
        const outputElement = document.getElementById('hash-output');
        const errorElement = document.getElementById('hash-error');
        const generateButton = document.getElementById('hash-generate');
        const clearButton = document.getElementById('hash-clear');
        const copyButton = document.getElementById('hash-copy');
        const hashTableWrap = document.getElementById('hash-table-wrap');
        const hashTbody = document.getElementById('hash-tbody');

        const clearState = () => {
            inputElement.value = '';
            outputElement.textContent = '';
            errorElement.textContent = '';
            hashTableWrap.style.display = 'none';
            hashTbody.innerHTML = '';
        };

        const generateHashes = async () => {
            const text = inputElement.value.trim();
            if (!text) {
                errorElement.textContent = "Input is empty.";
                return;
            }
            
            errorElement.textContent = '';
            outputElement.textContent = 'Computing...';
            
            try {
                // 1. Generate primary hash
                const sha256 = await hashText(text, 'SHA-256');
                outputElement.textContent = sha256;

                // 2. Generate supporting hashes
                const [sha1, sha512] = await Promise.all([
                    hashText(text, 'SHA-1'),
                    hashText(text, 'SHA-512')
                ]);

                // Update table
                hashTbody.innerHTML = `
                    <tr><th style="width: 50%;">SHA-1</th><th style="word-break:break-all">${sha1}</th></tr >
                    <tr><th style="width: 50%;">SHA-512</th><th style="word-break:break-all">${sha512}</th></tr >
                `;
                hashTableWrap.style.display = 'block';
            } catch (e) {
                errorElement.textContent = `Hashing failed: ${e.message}. Ensure the browser supports Web Crypto API.`;
                outputElement.textContent = '';
                hashTableWrap.style.display = 'none';
            }
        };

        // Event Handlers
        generateButton.onclick = generateHashes;

        clearButton.onclick = clearState;

        copyButton.onclick = () => {
            const textToCopy = outputElement.textContent;
            if (textToCopy && textToCopy !== 'Computing...') {
                navigator.clipboard.writeText(textToCopy);
            }
        };
    })();
  },
  destroy: function(container) {
    container.innerHTML = '';
  }
};