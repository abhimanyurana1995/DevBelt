window.DevTools = window.DevTools || {};

/**
 * Custom function to decode base64 URL-safe encoded strings.
 * @param {string} str - The URL-safe base64 string.
 * @returns {string} The decoded string via atob().
 */
function base64UrlDecode(str) {
    // 1. Replace URL-safe characters with standard base64 characters
    let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // 2. Pad with '=' characters to make length a multiple of 4
    while (b64.length % 4) {
        b64 += '=';
    }
    // 3. Decode and return
    return atob(b64);
}

window.DevTools.jwt = {
  meta: { id: 'jwt', name: 'JWT Decoder', icon: '🔑' },
  render: function(container) {
    container.innerHTML = `
<div class="tool-panel">
  <h2 class="tool-panel-title">🔑 JWT Decoder</h2>
  <div class="tool-row">
    <div class="col">
      <label for="jwt-input">Input</label>
      <textarea id="jwt-input" placeholder="Paste JWT token here (header.payload.signature)"></textarea>
      <div class="btn-row">
        <button id="jwt-decode" class="primary">Decode</button>
        <button id="jwt-clear">Clear</button>
      </div >
      <div id="jwt-error" class="error-msg"></div>
    </div>
    <div class="col">
        <label>Output</label>
        <div id="jwt-result" style="display:none">
            <div class="jwt-section">
                <h3 class="jwt-title">Status</h3>
                <span id="jwt-status" class="badge"></span>
            </div >
            <div class="jwt-section">
                <h3 class="jwt-title">Header</h3>
                <pre id="jwt-header"></pre>
            </div>
            <div class="jwt-scroll">
                <div class="jwt-section">
                    <h3 class="jwt-title">Payload</h3>
                    <pre id="jwt-payload"></pre>
                </div>
                <div class="jwt-section">
                    <h3 class="jwt-title">Signature (raw, not verified)</h3>
                    <pre id="jwt-sig" style="word-break:break-all;white-space:pre-wrap"></pre>
                </div>
            </div>
        </div>
    </div>
  </div>
</div>
`;

    /**
     * Decodes the structure of a JWT token into its components (header, payload, signature).
     * @param {string} token - The full JWT token string.
     * @returns {{ok: boolean, header: object, payload: object, sig: string, error: string|null}}
     */
    function decodeJWT(token) {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return { ok: false, header: null, payload: null, sig: null, error: "Not a valid JWT (expected 3 parts separated by .)" };
        }

        try {
            const header = JSON.parse(base64UrlDecode(parts[0]));
            const payload = JSON.parse(base64UrlDecode(parts[1]));
            const signature = parts[2];
            
            return { ok: true, header: header, payload: payload, sig: signature, error: null };
        } catch (e) {
            if (e instanceof DOMException || e.message.includes('atob')) {
                 return { ok: false, header: null, payload: null, sig: null, error: "Failed to decode base64 components. Check padding." };
            }
            return { ok: false, header: null, payload: null, sig: null, error: `JSON parsing error: ${e.message}` };
        }
    }

    function getStatus(payload) {
        if (!payload || typeof payload !== 'object') {
            return { label: 'N/A', cls: '' };
        }
        const now = Math.floor(Date.now() / 1000);
        const exp = payload.exp;

        if (!exp) {
            return { label: 'No Expiry Claim', cls: 'jwt-badge-neutral' };
        }

        if (exp < now) {
            const date = new Date(exp * 1000);
            return { label: `Expired — ${date.toLocaleString()}`, cls: 'jwt-badge-expired' };
        }
        
        const date = new Date(exp * 1000);
        return { label: `Valid — expires ${date.toLocaleString()}`, cls: 'jwt-badge-valid' };
    }

    function prettyPrintPayload(payload) {
        // Use regex replacement to format date fields nicely
        let rawString = JSON.stringify(payload, null, 2);

        // Regex explanation:
        // ("(exp|iat|nbf)"): Matches "exp", "iat", or "nbf" key
        // \s*(\d+): Matches whitespace and captures the following digits (the timestamp)
        return rawString.replace(/"(exp|iat|nbf)":\s*(\d+)/g, function(match, key, val) {
            const date = new Date(parseInt(val) * 1000);
            return `"${key}": ${val}  // ${date.toLocaleString()}`;
        });
    }

    (function initializeTool() {
        const jwtInput = document.getElementById('jwt-input');
        const jwtError = document.getElementById('jwt-error');
        const jwtResult = document.getElementById('jwt-result');
        const decodeButton = document.getElementById('jwt-decode');
        const clearButton = document.getElementById('jwt-clear');
        const copyButton = document.getElementById('jwt-copy');

        const clearState = () => {
            jwtInput.value = '';
            jwtError.textContent = '';
            jwtResult.style.display = 'none';
            document.getElementById('jwt-header').textContent = '';
            document.getElementById('jwt-payload').textContent = '';
            document.getElementById('jwt-sig').textContent = '';
            document.getElementById('jwt-status').textContent = '';
        };

        const decodeAndDisplay = () => {
            const token = jwtInput.value.trim();
            if (!token) {
                jwtError.textContent = "Paste a JWT token token to decode.";
                jwtResult.style.display = 'none';
                return;
            }

            jwtError.textContent = '';
            jwtResult.style.display = 'block';
            
            const result = decodeJWT(token);

            if (!result.ok) {
                jwtError.textContent = `Decoding Error: ${result.error}`;
                document.getElementById('jwt-header').textContent = 'Failed';
                document.getElementById('jwt-payload').textContent = 'Failed';
                document.getElementById('jwt-sig').textContent = 'Failed';
                document.getElementById('jwt-status').textContent = 'Invalid Token';
                document.getElementById('jwt-status').className = 'badge jwt-badge-error';
                document.getElementById('jwt-result').style.display = 'block';
                return;
            }

            // Success path
            const statusProps = getStatus(result.payload);
            document.getElementById('jwt-status').textContent = statusProps.label;
            document.getElementById('jwt-status').className = `badge ${statusProps.cls}`;
            
            document.getElementById('jwt-header').textContent = JSON.stringify(result.header, null, 2);
            document.getElementById('jwt-payload').textContent = prettyPrintPayload(result.payload);
            document.getElementById('jwt-sig').textContent = result.sig;
            
            jwtError.textContent = '';
        };

        // Event Handlers
        decodeButton.onclick = decodeAndDisplay;
        clearButton.onclick = clearState;

        // Keydown listener for Enter key on textarea
        jwtInput.addEventListener('keydown', (e) => {
             if (e.key === 'Enter') {
                e.preventDefault();
                decodeAndDisplay();
            }
        });
    })();
  },
  destroy: function(container) {
    container.innerHTML = '';
  }
};