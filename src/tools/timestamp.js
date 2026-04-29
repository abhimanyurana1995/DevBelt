window.DevTools = window.DevTools || {};

window.DevTools.timestamp = {
  meta: { id: 'timestamp', name: 'Timestamp', icon: '⏱' },
  render: function(container) {
    container.innerHTML = `
<div class="tool-panel">
  <h2 class="tool-panel-title">⏱ Timestamp Converter</h2>
  <div class="tool-row">
    <div class="col">
      <label for="ts-input">Input</label>
      <textarea id="ts-input" placeholder="Unix timestamp (seconds or ms) or date string (e.g. 2024-01-15)"></textarea>
      <div class="btn-row">
        <button id="ts-convert" class="primary">Convert</button>
        <button id="ts-now">Now</button>
        <button id="ts-clear">Clear</button>
      </div >
      <div id="ts-error" class="error-msg"></div>
    </div>
    <div class="col">
        <label>Output <button id="ts-copy" class="sm">Copy</button></label>
        <pre id="ts-output"></pre>
    </div>
  </div>
</div>
`;

    const inputElement = document.getElementById('ts-input');
    const outputElement = document.getElementById('ts-output');
    const errorElement = document.getElementById('ts-error');
    const convertButton = document.getElementById('ts-convert');
    const nowButton = document.getElementById('ts-now');
    const clearButton = document.getElementById('ts-clear');
    const copyButton = document.getElementById('ts-copy');

    /**
     * Parses the input string into a JavaScript Date object.
     * @param {string} str - The string to parse.
     * @returns {{ok: boolean, date: Date, error: string|null}}
     */
    function parseInput(str) {
        const trimmedStr = str.trim();
        if (!trimmedStr) {
            return { ok: false, date: null, error: 'Input cannot be empty.' };
        }

        let date;
        try {
            if (/^\d+$/.test(trimmedStr)) {
                const num = parseInt(trimmedStr);
                if (trimmedStr.length === 10) { // Unix seconds
                    date = new Date(num * 1000);
                } else if (trimmedStr.length === 13) { // Unix milliseconds
                    date = new Date(num);
                } else {
                    date = new Date(num); // Assume JS handles general integer conversion if needed
                }
            } else {
                date = new Date(trimmedStr);
            }
        } catch (e) {
            return { ok: false, date: null, error: 'Failed to create Date object.' };
        }

        if (isNaN(date.getTime())) {
            return { ok: false, date: null, error: 'Cannot parse date. Please ensure the format is valid.' };
        }

        return { ok: true, date: date, error: null };
    }

    /**
     * Calculates the relative time difference between two dates.
     * @param {Date} date - The date to compare against 'now'.
     * @returns {string} The formatted relative time string.
     */
    function relativeTime(date) {
        const diff = Math.abs(Date.now() - date.getTime());
        const seconds = Math.floor(diff / 1000);

        let interval = seconds / 60;
        let minutes = Math.floor(interval);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);
        
        if (seconds < 60) {
            return "just now";
        }

        if (minutes < 60) {
            return `${Math.round(minutes)} minute${minutes === 1 ? '' : 's'} ${diff > 0 ? 'ago' : 'from now'}`;
        }

        if (hours < 24) {
            return `${Math.round(hours)} hour${hours === 1 ? '' : 's'} ${diff > 0 ? 'ago' : 'from now'}`;
        }

        return `${Math.round(days)} day${days === 1 ? '' : 's'} ${diff > 0 ? 'ago' : 'from now'}`;
    }

    /**
     * Renders structured results into the output element.
     * @param {Date} date - The successfully parsed date.
     */
    function renderResults(date) {
        const options = [
            { name: 'Unix (seconds)', value: Math.floor(date.getTime() / 1000) },
            { name: 'Unix (ms)', value: date.getTime() },
            { name: 'ISO 8601', value: date.toISOString() },
            { name: 'UTC', value: date.toUTCString() },
            { name: 'Local', value: date.toLocaleString() },
            { name: 'Date only', value: date.toLocaleDateString() },
            { name: 'Time only', value: date.toLocaleTimeString() },
            { name: 'Relative', value: relativeTime(date) },
            { name: 'Day of week', value: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][date.getDay()] }
        ];

        let html = `
<table class="kv-table">
  <thead><tr><th>Format</th><th>Value</th></tr></thead>
  <tbody>
`;
        options.forEach(opt => {
            html += `<tr><td>${opt.name}</td><td>${opt.value}</td></tr>`;
        });

        html += `
  </tbody>
</table>`;

        outputElement.innerHTML = html;
        document.getElementById('ts-result').style.display = 'block';
        document.getElementById('ts-tbody').innerHTML = options.map(opt => `<tr><td>${opt.name}</td><td>${opt.value}</td></tr>`).join('');
    }

    (function initializeTool() {
        const inputElement = document.getElementById('ts-input');
        const outputElement = document.getElementById('ts-output');
        const errorElement = document.getElementById('ts-error');
        const convertButton = document.getElementById('ts-convert');
        const nowButton = document.getElementById('ts-now');
        const clearButton = document.getElementById('ts-clear');
        const copyButton = document.getElementById('ts-copy');

        const clearState = () => {
            inputElement.value = '';
            outputElement.innerHTML = '';
            errorElement.textContent = '';
            document.getElementById('ts-result').style.display = 'none';
            document.getElementById('ts-tbody').innerHTML = '';
        };


        const handleConvert = () => {
            const inputStr = inputElement.value.trim();
            if (!inputStr) {
                errorElement.textContent = 'Input is empty.';
                document.getElementById('ts-result').style.display = 'none';
                return;
            }
            
            const result = parseInput(inputStr);
            if (result.ok) {
                renderResults(result.date);
                errorElement.textContent = '';
            } else {
                errorElement.textContent = result.error;
                document.getElementById('ts-result').style.display = 'none';
            }
        };

        // Event Handlers
        convertButton.onclick = handleConvert;
        nowButton.onclick = () => {
            const nowSeconds = Math.floor(Date.now() / 1000);
            inputElement.value = nowSeconds;
            handleConvert();
        };
        clearButton.onclick = clearState;

        copyButton.onclick = () => {
            // Copy button is associated with the pre/output area, using innerHTML for content
            const textToCopy = outputElement.textContent; 
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy);
            }
        };
        
        // Keydown listener for Enter key on text area
        inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleConvert();
            }
        });
    })();
  },
  destroy: function(container) {
    container.innerHTML = '';
  }
};